import { computed, type MaybeRefOrGetter, toValue } from "vue";
import type { Editor } from "@tiptap/vue-3";

/**
 * Composable for accessing the Tiptap editor instance
 * @param providedEditor - Optional editor instance or ref
 * @returns Object containing the editor instance
 */
export function useTiptapEditor(
  providedEditor?: MaybeRefOrGetter<Editor | null | undefined>
) {
  const editor = computed(() => {
    const editorValue = providedEditor ? toValue(providedEditor) : null;
    return editorValue;
  });

  return {
    editor,
  };
}
