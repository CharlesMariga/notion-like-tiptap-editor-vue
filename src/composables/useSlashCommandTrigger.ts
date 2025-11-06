import { ref, onMounted, onUnmounted, computed, markRaw } from 'vue'
import type { Editor } from '@tiptap/vue-3'
import type { Node } from '@tiptap/pm/model'

// --- Composables ---
import { useTiptapEditor } from '@/composables/useTiptapEditor'
import { useIsMobile } from '@/composables/useIsMobile'

// --- Icons ---
import PlusIcon from '@/components/tiptap-icons/PlusIcon.vue'

// --- Lib ---
import {
  findNodePosition,
  isNodeTypeSelected,
  isValidPosition,
} from '@/lib/tiptap-utils'

export const SLASH_COMMAND_TRIGGER_SHORTCUT_KEY = 'mod+/'

/**
 * Configuration for the slash command functionality
 */
export interface UseSlashCommandTriggerConfig {
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
   * @default "/"
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
 * Checks if a slash command can be inserted in the current editor state
 */
export function canInsertSlashCommand(
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
 * Inserts a slash command at a specified node position or after the current selection
 */
export function insertSlashCommand(
  editor: Editor | null,
  trigger: string = '/',
  node?: Node | null,
  nodePos?: number | null
): boolean {
  if (!editor || !editor.isEditable) return false
  if (!canInsertSlashCommand(editor, node, nodePos)) return false

  try {
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
    const isEmpty = currentNode.textContent.length === 0
    const isStartOfBlock = $from.parentOffset === 0

    // Check if we're at the document node level
    // This is important if we dont have focus on the editor
    // and we want to insert the slash at the end of the document
    const isTopLevel = $from.depth === 0

    if (!isEmpty || !isStartOfBlock) {
      const insertPosition = isTopLevel
        ? editor.state.doc.content.size
        : $from.after()

      return editor
        .chain()
        .insertContentAt(insertPosition, {
          type: 'paragraph',
          content: [{ type: 'text', text: trigger }],
        })
        .focus()
        .run()
    }

    return editor
      .chain()
      .insertContent({ type: 'text', text: trigger })
      .focus()
      .run()
  } catch {
    return false
  }
}

/**
 * Determines if the slash command button should be shown
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
    return canInsertSlashCommand(editor, node, nodePos)
  }

  return true
}

/**
 * Custom composable that provides slash command functionality for Tiptap editor
 *
 * @example
 * ```vue
 * // Simple usage - no params needed
 * <script setup>
 * const { isVisible, handleSlashCommand } = useSlashCommandTrigger()
 * </script>
 *
 * <template>
 *   <button v-if="isVisible" @click="handleSlashCommand">Insert Block</button>
 * </template>
 *
 * // Advanced usage with configuration
 * <script setup>
 * const { isVisible, handleSlashCommand, label } = useSlashCommandTrigger({
 *   editor: myEditor,
 *   trigger: '/',
 *   hideWhenUnavailable: true,
 *   onTriggered: (trigger) => console.log('Inserted:', trigger)
 * })
 * </script>
 *
 * <template>
 *   <MyButton
 *     v-if="isVisible"
 *     @click="handleSlashCommand"
 *     :aria-label="label"
 *   >
 *     Insert Block
 *   </MyButton>
 * </template>
 * ```
 */
export function useSlashCommandTrigger(config?: UseSlashCommandTriggerConfig) {
  const {
    editor: providedEditor,
    node,
    nodePos,
    trigger = '/',
    hideWhenUnavailable = false,
    onTriggered,
  } = config || {}

  const { editor } = useTiptapEditor(providedEditor)
  const isMobile = useIsMobile()
  const isVisible = ref<boolean>(true)
  const canInsert = computed(() => canInsertSlashCommand(editor.value, node, nodePos))

  // Cleanup array
  const cleanup: Array<() => void> = []

  const handleSlashCommand = () => {
    if (!editor.value) return false

    const success = insertSlashCommand(editor.value, trigger, node, nodePos)
    if (success) {
      onTriggered?.(trigger)
    }
    return success
  }

  const handleKeyboard = (event: KeyboardEvent) => {
    // Check for mod+/ (Mac: Cmd+/, Windows/Linux: Ctrl+/)
    const isMod = event.metaKey || event.ctrlKey

    if (isMod && event.key === '/') {
      if (isVisible.value && canInsert.value) {
        event.preventDefault()
        handleSlashCommand()
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
        nodePos,
      })
    }

    handleSelectionUpdate()

    editor.value.on('selectionUpdate', handleSelectionUpdate)
    cleanup.push(() => editor.value?.off('selectionUpdate', handleSelectionUpdate))

    // Register keyboard shortcut
    if (!isMobile) {
      window.addEventListener('keydown', handleKeyboard)
      cleanup.push(() => window.removeEventListener('keydown', handleKeyboard))
    }
  })

  onUnmounted(() => {
    cleanup.forEach(fn => fn())
  })

  return {
    isVisible,
    handleSlashCommand,
    canInsert,
    label: 'Insert block',
    shortcutKeys: SLASH_COMMAND_TRIGGER_SHORTCUT_KEY,
    trigger,
    Icon: markRaw(PlusIcon),
  }
}
