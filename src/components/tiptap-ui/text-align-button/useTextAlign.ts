import { ref, computed, watch, type MaybeRefOrGetter } from "vue";
import { onKeyStroke } from "@vueuse/core";
import type { ChainedCommands } from "@tiptap/vue-3";
import { type Editor } from "@tiptap/vue-3";

// --- Composables ---
import { useTiptapEditor } from "@/composables/useTiptapEditor";
import { useIsMobile } from "@/composables/useIsMobile";

// --- Lib ---
import { isExtensionAvailable, isNodeTypeSelected } from "@/lib/tiptap-utils";

// TODO: Create these icon components
// --- Icons ---
// import AlignCenterIcon from "@/components/tiptap-icons/AlignCenterIcon.vue";
// import AlignJustifyIcon from "@/components/tiptap-icons/AlignJustifyIcon.vue";
// import AlignLeftIcon from "@/components/tiptap-icons/AlignLeftIcon.vue";
// import AlignRightIcon from "@/components/tiptap-icons/AlignRightIcon.vue";

export type TextAlign = "left" | "center" | "right" | "justify";

/**
 * Configuration for the text align functionality
 */
export interface UseTextAlignConfig {
  /**
   * The Tiptap editor instance.
   */
  editor?: MaybeRefOrGetter<Editor | null | undefined>;
  /**
   * The text alignment to apply.
   */
  align: TextAlign;
  /**
   * Whether the button should hide when alignment is not available.
   * @default false
   */
  hideWhenUnavailable?: boolean;
  /**
   * Callback function called after a successful alignment change.
   */
  onAligned?: () => void;
}

export const TEXT_ALIGN_SHORTCUT_KEYS: Record<TextAlign, string> = {
  left: "mod+shift+l",
  center: "mod+shift+e",
  right: "mod+shift+r",
  justify: "mod+shift+j",
};

// Placeholder icons until real ones are created
export const textAlignIcons = {
  left: "div", // AlignLeftIcon placeholder
  center: "div", // AlignCenterIcon placeholder
  right: "div", // AlignRightIcon placeholder
  justify: "div", // AlignJustifyIcon placeholder
};

export const textAlignLabels: Record<TextAlign, string> = {
  left: "Align left",
  center: "Align center",
  right: "Align right",
  justify: "Align justify",
};

/**
 * Checks if text alignment can be performed in the current editor state
 */
export function canSetTextAlign(
  editor: Editor | null,
  align: TextAlign
): boolean {
  if (!editor || !editor.isEditable) return false;
  if (
    !isExtensionAvailable(editor, "textAlign") ||
    isNodeTypeSelected(editor, ["image", "horizontalRule"])
  )
    return false;

  return editor.can().setTextAlign(align);
}

export function hasSetTextAlign(
  commands: ChainedCommands
): commands is ChainedCommands & {
  setTextAlign: (align: TextAlign) => ChainedCommands;
} {
  return "setTextAlign" in commands;
}

/**
 * Checks if the text alignment is currently active
 */
export function isTextAlignActive(
  editor: Editor | null,
  align: TextAlign
): boolean {
  if (!editor || !editor.isEditable) return false;
  return editor.isActive({ textAlign: align });
}

/**
 * Sets text alignment in the editor
 */
export function setTextAlign(editor: Editor | null, align: TextAlign): boolean {
  if (!editor || !editor.isEditable) return false;
  if (!canSetTextAlign(editor, align)) return false;

  const chain = editor.chain().focus();
  if (hasSetTextAlign(chain)) {
    return chain.setTextAlign(align).run();
  }

  return false;
}

/**
 * Determines if the text align button should be shown
 */
export function shouldShowButton(props: {
  editor: Editor | null;
  hideWhenUnavailable: boolean;
  align: TextAlign;
}): boolean {
  const { editor, hideWhenUnavailable, align } = props;

  if (!editor || !editor.isEditable) return false;
  if (!isExtensionAvailable(editor, "textAlign")) return false;

  if (hideWhenUnavailable && !editor.isActive("code")) {
    return canSetTextAlign(editor, align);
  }

  return true;
}

/**
 * Helper function to parse shortcut string for keyboard event matching
 */
function parseShortcut(shortcut: string) {
  const parts = shortcut.toLowerCase().split("+");
  const key = parts[parts.length - 1];

  return {
    key: key.toUpperCase(),
    alt: parts.includes("alt"),
    shift: parts.includes("shift"),
    ctrl: parts.includes("ctrl") || parts.includes("control"),
    meta: parts.includes("meta") || parts.includes("mod"),
  };
}

/**
 * Vue composable that provides text align functionality for Tiptap editor
 *
 * @example
 * ```ts
 * // Simple usage
 * function MySimpleAlignButton() {
 *   const { isVisible, handleTextAlign } = useTextAlign({ align: "center" })
 *
 *   if (!isVisible.value) return null
 *
 *   return <button @click="handleTextAlign">Align Center</button>
 * }
 *
 * // Advanced usage with configuration
 * function MyAdvancedAlignButton() {
 *   const { isVisible, handleTextAlign, label, isActive } = useTextAlign({
 *     editor: myEditor,
 *     align: "right",
 *     hideWhenUnavailable: true,
 *     onAligned: () => console.log('Text aligned!')
 *   })
 *
 *   if (!isVisible.value) return null
 *
 *   return (
 *     <MyButton
 *       @click="handleTextAlign"
 *       :aria-pressed="isActive"
 *       :aria-label="label"
 *     >
 *       Align Right
 *     </MyButton>
 *   )
 * }
 * ```
 */
export function useTextAlign(config: UseTextAlignConfig) {
  const {
    editor: providedEditor,
    align,
    hideWhenUnavailable = false,
    onAligned,
  } = config;

  const { editor } = useTiptapEditor(providedEditor);
  const isMobile = useIsMobile();
  const isVisible = ref(true);

  const canAlign = computed(() => canSetTextAlign(editor.value, align));
  const isActive = computed(() => isTextAlignActive(editor.value, align));

  const handleTextAlign = () => {
    if (!editor.value) return false;

    const success = setTextAlign(editor.value, align);
    if (success) {
      onAligned?.();
    }
    return success;
  };

  // Watch for editor selection changes to update visibility
  watch(
    editor,
    (currentEditor) => {
      if (!currentEditor) return;

      const handleSelectionUpdate = () => {
        isVisible.value = shouldShowButton({
          editor: currentEditor,
          align,
          hideWhenUnavailable,
        });
      };

      handleSelectionUpdate();

      currentEditor.on("selectionUpdate", handleSelectionUpdate);
      return () => {
        currentEditor.off("selectionUpdate", handleSelectionUpdate);
      };
    },
    { immediate: true }
  );

  // Keyboard shortcut handling
  const shortcut = parseShortcut(TEXT_ALIGN_SHORTCUT_KEYS[align]);
  onKeyStroke(shortcut.key, (event) => {
    const modifierPressed = shortcut.meta
      ? event.metaKey || event.ctrlKey
      : shortcut.ctrl
      ? event.ctrlKey
      : false;

    if (
      shortcut.alt === event.altKey &&
      shortcut.shift === event.shiftKey &&
      modifierPressed
    ) {
      if (isVisible.value && canAlign.value && !isMobile.value) {
        event.preventDefault();
        handleTextAlign();
      }
    }
  });

  return {
    isVisible,
    isActive,
    handleTextAlign,
    canAlign,
    label: textAlignLabels[align],
    shortcutKeys: TEXT_ALIGN_SHORTCUT_KEYS[align],
    Icon: textAlignIcons[align],
  };
}
