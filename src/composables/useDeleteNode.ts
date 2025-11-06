import { computed, ref, watch, onMounted, onBeforeUnmount, markRaw } from 'vue'
import type { Editor } from '@tiptap/vue-3'
import { NodeSelection } from '@tiptap/pm/state'
import { useTiptapEditor } from '@/composables/useTiptapEditor'
import { useIsMobile } from '@/composables/useMobile'
import TrashIcon from '@/components/tiptap-icons/TrashIcon.vue'

export const DELETE_NODE_SHORTCUT_KEY = 'backspace'

/**
 * Configuration for the delete node functionality
 */
export interface UseDeleteNodeConfig {
  /**
   * The Tiptap editor instance.
   */
  editor?: Editor | null
  /**
   * Whether the button should hide when node deletion is not available.
   * @default false
   */
  hideWhenUnavailable?: boolean
  /**
   * Callback function called after a successful deletion.
   */
  onDeleted?: () => void
}

/**
 * Checks if a node can be deleted based on the current selection
 */
export function canDeleteNode(editor: Editor | null): boolean {
  if (!editor || !editor.isEditable) return false

  const { state } = editor
  const { selection } = state

  if (selection instanceof NodeSelection) {
    return true
  }

  const $pos = selection.$anchor

  for (let depth = $pos.depth; depth > 0; depth--) {
    const node = $pos.node(depth)
    const pos = $pos.before(depth)

    // Check if we could delete the range from pos to pos + nodeSize
    const tr = state.tr.delete(pos, pos + node.nodeSize)
    if (tr.doc !== state.doc) {
      return true
    }
  }

  return false
}

/**
 * Helper function to delete a node with fallback strategy
 */
export function deleteNodeAtPosition(
  editor: Editor,
  pos: number,
  nodeSize: number
): boolean {
  const chain = editor.chain().focus()
  const success = chain.deleteRange({ from: pos, to: pos + nodeSize }).run()

  if (success) return true

  // Fallback
  return chain.setNodeSelection(pos).deleteSelection().run()
}

/**
 * Deletes the selected node in the editor using current selection
 */
export function deleteNode(editor: Editor | null): boolean {
  if (!editor || !editor.isEditable) return false

  try {
    const { state } = editor
    const { selection } = state

    if (selection instanceof NodeSelection) {
      const pos = selection.from
      const selectedNode = selection.node

      if (!selectedNode) return false

      return deleteNodeAtPosition(editor, pos, selectedNode.nodeSize)
    }

    const $pos = selection.$anchor

    for (let depth = $pos.depth; depth > 0; depth--) {
      const node = $pos.node(depth)
      const pos = $pos.before(depth)

      if (node && node.isBlock) {
        return deleteNodeAtPosition(editor, pos, node.nodeSize)
      }
    }

    return false
  } catch {
    return false
  }
}

/**
 * Determines if the delete node button should be shown
 */
export function shouldShowButton(props: {
  editor: Editor | null
  hideWhenUnavailable: boolean
}): boolean {
  const { editor, hideWhenUnavailable } = props

  if (!editor || !editor.isEditable) return false

  if (hideWhenUnavailable && !editor.isActive('code')) {
    return canDeleteNode(editor)
  }

  return true
}

/**
 * Vue composable that provides delete node functionality for Tiptap editor
 *
 * @example
 * ```ts
 * // Simple usage - no params needed
 * function MySimpleDeleteButton() {
 *   const { isVisible, handleDeleteNode } = useDeleteNode()
 *
 *   if (!isVisible) return null
 *
 *   return <button onClick={handleDeleteNode}>Delete</button>
 * }
 *
 * // Advanced usage with configuration
 * function MyAdvancedDeleteButton() {
 *   const { isVisible, handleDeleteNode, label } = useDeleteNode({
 *     editor: myEditor,
 *     hideWhenUnavailable: true,
 *     onDeleted: () => console.log('Node deleted!')
 *   })
 *
 *   if (!isVisible) return null
 *
 *   return (
 *     <MyButton
 *       onClick={handleDeleteNode}
 *       aria-label={label}
 *     >
 *       Delete Node
 *     </MyButton>
 *   )
 * }
 * ```
 */
export function useDeleteNode(config?: UseDeleteNodeConfig) {
  const {
    editor: providedEditor,
    hideWhenUnavailable = false,
    onDeleted,
  } = config || {}

  const { editor } = useTiptapEditor(providedEditor)
  const isMobile = useIsMobile()
  const isVisible = ref<boolean>(true)
  const canDeleteNodeState = computed(() => canDeleteNode(editor.value))

  watch(
    editor,
    (newEditor) => {
      if (!newEditor) return

      const handleSelectionUpdate = () => {
        isVisible.value = shouldShowButton({
          editor: newEditor,
          hideWhenUnavailable,
        })
      }

      handleSelectionUpdate()

      newEditor.on('selectionUpdate', handleSelectionUpdate)

      return () => {
        newEditor.off('selectionUpdate', handleSelectionUpdate)
      }
    },
    { immediate: true }
  )

  const handleDeleteNode = () => {
    if (!editor.value) return false

    const success = deleteNode(editor.value)
    if (success) {
      onDeleted?.()
    }
    return success
  }

  // Keyboard shortcut handler
  const handleKeydown = (event: KeyboardEvent) => {
    if (event.key === 'Backspace' && isVisible.value && canDeleteNodeState.value) {
      event.preventDefault()
      handleDeleteNode()
    }
  }

  let targetElement: HTMLElement | null = null

  onMounted(() => {
    const currentEditor = editor.value
    if (!currentEditor || isMobile.value) return

    if (currentEditor.view) {
      targetElement = currentEditor.view.dom as HTMLElement
      targetElement.addEventListener('keydown', handleKeydown, true)
    }
  })

  onBeforeUnmount(() => {
    if (targetElement) {
      targetElement.removeEventListener('keydown', handleKeydown, true)
    }
  })

  return {
    isVisible,
    handleDeleteNode,
    canDeleteNode: canDeleteNodeState,
    label: 'Delete',
    shortcutKeys: DELETE_NODE_SHORTCUT_KEY,
    Icon: markRaw(TrashIcon),
  }
}
