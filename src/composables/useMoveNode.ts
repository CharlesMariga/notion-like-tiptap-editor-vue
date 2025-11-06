import { ref, watch, onMounted, onUnmounted } from 'vue'
import type { Editor } from '@tiptap/vue-3'
import { TextSelection } from '@tiptap/pm/state'
import { useTiptapEditor } from './useTiptapEditor'
import { useIsMobile } from './useIsMobile'
import { getAnchorNodeAndPos } from '@/lib/tiptap-advanced-utils'
import AlignTopIcon from '@/components/tiptap-icons/AlignTopIcon.vue'
import AlignBottomIcon from '@/components/tiptap-icons/AlignBottomIcon.vue'

export const MOVE_UP_SHORTCUT_KEY = 'mod+shift+ArrowUp'
export const MOVE_DOWN_SHORTCUT_KEY = 'mod+shift+ArrowDown'

/**
 * Configuration for the move node functionality
 */
export interface UseMoveNodeConfig {
  /**
   * The Tiptap editor instance.
   */
  editor?: Editor | null
  /**
   * Whether the button should hide when moving is not available.
   * @default false
   */
  hideWhenUnavailable?: boolean
  /**
   * The direction to move the node.
   */
  direction: 'up' | 'down'
  /**
   * Callback function called after a successful move.
   */
  onMoved?: (direction: 'up' | 'down') => void
}

/**
 * Checks if a node can be moved in the specified direction
 */
export function canMoveNode(
  editor: Editor | null,
  direction: 'up' | 'down'
): boolean {
  if (!editor || !editor.isEditable) return false
  const nodeInfo = getAnchorNodeAndPos(editor)
  if (!nodeInfo) return false

  try {
    const { pos } = nodeInfo
    const $pos = editor.state.doc.resolve(pos)
    const parent = $pos.parent
    const index = $pos.index()

    return direction === 'up' ? index > 0 : index < parent.childCount - 1
  } catch {
    return false
  }
}

/**
 * Moves a node in the editor
 */
export function moveNode(
  editor: Editor | null,
  direction: 'up' | 'down'
): boolean {
  if (!editor || !editor.isEditable) return false
  const nodeInfo = getAnchorNodeAndPos(editor)
  if (!nodeInfo) return false

  try {
    const { pos, node } = nodeInfo
    const tr = editor.state.tr
    const $pos = tr.doc.resolve(pos)
    const parent = $pos.parent
    const index = $pos.index()

    if (index < 0 || index >= parent.childCount) {
      return false
    }

    if (direction === 'up' && index > 0) {
      const prevNode = parent.child(index - 1)
      const prevSize = prevNode.nodeSize

      const movedNode = node.type.create(node.attrs, node.content, node.marks)
      tr.deleteRange(pos, pos + node.nodeSize)
      const insertPos = pos - prevSize
      tr.insert(insertPos, movedNode)
      tr.setSelection(TextSelection.near(tr.doc.resolve(insertPos)))
    } else if (direction === 'down' && index < parent.childCount - 1) {
      const nextNode = parent.child(index + 1)
      const nextSize = nextNode.nodeSize

      const movedNode = node.type.create(node.attrs, node.content, node.marks)
      tr.deleteRange(pos, pos + node.nodeSize)
      const insertPos = pos + nextSize
      tr.insert(insertPos, movedNode)
      tr.setSelection(TextSelection.near(tr.doc.resolve(insertPos)))
    } else {
      return false
    }

    editor.view.dispatch(tr)
    return true
  } catch (err) {
    console.error('Error moving node:', err)
    return false
  }
}

/**
 * Determines if the move button should be shown
 */
export function shouldShowButton(props: {
  editor: Editor | null
  direction: 'up' | 'down'
  hideWhenUnavailable: boolean
}): boolean {
  const { editor, direction, hideWhenUnavailable } = props

  if (!editor || !editor.isEditable) return false

  const hasNode = !!getAnchorNodeAndPos(editor)
  const movable = canMoveNode(editor, direction)

  return hideWhenUnavailable ? hasNode && movable : hasNode
}

/**
 * Custom composable that provides move node functionality for Tiptap editor
 */
export function useMoveNode(config: UseMoveNodeConfig) {
  const {
    editor: providedEditor,
    hideWhenUnavailable = false,
    direction,
    onMoved,
  } = config
  const { editor } = useTiptapEditor(providedEditor)
  const isMobile = useIsMobile()

  const isVisible = ref(true)
  const canMoveNodeState = ref(false)

  const cleanup: (() => void)[] = []

  watch(
    editor,
    (newEditor) => {
      // Clean up previous listeners
      cleanup.forEach((fn) => fn())
      cleanup.length = 0

      if (!newEditor) return

      const update = () => {
        isVisible.value = shouldShowButton({
          editor: newEditor,
          direction,
          hideWhenUnavailable,
        })
        canMoveNodeState.value = canMoveNode(newEditor, direction)
      }

      update()

      newEditor.on('selectionUpdate', update)
      cleanup.push(() => {
        newEditor.off('selectionUpdate', update)
      })
    },
    { immediate: true }
  )

  const handleMoveNode = () => {
    if (!canMoveNodeState.value) return false

    const success = moveNode(editor.value, direction)
    if (success) onMoved?.(direction)

    return success
  }

  const shortcutKeys =
    direction === 'up' ? MOVE_UP_SHORTCUT_KEY : MOVE_DOWN_SHORTCUT_KEY

  // Hotkey support
  onMounted(() => {
    if (typeof window === 'undefined') return

    const handleKeyDown = (event: KeyboardEvent) => {
      const isMod = event.metaKey || event.ctrlKey
      const targetKey = direction === 'up' ? 'ArrowUp' : 'ArrowDown'

      if (isMod && event.shiftKey && event.key === targetKey) {
        if (!isVisible.value || !canMoveNodeState.value || isMobile) return
        event.preventDefault()
        handleMoveNode()
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    cleanup.push(() => {
      window.removeEventListener('keydown', handleKeyDown)
    })
  })

  onUnmounted(() => {
    cleanup.forEach((fn) => fn())
  })

  const label = direction === 'up' ? 'Move Up' : 'Move Down'
  const Icon = direction === 'up' ? AlignTopIcon : AlignBottomIcon

  return {
    isVisible,
    handleMoveNode,
    canMoveNode: canMoveNodeState,
    label,
    shortcutKeys,
    Icon,
  }
}
