import { ref, type Ref } from "vue";
import type { Editor } from "@tiptap/vue-3";

/**
 * Composable to manage UI state for the editor
 * @param _editor - The Tiptap editor instance (reserved for future use)
 * @returns Object containing various UI state refs
 */
export function useUiEditorState(_editor: Ref<Editor | null | undefined>) {
  const lockDragHandle = ref(false);
  const aiGenerationActive = ref(false);
  const commentInputVisible = ref(false);

  // TODO: Add logic to update these states based on editor events
  // For now, these are just reactive references that can be used by components

  return {
    lockDragHandle,
    aiGenerationActive,
    commentInputVisible,
  };
}
