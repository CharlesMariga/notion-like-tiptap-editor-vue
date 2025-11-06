import { computed, unref, type MaybeRef } from 'vue'
import type { Editor } from '@tiptap/vue-3'
import {
  defaultUiState,
  type UiState,
} from '@/components/tiptap-extension/ui-state-extension'

export function useUiEditorState(editor: MaybeRef<Editor | null | undefined>) {
  const aiGenerationIsSelection = computed(() => {
    const editorInstance = unref(editor)
    if (!editorInstance) return defaultUiState.aiGenerationIsSelection
    const state = editorInstance.storage.uiState as UiState
    return state?.aiGenerationIsSelection ?? defaultUiState.aiGenerationIsSelection
  })

  const aiGenerationIsLoading = computed(() => {
    const editorInstance = unref(editor)
    if (!editorInstance) return defaultUiState.aiGenerationIsLoading
    const state = editorInstance.storage.uiState as UiState
    return state?.aiGenerationIsLoading ?? defaultUiState.aiGenerationIsLoading
  })

  const aiGenerationActive = computed(() => {
    const editorInstance = unref(editor)
    if (!editorInstance) return defaultUiState.aiGenerationActive
    const state = editorInstance.storage.uiState as UiState
    return state?.aiGenerationActive ?? defaultUiState.aiGenerationActive
  })

  const aiGenerationHasMessage = computed(() => {
    const editorInstance = unref(editor)
    if (!editorInstance) return defaultUiState.aiGenerationHasMessage
    const state = editorInstance.storage.uiState as UiState
    return state?.aiGenerationHasMessage ?? defaultUiState.aiGenerationHasMessage
  })

  const commentInputVisible = computed(() => {
    const editorInstance = unref(editor)
    if (!editorInstance) return defaultUiState.commentInputVisible
    const state = editorInstance.storage.uiState as UiState
    return state?.commentInputVisible ?? defaultUiState.commentInputVisible
  })

  const lockDragHandle = computed(() => {
    const editorInstance = unref(editor)
    if (!editorInstance) return defaultUiState.lockDragHandle
    const state = editorInstance.storage.uiState as UiState
    return state?.lockDragHandle ?? defaultUiState.lockDragHandle
  })

  const isDragging = computed(() => {
    const editorInstance = unref(editor)
    if (!editorInstance) return defaultUiState.isDragging
    const state = editorInstance.storage.uiState as UiState
    return state?.isDragging ?? defaultUiState.isDragging
  })

  return {
    aiGenerationIsSelection,
    aiGenerationIsLoading,
    aiGenerationActive,
    aiGenerationHasMessage,
    commentInputVisible,
    lockDragHandle,
    isDragging,
  }
}
