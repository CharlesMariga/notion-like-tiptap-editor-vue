import { ref, watch, onBeforeUnmount, computed, type Component, markRaw } from 'vue'
import { type Editor } from '@tiptap/vue-3'

// --- Composables ---
import { useTiptapEditor } from './useTiptapEditor'

// --- Lib ---
import { isNodeTypeSelected } from '@/lib/tiptap-utils'

// --- Icons ---
import Redo2Icon from '@/components/tiptap-icons/Redo2Icon.vue'
import Undo2Icon from '@/components/tiptap-icons/Undo2Icon.vue'

export type UndoRedoAction = 'undo' | 'redo'

/**
 * Configuration for the history functionality
 */
export interface UseUndoRedoConfig {
  /**
   * The Tiptap editor instance.
   */
  editor?: Editor | null
  /**
   * The history action to perform (undo or redo).
   */
  action: UndoRedoAction
  /**
   * Whether the button should hide when action is not available.
   * @default false
   */
  hideWhenUnavailable?: boolean
  /**
   * Callback function called after a successful action execution.
   */
  onExecuted?: () => void
}

export const UNDO_REDO_SHORTCUT_KEYS: Record<UndoRedoAction, string> = {
  undo: 'mod+z',
  redo: 'mod+shift+z',
}

export const historyActionLabels: Record<UndoRedoAction, string> = {
  undo: 'Undo',
  redo: 'Redo',
}

export const historyIcons: Record<UndoRedoAction, Component> = {
  undo: markRaw(Undo2Icon),
  redo: markRaw(Redo2Icon),
}

/**
 * Checks if a history action can be executed
 */
export function canExecuteUndoRedoAction(
  editor: Editor | null,
  action: UndoRedoAction
): boolean {
  if (!editor || !editor.isEditable) return false
  if (isNodeTypeSelected(editor, ['image'])) return false

  return action === 'undo' ? editor.can().undo() : editor.can().redo()
}

/**
 * Executes a history action on the editor
 */
export function executeUndoRedoAction(
  editor: Editor | null,
  action: UndoRedoAction
): boolean {
  if (!editor || !editor.isEditable) return false
  if (!canExecuteUndoRedoAction(editor, action)) return false

  const chain = editor.chain().focus()
  return action === 'undo' ? chain.undo().run() : chain.redo().run()
}

/**
 * Determines if the history button should be shown
 */
export function shouldShowButton(props: {
  editor: Editor | null
  hideWhenUnavailable: boolean
  action: UndoRedoAction
}): boolean {
  const { editor, hideWhenUnavailable, action } = props

  if (!editor || !editor.isEditable) return false

  if (hideWhenUnavailable && !editor.isActive('code')) {
    return canExecuteUndoRedoAction(editor, action)
  }

  return true
}

/**
 * Custom composable that provides history functionality for Tiptap editor
 */
export function useUndoRedo(config: UseUndoRedoConfig) {
  const {
    editor: providedEditor,
    action,
    hideWhenUnavailable = false,
    onExecuted,
  } = config

  const { editor } = useTiptapEditor(providedEditor)
  const isVisible = ref<boolean>(true)
  const canExecute = computed(() => canExecuteUndoRedoAction(editor.value, action))

  const cleanup: (() => void)[] = []

  watch(
    editor,
    (newEditor) => {
      // Clear previous listeners
      cleanup.forEach((fn) => fn())
      cleanup.length = 0

      if (!newEditor) return

      const handleUpdate = () => {
        isVisible.value = shouldShowButton({
          editor: newEditor,
          hideWhenUnavailable,
          action,
        })
      }

      handleUpdate()

      newEditor.on('transaction', handleUpdate)

      cleanup.push(() => {
        newEditor.off('transaction', handleUpdate)
      })
    },
    { immediate: true }
  )

  onBeforeUnmount(() => {
    cleanup.forEach((fn) => fn())
  })

  const handleAction = () => {
    if (!editor.value) return false

    const success = executeUndoRedoAction(editor.value, action)
    if (success) {
      onExecuted?.()
    }
    return success
  }

  return {
    isVisible,
    handleAction,
    canExecute,
    label: historyActionLabels[action],
    shortcutKeys: UNDO_REDO_SHORTCUT_KEYS[action],
    Icon: historyIcons[action],
  }
}
