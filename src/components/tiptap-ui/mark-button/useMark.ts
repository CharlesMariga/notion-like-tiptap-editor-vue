import { ref, computed, watch, type MaybeRefOrGetter } from "vue";
import { onKeyStroke } from "@vueuse/core";
import type { Editor } from "@tiptap/vue-3";

// --- Composables ---
import { useTiptapEditor } from "@/composables/useTiptapEditor";
import { useIsMobile } from "@/composables/useIsMobile";

// --- Lib ---
import { isMarkInSchema, isNodeTypeSelected } from "@/lib/tiptap-utils";

// TODO: Create these icon components
// --- Icons ---
import BoldIcon from "@/components/tiptap-icons/BoldIcon.vue";
import Code2Icon from "@/components/tiptap-icons/Code2Icon.vue";
import ItalicIcon from "@/components/tiptap-icons/ItalicIcon.vue";
import StrikeIcon from "@/components/tiptap-icons/StrikeIcon.vue";
import SubscriptIcon from "@/components/tiptap-icons/SubscriptIcon.vue";
import SuperscriptIcon from "@/components/tiptap-icons/SuperscriptIcon.vue";
import UnderlineIcon from "@/components/tiptap-icons/UnderlineIcon.vue";

export type Mark =
  | "bold"
  | "italic"
  | "strike"
  | "code"
  | "underline"
  | "superscript"
  | "subscript";

/**
 * Configuration for the mark functionality
 */
export interface UseMarkConfig {
  /**
   * The Tiptap editor instance.
   */
  editor?: MaybeRefOrGetter<Editor | null | undefined>;
  /**
   * The type of mark to toggle
   */
  type: Mark;
  /**
   * Whether the button should hide when mark is not available.
   * @default false
   */
  hideWhenUnavailable?: boolean;
  /**
   * Callback function called after a successful mark toggle.
   */
  onToggled?: () => void;
}

// Placeholder icons until real ones are created
export const markIcons = {
  bold: BoldIcon,
  italic: ItalicIcon,
  underline: UnderlineIcon,
  strike: StrikeIcon,
  code: Code2Icon,
  superscript: SuperscriptIcon,
  subscript: SubscriptIcon,
};

export const MARK_SHORTCUT_KEYS: Record<Mark, string> = {
  bold: "mod+b",
  italic: "mod+i",
  underline: "mod+u",
  strike: "mod+shift+s",
  code: "mod+e",
  superscript: "mod+.",
  subscript: "mod+,",
};

/**
 * Checks if a mark can be toggled in the current editor state
 */
export function canToggleMark(editor: Editor | null, type: Mark): boolean {
  if (!editor || !editor.isEditable) return false;
  if (!isMarkInSchema(type, editor) || isNodeTypeSelected(editor, ["image"]))
    return false;

  return editor.can().toggleMark(type);
}

/**
 * Checks if a mark is currently active
 */
export function isMarkActive(editor: Editor | null, type: Mark): boolean {
  if (!editor || !editor.isEditable) return false;
  return editor.isActive(type);
}

/**
 * Toggles a mark in the editor
 */
export function toggleMark(editor: Editor | null, type: Mark): boolean {
  if (!editor || !editor.isEditable) return false;
  if (!canToggleMark(editor, type)) return false;

  return editor.chain().focus().toggleMark(type).run();
}

/**
 * Determines if the mark button should be shown
 */
export function shouldShowButton(props: {
  editor: Editor | null;
  type: Mark;
  hideWhenUnavailable: boolean;
}): boolean {
  const { editor, type, hideWhenUnavailable } = props;

  if (!editor || !editor.isEditable) return false;
  if (!isMarkInSchema(type, editor)) return false;

  if (hideWhenUnavailable && !editor.isActive("code")) {
    return canToggleMark(editor, type);
  }

  return true;
}

/**
 * Gets the formatted mark name
 */
export function getFormattedMarkName(type: Mark): string {
  return type.charAt(0).toUpperCase() + type.slice(1);
}

/**
 * Helper function to parse shortcut string for keyboard event matching
 */
function parseShortcut(shortcut: string) {
  const parts = shortcut.toLowerCase().split("+");
  const key = parts[parts.length - 1] || "";

  return {
    key: key.toUpperCase(),
    alt: parts.includes("alt"),
    shift: parts.includes("shift"),
    ctrl: parts.includes("ctrl") || parts.includes("control"),
    meta: parts.includes("meta") || parts.includes("mod"),
  };
}

/**
 * Vue composable that provides mark functionality for Tiptap editor
 *
 * @example
 * ```ts
 * // Simple usage
 * function MySimpleBoldButton() {
 *   const { isVisible, handleMark } = useMark({ type: "bold" })
 *
 *   if (!isVisible.value) return null
 *
 *   return <button @click="handleMark">Bold</button>
 * }
 *
 * // Advanced usage with configuration
 * function MyAdvancedItalicButton() {
 *   const { isVisible, handleMark, label, isActive } = useMark({
 *     editor: myEditor,
 *     type: "italic",
 *     hideWhenUnavailable: true,
 *     onToggled: () => console.log('Mark toggled!')
 *   })
 *
 *   if (!isVisible.value) return null
 *
 *   return (
 *     <MyButton
 *       @click="handleMark"
 *       :aria-pressed="isActive"
 *       :aria-label="label"
 *     >
 *       Italic
 *     </MyButton>
 *   )
 * }
 * ```
 */
export function useMark(config: UseMarkConfig) {
  const {
    editor: providedEditor,
    type,
    hideWhenUnavailable = false,
    onToggled,
  } = config;

  const { editor } = useTiptapEditor(providedEditor);
  const isMobile = useIsMobile();
  const isVisible = ref(true);

  const canToggle = computed(() => canToggleMark(editor.value ?? null, type));
  const isActive = computed(() => isMarkActive(editor.value ?? null, type));

  const handleMark = () => {
    if (!editor.value) return false;

    const success = toggleMark(editor.value, type);
    if (success) {
      onToggled?.();
    }
    return success;
  };

  // Watch for editor selection changes to update visibility
  watch(
    editor,
    (currentEditor, _, onCleanup) => {
      if (!currentEditor) return;

      const handleSelectionUpdate = () => {
        isVisible.value = shouldShowButton({
          editor: currentEditor,
          type,
          hideWhenUnavailable,
        });
      };

      handleSelectionUpdate();

      currentEditor.on("selectionUpdate", handleSelectionUpdate);
      onCleanup(() => {
        currentEditor.off("selectionUpdate", handleSelectionUpdate);
      });
    },
    { immediate: true }
  );

  // Keyboard shortcut handling
  const shortcut = parseShortcut(MARK_SHORTCUT_KEYS[type]);
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
      if (isVisible.value && canToggle.value && !isMobile.value) {
        event.preventDefault();
        handleMark();
      }
    }
  });

  return {
    isVisible,
    isActive,
    handleMark,
    canToggle,
    label: getFormattedMarkName(type),
    shortcutKeys: MARK_SHORTCUT_KEYS[type],
    Icon: markIcons[type],
  };
}
