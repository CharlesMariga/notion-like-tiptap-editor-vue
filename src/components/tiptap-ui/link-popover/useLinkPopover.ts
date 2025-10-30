import { ref, watch, type MaybeRefOrGetter } from "vue";
import type { Editor } from "@tiptap/vue-3";

// --- Composables ---
import { useTiptapEditor } from "@/composables/useTiptapEditor";

// TODO: Create this icon component
// --- Icons ---
// import LinkIcon from "@/components/tiptap-icons/LinkIcon.vue";

// --- Lib ---
import { isMarkInSchema, sanitizeUrl } from "@/lib/tiptap-utils";

/**
 * Configuration for the link popover functionality
 */
export interface UseLinkPopoverConfig {
  /**
   * The Tiptap editor instance.
   */
  editor?: MaybeRefOrGetter<Editor | null | undefined>;
  /**
   * Whether to hide the link popover when not available.
   * @default false
   */
  hideWhenUnavailable?: boolean;
  /**
   * Callback function called when the link is set.
   */
  onSetLink?: () => void;
}

/**
 * Configuration for the link handler functionality
 */
export interface LinkHandlerProps {
  /**
   * The Tiptap editor instance.
   */
  editor: Editor | null;
  /**
   * Callback function called when the link is set.
   */
  onSetLink?: () => void;
}

/**
 * Checks if a link can be set in the current editor state
 */
export function canSetLink(editor: Editor | null): boolean {
  if (!editor || !editor.isEditable) return false;
  return editor.can().setMark("link");
}

/**
 * Checks if a link is currently active in the editor
 */
export function isLinkActive(editor: Editor | null): boolean {
  if (!editor || !editor.isEditable) return false;
  return editor.isActive("link");
}

/**
 * Determines if the link button should be shown
 */
export function shouldShowLinkButton(props: {
  editor: Editor | null;
  hideWhenUnavailable: boolean;
}): boolean {
  const { editor, hideWhenUnavailable } = props;

  const linkInSchema = isMarkInSchema("link", editor);

  if (!linkInSchema || !editor) {
    return false;
  }

  if (hideWhenUnavailable && !editor.isActive("code")) {
    return canSetLink(editor);
  }

  return true;
}

/**
 * Vue composable for handling link operations in a Tiptap editor
 */
export function useLinkHandler(props: LinkHandlerProps) {
  const { editor, onSetLink } = props;
  const url = ref<string | null>(null);

  // Get URL immediately when editor changes
  watch(
    () => editor,
    (currentEditor) => {
      if (!currentEditor) return;

      // Get URL immediately on mount
      const { href } = currentEditor.getAttributes("link");

      if (isLinkActive(currentEditor) && url.value === null) {
        url.value = href || "";
      }
    },
    { immediate: true }
  );

  // Update URL on selection changes
  watch(
    () => editor,
    (currentEditor) => {
      if (!currentEditor) return;

      const updateLinkState = () => {
        const { href } = currentEditor.getAttributes("link");
        url.value = href || "";
      };

      currentEditor.on("selectionUpdate", updateLinkState);
      return () => {
        currentEditor.off("selectionUpdate", updateLinkState);
      };
    },
    { immediate: true }
  );

  const setUrl = (newUrl: string | null) => {
    url.value = newUrl;
  };

  const setLink = () => {
    if (!url.value || !editor) return;

    const { selection } = editor.state;
    const isEmpty = selection.empty;

    let chain = editor.chain().focus();

    chain = chain.extendMarkRange("link").setLink({ href: url.value });

    if (isEmpty) {
      chain = chain.insertContent({ type: "text", text: url.value });
    }

    chain.run();

    url.value = null;

    onSetLink?.();
  };

  const removeLink = () => {
    if (!editor) return;
    editor
      .chain()
      .focus()
      .extendMarkRange("link")
      .unsetLink()
      .setMeta("preventAutolink", true)
      .run();
    url.value = "";
  };

  const openLink = (
    target: string = "_blank",
    features: string = "noopener,noreferrer"
  ) => {
    if (!url.value) return;

    const safeUrl = sanitizeUrl(url.value, window.location.href);
    if (safeUrl !== "#") {
      window.open(safeUrl, target, features);
    }
  };

  return {
    url,
    setUrl,
    setLink,
    removeLink,
    openLink,
  };
}

/**
 * Vue composable for link popover state management
 */
export function useLinkState(props: {
  editor: Editor | null;
  hideWhenUnavailable: boolean;
}) {
  const { editor, hideWhenUnavailable = false } = props;

  const isVisible = ref(false);

  const canSet = () => canSetLink(editor);
  const isActive = () => isLinkActive(editor);

  watch(
    () => editor,
    (currentEditor) => {
      if (!currentEditor) return;

      const handleSelectionUpdate = () => {
        isVisible.value = shouldShowLinkButton({
          editor: currentEditor,
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

  return {
    isVisible,
    canSet: canSet(),
    isActive: isActive(),
  };
}

/**
 * Main Vue composable that provides link popover functionality for Tiptap editor
 *
 * @example
 * ```ts
 * // Simple usage
 * function MyLinkButton() {
 *   const { isVisible, canSet, isActive, Icon, label } = useLinkPopover()
 *
 *   if (!isVisible.value) return null
 *
 *   return <button :disabled="!canSet">Link</button>
 * }
 *
 * // Advanced usage with configuration
 * function MyAdvancedLinkButton() {
 *   const { isVisible, canSet, isActive, Icon, label } = useLinkPopover({
 *     editor: myEditor,
 *     hideWhenUnavailable: true,
 *     onSetLink: () => console.log('Link set!')
 *   })
 *
 *   if (!isVisible.value) return null
 *
 *   return (
 *     <MyButton
 *       :disabled="!canSet"
 *       :aria-label="label"
 *       :aria-pressed="isActive"
 *     >
 *       <component :is="Icon" />
 *       {{ label }}
 *     </MyButton>
 *   )
 * }
 * ```
 */
export function useLinkPopover(config?: UseLinkPopoverConfig) {
  const {
    editor: providedEditor,
    hideWhenUnavailable = false,
    onSetLink,
  } = config || {};

  const { editor } = useTiptapEditor(providedEditor);

  const { isVisible, canSet, isActive } = useLinkState({
    editor: editor.value,
    hideWhenUnavailable,
  });

  const linkHandler = useLinkHandler({
    editor: editor.value,
    onSetLink,
  });

  return {
    isVisible,
    canSet,
    isActive,
    label: "Link",
    Icon: "div", // LinkIcon placeholder
    ...linkHandler,
  };
}
