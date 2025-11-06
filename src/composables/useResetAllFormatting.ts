import { ref, watch, onBeforeUnmount, computed, markRaw } from 'vue'
import { type Editor } from '@tiptap/vue-3'
import type { Transaction } from '@tiptap/pm/state'

// --- Composables ---
import { useTiptapEditor } from './useTiptapEditor'

// --- Icons ---
import RotateCcwIcon from '@/components/tiptap-icons/RotateCcwIcon.vue'

export const RESET_ALL_FORMATTING_SHORTCUT_KEY = 'mod+r'

/**
 * Configuration for the reset formatting functionality
 */
export interface UseResetAllFormattingConfig {
  /**
   * The Tiptap editor instance.
   */
  editor?: Editor | null
  /**
   * Whether the button should hide when resetting is not available.
   * @default false
   */
  hideWhenUnavailable?: boolean
  /**
   * Marks to preserve when resetting formatting.
   */
  preserveMarks?: string[]
  /**
   * Callback function called after formatting is successfully reset.
   */
  onResetAllFormatting?: () => void
}

/**
 * Removes all marks from the transaction except those specified in the skip array
 * @param tr The Tiptap transaction to modify
 * @param skip Array of mark names to skip when removing marks
 * @returns The modified transaction with specified marks removed
 */
export function removeAllMarksExcept(tr: Transaction, skip: string[] = []) {
  const { selection } = tr
  const { empty, ranges } = selection

  if (empty) return tr

  ranges.forEach((range) => {
    const from = range.$from.pos
    const to = range.$to.pos

    tr.doc.nodesBetween(from, to, (node, pos) => {
      if (!node.isInline) return true

      node.marks.forEach((mark) => {
        if (!skip.includes(mark.type.name)) {
          tr.removeMark(pos, pos + node.nodeSize, mark.type)
        }
      })

      return true
    })
  })

  return tr
}

/**
 * Checks whether the current selection has marks that can be reset (removed)
 * @param tr The Tiptap transaction to check
 * @param skip Array of mark names to skip when checking for removable marks
 * @returns True if there are marks that can be removed, false otherwise
 */
export function canResetMarks(tr: Transaction, skip: string[] = []): boolean {
  const { selection } = tr
  const { empty, ranges } = selection

  if (empty) return false

  for (const range of ranges) {
    const from = range.$from.pos
    const to = range.$to.pos

    let hasRemovableMarks = false

    tr.doc.nodesBetween(from, to, (node) => {
      if (!node.isInline) return true

      for (const mark of node.marks) {
        if (!skip.includes(mark.type.name)) {
          hasRemovableMarks = true
          return false
        }
      }

      return true
    })

    if (hasRemovableMarks) {
      return true
    }
  }

  return false
}

/**
 * Checks if formatting can be reset for a node
 */
export function canResetFormatting(
  editor: Editor | null,
  preserveMarks?: string[]
): boolean {
  if (!editor || !editor.isEditable) return false

  const tr = editor.state.tr
  return canResetMarks(tr, preserveMarks)
}

/**
 * Resets formatting for a node or selection
 */
export function resetFormatting(
  editor: Editor | null,
  preserveMarks?: string[]
): boolean {
  if (!editor || !editor.isEditable) return false

  try {
    const { view, state } = editor
    const { tr } = state
    const transaction = removeAllMarksExcept(tr, preserveMarks)

    view.dispatch(transaction)
    editor.commands.focus()
    return true
  } catch {
    return false
  }
}

/**
 * Determines if the reset formatting button should be shown
 */
export function shouldShowButton(props: {
  editor: Editor | null
  hideWhenUnavailable: boolean
  preserveMarks?: string[]
}): boolean {
  const { editor, hideWhenUnavailable, preserveMarks } = props

  if (!editor || !editor.isEditable) return false

  if (hideWhenUnavailable && !editor.isActive('code')) {
    return canResetFormatting(editor, preserveMarks)
  }

  return true
}

/**
 * Custom composable that provides reset formatting functionality for Tiptap editor
 */
export function useResetAllFormatting(config: UseResetAllFormattingConfig) {
  const {
    editor: providedEditor,
    preserveMarks,
    hideWhenUnavailable = false,
    onResetAllFormatting,
  } = config

  const { editor } = useTiptapEditor(providedEditor)
  const isVisible = ref<boolean>(true)
  const canReset = computed(() => canResetFormatting(editor.value, preserveMarks))

  const cleanup: (() => void)[] = []

  watch(
    editor,
    (newEditor) => {
      // Clear previous listeners
      cleanup.forEach((fn) => fn())
      cleanup.length = 0

      if (!newEditor) return

      const handleSelectionUpdate = () => {
        isVisible.value = shouldShowButton({
          editor: newEditor,
          hideWhenUnavailable,
          preserveMarks,
        })
      }

      handleSelectionUpdate()

      newEditor.on('selectionUpdate', handleSelectionUpdate)

      cleanup.push(() => {
        newEditor.off('selectionUpdate', handleSelectionUpdate)
      })
    },
    { immediate: true }
  )

  onBeforeUnmount(() => {
    cleanup.forEach((fn) => fn())
  })

  const handleResetFormatting = () => {
    if (!editor.value) return false

    const success = resetFormatting(editor.value, preserveMarks)
    if (success) {
      onResetAllFormatting?.()
    }
    return success
  }

  return {
    isVisible,
    handleResetFormatting,
    canReset,
    label: 'Reset formatting',
    shortcutKeys: RESET_ALL_FORMATTING_SHORTCUT_KEY,
    Icon: markRaw(RotateCcwIcon),
  }
}
