import { computed, inject, unref, type ComputedRef, type MaybeRef } from 'vue'
import type { Editor } from '@tiptap/vue-3'

/**
 * Composable that provides access to a Tiptap editor instance.
 *
 * Accepts an optional editor instance directly, or falls back to retrieving
 * the editor from the parent context via inject. This allows components
 * to work both when given an editor directly and when used within a Tiptap
 * editor context.
 *
 * @param providedEditor - Optional editor instance to use instead of the context editor
 * @returns The provided editor or the editor from context, whichever is available
 */
export function useTiptapEditor(providedEditor?: MaybeRef<Editor | null>): {
  editor: ComputedRef<Editor | null>
  editorState: ComputedRef<Editor['state'] | undefined>
  canCommand: ComputedRef<ReturnType<Editor['can']> | undefined>
} {
  // Try to inject editor from parent context if not provided
  const injectedEditor = inject<MaybeRef<Editor | null>>('editor', null)

  const editor = computed(() => {
    const provided = unref(providedEditor)
    const injected = unref(injectedEditor)

    if (provided) return provided
    return injected
  })

  const editorState = computed(() => {
    if (!editor.value) {
      return undefined
    }
    return editor.value.state
  })

  const canCommand = computed(() => {
    if (!editor.value) {
      return undefined
    }
    return editor.value.can()
  })

  return {
    editor,
    editorState,
    canCommand,
  }
}
