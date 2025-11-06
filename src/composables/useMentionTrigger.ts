import { ref, onMounted, onUnmounted, computed, markRaw } from 'vue'
import type { Editor } from '@tiptap/vue-3'
import type { Node } from '@tiptap/pm/model'

// --- Composables ---
import { useTiptapEditor } from '@/composables/useTiptapEditor'
import { useIsMobile } from '@/composables/useMobile'

// --- Lib ---
import {
  findNodePosition,
  isNodeTypeSelected,
  isValidPosition,
} from '@/lib/tiptap-utils'

// --- Icons ---
import AtSignIcon from '@/components/tiptap-icons/AtSignIcon.vue'

export const MENTION_TRIGGER_SHORTCUT_KEY = 'mod+shift+2'

/**
 * Configuration for the mention functionality
 */
export interface UseMentionTriggerConfig {
  /**
   * The Tiptap editor instance.
   */
  editor?: Editor | null
  /**
   * The node to apply trigger to
   */
  node?: Node | null
  /**
   * The position of the node in the document
   */
  nodePos?: number | null
  /**
   * The trigger text to insert
   * @default "@"
   */
  trigger?: string
  /**
   * Whether the button should hide when insertion is not available.
   * @default false
   */
  hideWhenUnavailable?: boolean
  /**
   * Callback function called after a successful trigger insertion.
   */
  onTriggered?: (trigger: string) => void
}

/**
 * Checks if a mention can be inserted in the current editor state
 */
export function canInsertMention(
  editor: Editor | null,
  node?: Node | null,
  nodePos?: number | null
): boolean {
  if (!editor || !editor.isEditable) return false
  if (isNodeTypeSelected(editor, ['image'])) return false

  if (node || isValidPosition(nodePos)) {
    if (isValidPosition(nodePos) && nodePos! >= 0) return true

    if (node) {
      const foundPos = findNodePosition({ editor, node })
      return foundPos !== null
    }
  }

  return true
}

/**
 * Inserts a trigger in a block node at a specified position or after the current selection
 */
function insertTriggerInBlockNode(
  editor: Editor,
  trigger: string,
  node?: Node | null,
  nodePos?: number | null
): boolean {
  if ((node !== undefined && node !== null) || isValidPosition(nodePos)) {
    const foundPos = findNodePosition({
      editor,
      node: node || undefined,
      nodePos: nodePos || undefined,
    })

    if (!foundPos) {
      return false
    }

    const isEmpty =
      foundPos.node.type.name === 'paragraph' &&
      foundPos.node.content.size === 0
    const insertPos = isEmpty
      ? foundPos.pos
      : foundPos.pos + foundPos.node.nodeSize

    const triggerLength = trigger.length + 1 // +1 for the space after the trigger
    const focusPos = isEmpty
      ? foundPos.pos + triggerLength
      : foundPos.pos + foundPos.node.nodeSize + triggerLength

    return editor
      .chain()
      .insertContentAt(isEmpty ? foundPos.pos : insertPos, {
        type: 'paragraph',
        content: [{ type: 'text', text: trigger }],
      })
      .focus(focusPos)
      .run()
  }

  const { $from } = editor.state.selection

  return editor
    .chain()
    .insertContentAt($from.after(), {
      type: 'paragraph',
      content: [{ type: 'text', text: trigger }],
    })
    .focus()
    .run()
}

/**
 * Inserts a trigger in a text node at the current selection
 */
function insertTriggerInTextNode(
  editor: Editor,
  trigger: string,
  node?: Node | null,
  nodePos?: number | null
): boolean {
  if ((node !== undefined && node !== null) || isValidPosition(nodePos)) {
    const foundPos = findNodePosition({
      editor,
      node: node || undefined,
      nodePos: nodePos || undefined,
    })

    if (!foundPos) {
      return false
    }

    const isEmpty =
      foundPos.node.type.name === 'paragraph' &&
      foundPos.node.content.size === 0
    const insertPos = isEmpty
      ? foundPos.pos
      : foundPos.pos + foundPos.node.nodeSize

    editor.view.dispatch(
      editor.view.state.tr
        .scrollIntoView()
        .insertText(trigger, insertPos, insertPos)
    )

    const triggerLength = trigger.length + 1 // +1 for the space after the trigger
    const focusPos = isEmpty
      ? foundPos.pos + triggerLength
      : foundPos.pos + foundPos.node.nodeSize + triggerLength
    editor.commands.focus(focusPos)

    return true
  }

  const { $from } = editor.state.selection
  const currentNode = $from.node()
  const hasContentBefore =
    $from.parentOffset > 0 &&
    currentNode.textContent[$from.parentOffset - 1] !== ' '

  return editor
    .chain()
    .insertContent({
      type: 'text',
      text: hasContentBefore ? ` ${trigger}` : trigger,
    })
    .focus()
    .run()
}

/**
 * Adds a mention trigger at the current selection or specified node position
 */
export function addMentionTrigger(
  editor: Editor | null,
  trigger: string = '@',
  node?: Node | null,
  nodePos?: number | null
): boolean {
  if (!editor || !editor.isEditable) return false
  if (!canInsertMention(editor, node, nodePos)) return false

  try {
    const { $from } = editor.state.selection
    const currentNode = $from.node()
    const isBlockNode = currentNode.isBlock && !currentNode.isTextblock

    if (isBlockNode) {
      return insertTriggerInBlockNode(editor, trigger, node, nodePos)
    }

    return insertTriggerInTextNode(editor, trigger, node, nodePos)
  } catch {
    return false
  }
}

/**
 * Determines if the mention button should be shown
 */
export function shouldShowButton(props: {
  editor: Editor | null
  hideWhenUnavailable: boolean
  node?: Node | null
  nodePos?: number | null
}): boolean {
  const { editor, hideWhenUnavailable, node, nodePos } = props

  if (!editor || !editor.isEditable) return false

  if (hideWhenUnavailable && !editor.isActive('code')) {
    return canInsertMention(editor, node, nodePos)
  }

  return true
}

/**
 * Custom composable that provides mention functionality for Tiptap editor
 */
export function useMentionTrigger(config?: UseMentionTriggerConfig) {
  const {
    editor: providedEditor,
    node,
    nodePos,
    trigger = '@',
    hideWhenUnavailable = false,
    onTriggered,
  } = config || {}

  const { editor } = useTiptapEditor(providedEditor)
  const isMobile = useIsMobile()
  const isVisible = ref<boolean>(true)
  const canInsert = computed(() => canInsertMention(editor.value, node, nodePos))

  // Cleanup array
  const cleanup: Array<() => void> = []

  const handleMention = () => {
    if (!editor.value) return false

    const success = addMentionTrigger(editor.value, trigger, node, nodePos)
    if (success) {
      onTriggered?.(trigger)
    }
    return success
  }

  const handleKeyboard = (event: KeyboardEvent) => {
    // Check for mod+shift+2 (Mac: Cmd+Shift+2, Windows/Linux: Ctrl+Shift+2)
    const isMod = event.metaKey || event.ctrlKey

    if (isMod && event.shiftKey && event.key === '2') {
      if (isVisible.value && canInsert.value) {
        event.preventDefault()
        handleMention()
      }
    }
  }

  onMounted(() => {
    if (!editor.value) return

    const handleSelectionUpdate = () => {
      isVisible.value = shouldShowButton({
        editor: editor.value,
        hideWhenUnavailable,
        node,
        nodePos
      })
    }

    handleSelectionUpdate()

    editor.value.on('selectionUpdate', handleSelectionUpdate)
    cleanup.push(() => editor.value?.off('selectionUpdate', handleSelectionUpdate))

    // Register keyboard shortcut
    if (!isMobile.value) {
      window.addEventListener('keydown', handleKeyboard)
      cleanup.push(() => window.removeEventListener('keydown', handleKeyboard))
    }
  })

  onUnmounted(() => {
    cleanup.forEach(fn => fn())
  })

  return {
    isVisible,
    handleMention,
    canInsert,
    label: 'Add mention',
    shortcutKeys: MENTION_TRIGGER_SHORTCUT_KEY,
    trigger,
    Icon: markRaw(AtSignIcon),
  }
}
