import { ref, watch, onBeforeUnmount, nextTick, type Ref } from 'vue'
import { isNodeSelection, type Editor } from '@tiptap/vue-3'
import { NodeSelection, type Transaction } from '@tiptap/pm/state'

export const HIDE_FLOATING_META = 'hideFloatingToolbar'

/**
 * Centralizes all logic about when the floating toolbar should be hidden/shown.
 *
 * - Listens for transactions that carry HIDE_FLOATING_META
 * - Clears the hide flag on common "user intent" events
 * - Handles the "re-click on the same selected node" case
 * - Exposes `shouldShow` so UI can just render based on it
 * - Exposes helpers to set selections with the meta flag
 */
export function useFloatingToolbarVisibility(params: {
  editor: Editor | null
  isSelectionValid: (
    editor: Editor,
    selection: Editor['state']['selection']
  ) => boolean
  extraHideWhen?: Ref<boolean> | boolean // e.g. aiGenerationActive || commentInputVisible
}) {
  const { editor, isSelectionValid, extraHideWhen = false } = params
  const shouldShow = ref(false)
  const hideRef = ref(false)

  const getExtraHideValue = () => {
    return typeof extraHideWhen === 'object' ? extraHideWhen.value : extraHideWhen
  }

  const cleanupFns: (() => void)[] = []

  // --- TX listener: turn on hide when our meta is present
  if (editor) {
    const onTx = ({ transaction }: { transaction: Transaction }) => {
      if (transaction.getMeta(HIDE_FLOATING_META)) {
        hideRef.value = true
      }
    }

    editor.on('transaction', onTx)
    cleanupFns.push(() => {
      editor.off('transaction', onTx)
    })
  }

  // --- Re-click same selected node should immediately allow floating
  if (editor) {
    const dom = editor.view.dom

    const onPointerDown = (e: PointerEvent) => {
      if (!editor) return
      const sel = editor.state.selection
      if (!(sel instanceof NodeSelection)) return
      const nodeDom = editor.view.nodeDOM(sel.from) as HTMLElement | null
      if (!nodeDom) return
      if (nodeDom.contains(e.target as Node)) {
        hideRef.value = false
        // selection won't change, recompute now
        const valid = isSelectionValid(editor, sel)
        shouldShow.value = valid && !getExtraHideValue()
      }
    }

    dom.addEventListener('pointerdown', onPointerDown, { capture: true })
    cleanupFns.push(() =>
      dom.removeEventListener('pointerdown', onPointerDown, {
        capture: true,
      })
    )
  }

  // --- Selection-driven visibility
  watch(
    () => [editor?.state.selection, getExtraHideValue()],
    () => {
      if (!editor) return

      const { selection } = editor.state
      const valid = isSelectionValid(editor, selection)

      if (getExtraHideValue() || (isNodeSelection(selection) && hideRef.value)) {
        shouldShow.value = false
        return
      }
      shouldShow.value = valid
    },
    { immediate: true, deep: true }
  )

  if (editor) {
    const handleSelectionUpdate = () => {
      if (!editor) return

      // Use nextTick to ensure selection is fully established
      // This fixes issues with double-tap word selection
      nextTick(() => {
        if (!editor) return
        const { selection } = editor.state
        const valid = isSelectionValid(editor, selection)

        if (getExtraHideValue() || (isNodeSelection(selection) && hideRef.value)) {
          shouldShow.value = false
          return
        }
        shouldShow.value = valid
      })
    }

    handleSelectionUpdate()
    editor.on('selectionUpdate', handleSelectionUpdate)
    cleanupFns.push(() => {
      editor.off('selectionUpdate', handleSelectionUpdate)
    })
  }

  onBeforeUnmount(() => {
    cleanupFns.forEach((fn) => fn())
  })

  return { shouldShow }
}

/**
 * Programmatically select a node and hide floating for that selection
 * @param editor
 * @param pos
 */
export const selectNodeAndHideFloating = (editor: Editor, pos: number) => {
  if (!editor) return
  const { state, view } = editor
  view.dispatch(
    state.tr
      .setSelection(NodeSelection.create(state.doc, pos))
      .setMeta(HIDE_FLOATING_META, true)
  )
}

/**
 * Mark "hide floating" on the next relevant transaction (no selection change needed)
 * @param editor
 */
export const markHideFloatingOnNext = (editor: Editor) => {
  if (!editor) return
  editor.view.dispatch(editor.state.tr.setMeta(HIDE_FLOATING_META, true))
}
