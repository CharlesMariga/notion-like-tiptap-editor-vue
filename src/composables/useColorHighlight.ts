import { ref, onMounted, onUnmounted, computed, markRaw } from 'vue'
import type { Editor } from '@tiptap/vue-3'

// --- Composables ---
import { useTiptapEditor } from '@/composables/useTiptapEditor'
import { useIsMobile } from '@/composables/useIsMobile'

// --- Lib ---
import { isMarkInSchema, isNodeTypeSelected } from '@/lib/tiptap-utils'

// --- Icons ---
import HighlighterIcon from '@/components/tiptap-icons/HighlighterIcon.vue'

export const COLOR_HIGHLIGHT_SHORTCUT_KEY = 'mod+shift+h'
export const HIGHLIGHT_COLORS = [
  {
    label: 'Default background',
    value: 'var(--tt-bg-color)',
    border: 'var(--tt-bg-color-contrast)',
  },
  {
    label: 'Gray background',
    value: 'var(--tt-color-highlight-gray)',
    border: 'var(--tt-color-highlight-gray-contrast)',
  },
  {
    label: 'Brown background',
    value: 'var(--tt-color-highlight-brown)',
    border: 'var(--tt-color-highlight-brown-contrast)',
  },
  {
    label: 'Orange background',
    value: 'var(--tt-color-highlight-orange)',
    border: 'var(--tt-color-highlight-orange-contrast)',
  },
  {
    label: 'Yellow background',
    value: 'var(--tt-color-highlight-yellow)',
    border: 'var(--tt-color-highlight-yellow-contrast)',
  },
  {
    label: 'Green background',
    value: 'var(--tt-color-highlight-green)',
    border: 'var(--tt-color-highlight-green-contrast)',
  },
  {
    label: 'Blue background',
    value: 'var(--tt-color-highlight-blue)',
    border: 'var(--tt-color-highlight-blue-contrast)',
  },
  {
    label: 'Purple background',
    value: 'var(--tt-color-highlight-purple)',
    border: 'var(--tt-color-highlight-purple-contrast)',
  },
  {
    label: 'Pink background',
    value: 'var(--tt-color-highlight-pink)',
    border: 'var(--tt-color-highlight-pink-contrast)',
  },
  {
    label: 'Red background',
    value: 'var(--tt-color-highlight-red)',
    border: 'var(--tt-color-highlight-red-contrast)',
  },
]
export type HighlightColor = (typeof HIGHLIGHT_COLORS)[number]

/**
 * Configuration for the color highlight functionality
 */
export interface UseColorHighlightConfig {
  /**
   * The Tiptap editor instance.
   */
  editor?: Editor | null
  /**
   * The color to apply when toggling the highlight.
   */
  highlightColor?: string
  /**
   * Optional label to display alongside the icon.
   */
  label?: string
  /**
   * Whether the button should hide when the mark is not available.
   * @default false
   */
  hideWhenUnavailable?: boolean
  /**
   * Called when the highlight is applied.
   */
  onApplied?: ({ color, label }: { color: string; label: string }) => void
}

export function pickHighlightColorsByValue(values: string[]) {
  const colorMap = new Map(
    HIGHLIGHT_COLORS.map((color) => [color.value, color])
  )
  return values
    .map((value) => colorMap.get(value))
    .filter((color): color is (typeof HIGHLIGHT_COLORS)[number] => !!color)
}

export function canColorHighlight(editor: Editor | null): boolean {
  if (!editor || !editor.isEditable) return false
  if (
    !isMarkInSchema('highlight', editor) ||
    isNodeTypeSelected(editor, ['image'])
  )
    return false

  return editor.can().setMark('highlight')
}

export function isColorHighlightActive(
  editor: Editor | null,
  highlightColor?: string
): boolean {
  if (!editor || !editor.isEditable) return false
  return highlightColor
    ? editor.isActive('highlight', { color: highlightColor })
    : editor.isActive('highlight')
}

export function removeHighlight(editor: Editor | null): boolean {
  if (!editor || !editor.isEditable) return false
  if (!canColorHighlight(editor)) return false

  return editor.chain().focus().unsetMark('highlight').run()
}

export function shouldShowButton(props: {
  editor: Editor | null
  hideWhenUnavailable: boolean
}): boolean {
  const { editor, hideWhenUnavailable } = props

  if (!editor || !editor.isEditable) return false
  if (!isMarkInSchema('highlight', editor)) return false

  if (hideWhenUnavailable && !editor.isActive('code')) {
    return canColorHighlight(editor)
  }

  return true
}

export function useColorHighlight(config: UseColorHighlightConfig) {
  const {
    editor: providedEditor,
    label,
    highlightColor,
    hideWhenUnavailable = false,
    onApplied,
  } = config

  const { editor } = useTiptapEditor(providedEditor)
  const isMobile = useIsMobile()
  const isVisible = ref<boolean>(true)
  const canColorHighlightState = computed(() => canColorHighlight(editor.value))
  const isActive = computed(() => isColorHighlightActive(editor.value, highlightColor))

  // Cleanup array
  const cleanup: Array<() => void> = []

  const handleColorHighlight = () => {
    if (!editor.value || !canColorHighlightState.value || !highlightColor || !label)
      return false

    if (editor.value.state.storedMarks) {
      const highlightMarkType = editor.value.schema.marks.highlight
      if (highlightMarkType) {
        editor.value.view.dispatch(
          editor.value.state.tr.removeStoredMark(highlightMarkType)
        )
      }
    }

    setTimeout(() => {
      if (!editor.value) return false
      const success = editor.value
        .chain()
        .focus()
        .toggleMark('highlight', { color: highlightColor })
        .run()
      if (success) {
        onApplied?.({ color: highlightColor, label })
      }
      return success
    }, 0)
  }

  const handleRemoveHighlight = () => {
    const success = removeHighlight(editor.value)
    if (success) {
      onApplied?.({ color: '', label: 'Remove highlight' })
    }
    return success
  }

  const handleKeyboard = (event: KeyboardEvent) => {
    // Check for mod+shift+h (Mac: Cmd+Shift+H, Windows/Linux: Ctrl+Shift+H)
    const isMod = event.metaKey || event.ctrlKey

    if (isMod && event.shiftKey && event.key.toLowerCase() === 'h') {
      if (isVisible.value && canColorHighlightState.value) {
        event.preventDefault()
        handleColorHighlight()
      }
    }
  }

  onMounted(() => {
    if (!editor.value) return

    const handleSelectionUpdate = () => {
      isVisible.value = shouldShowButton({ editor: editor.value, hideWhenUnavailable })
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
    isActive,
    handleColorHighlight,
    handleRemoveHighlight,
    canColorHighlight: canColorHighlightState,
    label: label || `Highlight`,
    shortcutKeys: COLOR_HIGHLIGHT_SHORTCUT_KEY,
    Icon: markRaw(HighlighterIcon),
  }
}
