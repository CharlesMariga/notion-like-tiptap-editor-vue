import { ref, watch, onMounted, onUnmounted, computed, markRaw } from 'vue'
import type { Editor } from '@tiptap/vue-3'
import { NodeSelection, TextSelection } from '@tiptap/pm/state'
import { useTiptapEditor } from './useTiptapEditor'
import { useIsMobile } from './useIsMobile'
import TypeIcon from '@/components/tiptap-icons/TypeIcon.vue'
import {
  findNodePosition,
  isNodeInSchema,
  isNodeTypeSelected,
  isValidPosition,
} from '@/lib/tiptap-utils'

export const TEXT_SHORTCUT_KEY = 'mod+alt+0'

/**
 * Configuration for the text/paragraph functionality
 */
export interface UseTextConfig {
  /**
   * The Tiptap editor instance.
   */
  editor?: Editor | null
  /**
   * Whether the button should hide when text conversion is not available.
   * @default false
   */
  hideWhenUnavailable?: boolean
  /**
   * Callback function called after a successful conversion.
   */
  onToggled?: () => void
}

/**
 * Checks if text/paragraph conversion can be performed in the current editor state
 */
export function canToggleText(
  editor: Editor | null,
  turnInto: boolean = true
): boolean {
  if (!editor) return false
  if (
    !isNodeInSchema('paragraph', editor) ||
    isNodeTypeSelected(editor, ['image'])
  )
    return false

  if (!turnInto) {
    return editor.can().setNode('paragraph')
  }

  try {
    const view = editor.view
    const state = view.state
    const selection = state.selection

    if (selection.empty || selection instanceof TextSelection) {
      const pos = findNodePosition({
        editor,
        node: state.selection.$anchor.node(1),
      })?.pos
      if (!isValidPosition(pos)) return false
    }

    return true
  } catch {
    return false
  }
}

/**
 * Checks if paragraph is currently active
 */
export function isParagraphActive(editor: Editor | null): boolean {
  if (!editor) return false
  return editor.isActive('paragraph')
}

/**
 * Converts the current selection or node to paragraph
 */
export function toggleParagraph(editor: Editor | null): boolean {
  if (!editor || !editor.isEditable) return false
  if (!canToggleText(editor)) return false

  try {
    const view = editor.view
    let state = view.state
    let tr = state.tr

    // No selection, find the the cursor position
    if (state.selection.empty || state.selection instanceof TextSelection) {
      const pos = findNodePosition({
        editor,
        node: state.selection.$anchor.node(1),
      })?.pos
      if (!isValidPosition(pos)) return false

      tr = tr.setSelection(NodeSelection.create(state.doc, pos))
      view.dispatch(tr)
      state = view.state
    }

    const selection = state.selection
    let chain = editor.chain().focus()

    // Handle NodeSelection
    if (selection instanceof NodeSelection) {
      const firstChild = selection.node.firstChild?.firstChild
      const lastChild = selection.node.lastChild?.lastChild

      const from = firstChild
        ? selection.from + firstChild.nodeSize
        : selection.from + 1

      const to = lastChild
        ? selection.to - lastChild.nodeSize
        : selection.to - 1

      chain = chain.setTextSelection({ from, to }).clearNodes()
    }

    if (!editor.isActive('paragraph')) {
      chain.setNode('paragraph').run()
    }

    editor.chain().focus().selectTextblockEnd().run()

    return true
  } catch {
    return false
  }
}

/**
 * Determines if the text button should be shown
 */
export function shouldShowButton(props: {
  editor: Editor | null
  hideWhenUnavailable: boolean
}): boolean {
  const { editor, hideWhenUnavailable } = props

  if (!editor || !editor.isEditable) return false
  if (!isNodeInSchema('paragraph', editor)) return false

  if (hideWhenUnavailable && !editor.isActive('code')) {
    return canToggleText(editor)
  }

  return true
}

/**
 * Custom composable that provides text/paragraph functionality for Tiptap editor
 *
 * @example
 * ```ts
 * // Simple usage - no params needed
 * const { isVisible, handleToggle, isActive } = useText()
 *
 * // Advanced usage with configuration
 * const { isVisible, handleToggle, label, isActive } = useText({
 *   editor: myEditor,
 *   hideWhenUnavailable: true,
 *   onToggled: () => console.log('Text converted!')
 * })
 * ```
 */
export function useText(config?: UseTextConfig) {
  const {
    editor: providedEditor,
    hideWhenUnavailable = false,
    onToggled,
  } = config || {}

  const { editor } = useTiptapEditor(providedEditor)
  const isMobile = useIsMobile()
  const isVisible = ref<boolean>(true)
  const canToggle = computed(() => canToggleText(editor.value))
  const isActive = computed(() => isParagraphActive(editor.value))

  const cleanup: (() => void)[] = []

  watch(
    editor,
    (newEditor) => {
      // Clean up previous listeners
      cleanup.forEach((fn) => fn())
      cleanup.length = 0

      if (!newEditor) return

      const handleSelectionUpdate = () => {
        isVisible.value = shouldShowButton({
          editor: newEditor,
          hideWhenUnavailable,
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

  const handleToggle = () => {
    if (!editor.value) return false

    const success = toggleParagraph(editor.value)
    if (success) {
      onToggled?.()
    }
    return success
  }

  // Hotkey support
  onMounted(() => {
    if (typeof window === 'undefined') return

    const handleKeyDown = (event: KeyboardEvent) => {
      // Check for mod+alt+0
      const isMod = event.metaKey || event.ctrlKey
      if (isMod && event.altKey && event.key === '0') {
        if (!isVisible.value || !canToggle.value || isMobile) return
        event.preventDefault()
        handleToggle()
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

  return {
    isVisible,
    isActive,
    handleToggle,
    canToggle,
    label: 'Text',
    shortcutKeys: TEXT_SHORTCUT_KEY,
    Icon: markRaw(TypeIcon),
  }
}
