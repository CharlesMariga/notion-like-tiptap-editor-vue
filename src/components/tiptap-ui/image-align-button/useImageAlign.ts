import { ref, computed, watch, type MaybeRefOrGetter } from "vue";
import { onKeyStroke } from "@vueuse/core";
import type { Editor } from "@tiptap/vue-3";

// --- Composables ---
import { useTiptapEditor } from "@/composables/useTiptapEditor";
import { useIsMobile } from "@/composables/useIsMobile";

// --- Lib ---
import { isExtensionAvailable } from "@/lib/tiptap-utils";

// TODO: Create these icon components
// --- Icons ---
// import AlignCenterVerticalIcon from "@/components/tiptap-icons/AlignCenterVerticalIcon.vue";
// import AlignEndVerticalIcon from "@/components/tiptap-icons/AlignEndVerticalIcon.vue";
// import AlignStartVerticalIcon from "@/components/tiptap-icons/AlignStartVerticalIcon.vue";

export type ImageAlign = "left" | "center" | "right";

/**
 * Configuration for the image align functionality
 */
export interface UseImageAlignConfig {
  /**
   * The Tiptap editor instance.
   */
  editor?: MaybeRefOrGetter<Editor | null | undefined>;
  /**
   * The image alignment to apply.
   */
  align: ImageAlign;
  /**
   * The name of the image extension to target.
   * @default "image"
   */
  extensionName?: string;
  /**
   * The attribute name used for alignment.
   * @default "data-align"
   */
  attributeName?: string;
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

export const IMAGE_ALIGN_SHORTCUT_KEYS: Record<ImageAlign, string> = {
  left: "alt+shift+l",
  center: "alt+shift+e",
  right: "alt+shift+r",
};

// Placeholder icons until actual icon components are created
export const imageAlignIcons = {
  left: "div", // AlignStartVerticalIcon
  center: "div", // AlignCenterVerticalIcon
  right: "div", // AlignEndVerticalIcon
};

export const imageAlignLabels: Record<ImageAlign, string> = {
  left: "Image align left",
  center: "Image align center",
  right: "Image align right",
};

/**
 * Checks if image alignment can be performed in the current editor state
 */
export function canSetImageAlign(
  editor: Editor | null,
  align: ImageAlign,
  extensionName: string = "image",
  attributeName: string = "data-align"
): boolean {
  if (!editor || !editor.isEditable) return false;
  if (!isExtensionAvailable(editor, [extensionName])) return false;

  return editor
    .can()
    .updateAttributes(extensionName, { [attributeName]: align });
}

/**
 * Checks if the image alignment is currently active
 */
export function isImageAlignActive(
  editor: Editor | null,
  align: ImageAlign,
  extensionName: string = "image",
  attributeName: string = "data-align"
): boolean {
  if (!editor || !editor.isEditable) return false;
  if (!isExtensionAvailable(editor, [extensionName])) return false;

  const attributes = editor.getAttributes(extensionName);
  const currentAlign = attributes[attributeName] || "left";
  return currentAlign === align;
}

/**
 * Sets image alignment in the editor
 */
export function setImageAlign(
  editor: Editor | null,
  align: ImageAlign,
  extensionName: string = "image",
  attributeName: string = "data-align"
): boolean {
  if (!editor || !editor.isEditable) return false;
  if (!isExtensionAvailable(editor, [extensionName])) return false;
  if (!canSetImageAlign(editor, align, extensionName, attributeName))
    return false;

  try {
    return editor
      .chain()
      .focus()
      .updateAttributes(extensionName, { [attributeName]: align })
      .run();
  } catch {
    return false;
  }
}

/**
 * Determines if the image align button should be shown
 */
export function shouldShowButton(props: {
  editor: Editor | null;
  hideWhenUnavailable: boolean;
  align: ImageAlign;
  extensionName?: string;
  attributeName?: string;
}): boolean {
  const {
    editor,
    hideWhenUnavailable,
    align,
    extensionName = "image",
    attributeName = "data-align",
  } = props;

  if (!editor || !editor.isEditable) return false;
  if (!isExtensionAvailable(editor, [extensionName])) return false;

  if (hideWhenUnavailable) {
    return canSetImageAlign(editor, align, extensionName, attributeName);
  }

  return true;
}

/**
 * Vue composable that provides image align functionality for Tiptap editor
 *
 * @example
 * ```ts
 * // Simple usage with default "image" extension
 * function MySimpleImageAlignButton() {
 *   const { isVisible, handleImageAlign } = useImageAlign({ align: "center" })
 *
 *   if (!isVisible.value) return null
 *
 *   return <button @click="handleImageAlign">Align Center</button>
 * }
 *
 * // Advanced usage with custom extension name
 * function MyAdvancedImageAlignButton() {
 *   const { isVisible, handleImageAlign, label, isActive } = useImageAlign({
 *     editor: myEditor,
 *     align: "right",
 *     extensionName: "myCustomImage", // Use your custom extension name
 *     hideWhenUnavailable: true,
 *     onAligned: () => console.log('Image aligned!')
 *   })
 *
 *   if (!isVisible.value) return null
 *
 *   return (
 *     <MyButton
 *       @click="handleImageAlign"
 *       :aria-pressed="isActive"
 *       :aria-label="label"
 *     >
 *       Align Right
 *     </MyButton>
 *   )
 * }
 * ```
 */
export function useImageAlign(config: UseImageAlignConfig) {
  const {
    editor: providedEditor,
    align,
    extensionName = "image",
    attributeName = "data-align",
    hideWhenUnavailable = false,
    onAligned,
  } = config;

  const { editor } = useTiptapEditor(providedEditor);
  const isMobile = useIsMobile();
  const isVisible = ref(true);

  const canAlign = computed(() =>
    canSetImageAlign(editor.value, align, extensionName, attributeName)
  );

  const isActive = computed(() =>
    isImageAlignActive(editor.value, align, extensionName, attributeName)
  );

  const handleImageAlign = () => {
    if (!editor.value) return false;

    const success = setImageAlign(
      editor.value,
      align,
      extensionName,
      attributeName
    );
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
          extensionName,
          attributeName,
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
  const shortcutKey = IMAGE_ALIGN_SHORTCUT_KEYS[align];

  // Parse the shortcut key (e.g., "alt+shift+l" -> {alt: true, shift: true, key: "l"})
  const parseShortcut = (shortcut: string) => {
    const parts = shortcut.toLowerCase().split("+");
    const key = parts[parts.length - 1];
    const modifiers = {
      alt: parts.includes("alt"),
      shift: parts.includes("shift"),
      ctrl: parts.includes("ctrl") || parts.includes("control"),
      meta: parts.includes("meta") || parts.includes("mod"),
    };
    return { key, ...modifiers };
  };

  const shortcut = parseShortcut(shortcutKey);

  onKeyStroke(shortcut.key, (event) => {
    // Check if all required modifiers are pressed
    if (
      shortcut.alt === event.altKey &&
      shortcut.shift === event.shiftKey &&
      shortcut.ctrl === event.ctrlKey &&
      (shortcut.meta === event.metaKey || shortcut.meta === event.ctrlKey)
    ) {
      if (isVisible.value && canAlign.value && !isMobile.value) {
        event.preventDefault();
        handleImageAlign();
      }
    }
  });

  return {
    isVisible,
    isActive,
    handleImageAlign,
    canAlign,
    label: computed(() => imageAlignLabels[align]),
    shortcutKeys: shortcutKey,
    Icon: imageAlignIcons[align],
  };
}
