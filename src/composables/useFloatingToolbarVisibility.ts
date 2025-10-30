import { ref, watch, computed, toValue, onScopeDispose, type Ref, type MaybeRefOrGetter } from "vue";
import type { Editor } from "@tiptap/vue-3";

interface UseFloatingToolbarVisibilityOptions {
  editor: Ref<Editor | null | undefined>;
  isSelectionValid: (editor: Editor | null) => boolean;
  extraHideWhen?: MaybeRefOrGetter<boolean>;
}

/**
 * Composable to manage floating toolbar visibility
 * @param options - Configuration options
 * @returns Object containing shouldShow ref
 */
export function useFloatingToolbarVisibility(
  options: UseFloatingToolbarVisibilityOptions
) {
  const shouldShow = ref(false);

  const extraHideWhen = computed(() => toValue(options.extraHideWhen));

  watch(
    () => [options.editor.value, extraHideWhen.value] as const,
    ([editor, extraHide]) => {
      if (!editor) {
        shouldShow.value = false;
        return;
      }

      if (extraHide) {
        shouldShow.value = false;
        return;
      }

      shouldShow.value = options.isSelectionValid(editor);
    },
    { immediate: true }
  );

  // Watch for selection updates
  let cleanup: (() => void) | null = null;

  watch(
    () => options.editor.value,
    (editor, _oldEditor) => {
      // Clean up previous editor's event listener
      if (cleanup) {
        cleanup();
        cleanup = null;
      }

      if (!editor) return;

      const updateVisibility = () => {
        if (extraHideWhen.value) {
          shouldShow.value = false;
          return;
        }

        const isValid = options.isSelectionValid(editor);
        shouldShow.value = isValid;
      };

      editor.on("selectionUpdate", updateVisibility);
      editor.on("update", updateVisibility);
      editor.on("focus", updateVisibility);

      cleanup = () => {
        editor.off("selectionUpdate", updateVisibility);
        editor.off("update", updateVisibility);
        editor.off("focus", updateVisibility);
      };
    },
    { immediate: true }
  );

  // Clean up on component unmount
  onScopeDispose(() => {
    if (cleanup) {
      cleanup();
      cleanup = null;
    }
  });

  return {
    shouldShow,
  };
}
