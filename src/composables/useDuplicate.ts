import { computed, ref, watch, onMounted, onBeforeUnmount, markRaw } from 'vue'
import type { Editor } from '@tiptap/vue-3'
import { NodeSelection } from '@tiptap/pm/state'
import { useTiptapEditor } from '@/composables/useTiptapEditor'
import { useIsMobile } from '@/composables/useMobile'
import CopyIcon from '@/components/tiptap-icons/CopyIcon.vue'

export const DUPLICATE_SHORTCUT_KEY = 'mod+d'

/**
 * Configuration for the duplicate functionality
 */
export interface UseDuplicateConfig {
  /**
   * The Tiptap editor instance.
   */
  editor?: Editor | null
  /**
   * Whether the button should hide when duplication is not available.
   * @default false
   */
  hideWhenUnavailable?: boolean
  /**
   * Callback function called after a successful duplication.
   */
  onDuplicated?: () => void
}

/**
 * Checks if a node can be duplicated in the current editor state
 */
export function canDuplicateNode(editor: Editor | null): boolean {
  if (!editor || !editor.isEditable) return false

  try {
    const { state } = editor
    const { selection } = state

    if (selection instanceof NodeSelection) {
      return !!selection.node
    }

    const $anchor = selection.$anchor.node(1)

    return !!$anchor
  } catch {
    return false
  }
}

/**
 * Duplicates a node in the editor
 */
export function duplicateNode(editor: Editor | null): boolean {
  if (!editor || !editor.isEditable) return false

  try {
    const { state } = editor
    const { selection } = state
    const chain = editor.chain().focus()

    if (selection instanceof NodeSelection) {
      const selectedNode = selection.node
      const insertPos = selection.to

      chain.insertContentAt(insertPos, selectedNode.toJSON()).run()
      return true
    }

    // Handle text selection or cursor position
    // Find the appropriate parent node to duplicate
    const $anchor = selection.$anchor

    for (let depth = 1; depth <= $anchor.depth; depth++) {
      const node = $anchor.node(depth)

      // Skip document and other non-duplicatable nodes
      if (node.type.name === 'doc' || !node.type.spec.group) {
        continue
      }

      const nodeStart = $anchor.start(depth)
      const insertPos = Math.min(
        nodeStart + node.nodeSize,
        state.doc.content.size
      )

      chain.insertContentAt(insertPos, node.toJSON()).run()
      return true
    }

    return false
  } catch {
    return false
  }
}

/**
 * Determines if the duplicate button should be shown
 */
export function shouldShowButton(props: {
  editor: Editor | null
  hideWhenUnavailable: boolean
}): boolean {
  const { editor, hideWhenUnavailable } = props

  if (!editor || !editor.isEditable) return false

  if (hideWhenUnavailable && !editor.isActive('code')) {
    return canDuplicateNode(editor)
  }

  return true
}

/**
 * Vue composable that provides duplicate functionality for Tiptap editor
 *
 * @example
 * ```ts
 * // Simple usage - no params needed
 * function MySimpleDuplicateButton() {
 *   const { isVisible, handleDuplicate } = useDuplicate()
 *
 *   if (!isVisible) return null
 *
 *   return <button onClick={handleDuplicate}>Duplicate</button>
 * }
 *
 * // Advanced usage with configuration
 * function MyAdvancedDuplicateButton() {
 *   const { isVisible, handleDuplicate, label } = useDuplicate({
 *     editor: myEditor,
 *     hideWhenUnavailable: true,
 *     onDuplicated: () => console.log('Node duplicated!')
 *   })
 *
 *   if (!isVisible) return null
 *
 *   return (
 *     <MyButton
 *       onClick={handleDuplicate}
 *       aria-label={label}
 *     >
 *       Duplicate Node
 *     </MyButton>
 *   )
 * }
 * ```
 */
export function useDuplicate(config?: UseDuplicateConfig) {
  const {
    editor: providedEditor,
    hideWhenUnavailable = false,
    onDuplicated,
  } = config || {}

  const { editor } = useTiptapEditor(providedEditor)
  const isMobile = useIsMobile()
  const isVisible = ref<boolean>(true)
  const canDuplicate = computed(() => canDuplicateNode(editor.value))

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

  const handleDuplicate = () => {
    if (!editor.value) return false

    const success = duplicateNode(editor.value)
    if (success) {
      onDuplicated?.()
    }
    return success
  }

  // Keyboard shortcut handler (Cmd/Ctrl+D)
  const handleKeydown = (event: KeyboardEvent) => {
    const isMod = event.metaKey || event.ctrlKey
    if (
      event.key === 'd' &&
      isMod &&
      isVisible.value &&
      canDuplicate.value
    ) {
      event.preventDefault() // prevent browser default bookmarking
      handleDuplicate()
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
    handleDuplicate,
    canDuplicate,
    label: 'Duplicate node',
    shortcutKeys: DUPLICATE_SHORTCUT_KEY,
    Icon: markRaw(CopyIcon),
  }
}
