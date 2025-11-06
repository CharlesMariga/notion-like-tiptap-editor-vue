import { ref, onMounted, onUnmounted, computed, markRaw } from 'vue'
import type { Editor } from '@tiptap/vue-3'

// --- Composables ---
import { useTiptapEditor } from '@/composables/useTiptapEditor'
import { useIsMobile } from '@/composables/useIsMobile'

// --- Lib ---
import { isMarkInSchema, isNodeTypeSelected } from '@/lib/tiptap-utils'

// --- Icons ---
import TextColorSmallIcon from '@/components/tiptap-icons/TextColorSmallIcon.vue'

export const COLOR_TEXT_SHORTCUT_KEY = 'mod+shift+t'
export const TEXT_COLORS = [
  {
    label: 'Default text',
    value: 'var(--tt-color-text)',
    border: 'var(--tt-color-text-contrast)',
  },
  {
    label: 'Gray text',
    value: 'var(--tt-color-text-gray)',
    border: 'var(--tt-color-text-gray-contrast)',
  },
  {
    label: 'Brown text',
    value: 'var(--tt-color-text-brown)',
    border: 'var(--tt-color-text-brown-contrast)',
  },
  {
    label: 'Orange text',
    value: 'var(--tt-color-text-orange)',
    border: 'var(--tt-color-text-orange-contrast)',
  },
  {
    label: 'Yellow text',
    value: 'var(--tt-color-text-yellow)',
    border: 'var(--tt-color-text-yellow-contrast)',
  },
  {
    label: 'Green text',
    value: 'var(--tt-color-text-green)',
    border: 'var(--tt-color-text-green-contrast)',
  },
  {
    label: 'Blue text',
    value: 'var(--tt-color-text-blue)',
    border: 'var(--tt-color-text-blue-contrast)',
  },
  {
    label: 'Purple text',
    value: 'var(--tt-color-text-purple)',
    border: 'var(--tt-color-text-purple-contrast)',
  },
  {
    label: 'Pink text',
    value: 'var(--tt-color-text-pink)',
    border: 'var(--tt-color-text-pink-contrast)',
  },
  {
    label: 'Red text',
    value: 'var(--tt-color-text-red)',
    border: 'var(--tt-color-text-red-contrast)',
  },
]

/**
 * Configuration for the color text functionality
 */
export interface UseColorTextConfig {
  /**
   * The Tiptap editor instance.
   */
  editor?: Editor | null
  /**
   * The text color to apply.
   * Can be any valid CSS color value.
   */
  textColor: string
  /**
   * Optional text to display alongside the icon.
   */
  label: string
  /**
   * Whether the button should hide when the mark is not available.
   * @default false
   */
  hideWhenUnavailable?: boolean
  /**
   * Called when the text color is applied.
   */
  onApplied?: ({ color, label }: { color: string; label: string }) => void
}

/**
 * Checks if text color can be toggled in the current editor state
 */
export function canColorText(editor: Editor | null): boolean {
  if (!editor || !editor.isEditable) return false
  if (
    !isMarkInSchema('textStyle', editor) ||
    isNodeTypeSelected(editor, ['image'])
  )
    return false

  try {
    return editor.can().setMark('textStyle', { color: 'currentColor' })
  } catch {
    return false
  }
}

/**
 * Checks if text color is active in the current selection
 */
export function isColorTextActive(
  editor: Editor | null,
  textColor: string
): boolean {
  if (!editor || !editor.isEditable) return false
  return editor.isActive('textStyle', { color: textColor })
}

/**
 * Determines if the color text button should be shown
 */
export function shouldShowButton(props: {
  editor: Editor | null
  hideWhenUnavailable: boolean
}): boolean {
  const { editor, hideWhenUnavailable } = props

  if (!editor || !editor.isEditable) return false
  if (!isMarkInSchema('textStyle', editor)) return false

  if (hideWhenUnavailable && !editor.isActive('code')) {
    return canColorText(editor)
  }

  return true
}

/**
 * Custom composable that provides color text functionality for Tiptap editor
 *
 * @example
 * ```vue
 * // Simple usage with required textColor
 * <script setup>
 * const { isVisible, handleColorText, isActive } = useColorTextButton({
 *   textColor: 'red',
 *   label: 'Red Text',
 * })
 * </script>
 *
 * <template>
 *   <button
 *     v-if="isVisible"
 *     @click="handleColorText"
 *     :style="{ color: isActive ? 'red' : 'inherit' }"
 *   >
 *     Red Text
 *   </button>
 * </template>
 *
 * // Advanced usage
 * <script setup>
 * const { isVisible, handleColorText, label, isActive } = useColorTextButton({
 *   editor: myEditor,
 *   textColor: '#ff0000',
 *   label: 'Apply Red',
 *   hideWhenUnavailable: true,
 *   onApplied: ({ color }) => console.log('Applied:', color),
 * })
 * </script>
 *
 * <template>
 *   <MyButton
 *     v-if="isVisible"
 *     @click="handleColorText"
 *     :aria-label="label"
 *     :data-active="isActive"
 *   >
 *     Apply Text Color
 *   </MyButton>
 * </template>
 * ```
 */
export function useColorTextButton(config: UseColorTextConfig) {
  const {
    editor: providedEditor,
    label,
    textColor,
    hideWhenUnavailable = false,
    onApplied,
  } = config

  const { editor } = useTiptapEditor(providedEditor)
  const isMobile = useIsMobile()
  const isVisible = ref<boolean>(true)
  const canColorTextState = computed(() => canColorText(editor.value))
  const isActive = computed(() => isColorTextActive(editor.value, textColor))

  // Cleanup array
  const cleanup: Array<() => void> = []

  const handleColorText = () => {
    if (!editor.value || !canColorTextState.value) return false

    if (editor.value.state.storedMarks) {
      const textStyleMarkType = editor.value.schema.marks.textStyle
      if (textStyleMarkType) {
        editor.value.view.dispatch(
          editor.value.state.tr.removeStoredMark(textStyleMarkType)
        )
      }
    }

    setTimeout(() => {
      if (!editor.value) return false
      const success = editor.value
        .chain()
        .focus()
        .toggleMark('textStyle', { color: textColor })
        .run()
      if (success) {
        onApplied?.({ color: textColor, label })
      }
      return success
    }, 0)
  }

  const handleKeyboard = (event: KeyboardEvent) => {
    // Check for mod+shift+t (Mac: Cmd+Shift+T, Windows/Linux: Ctrl+Shift+T)
    const isMod = event.metaKey || event.ctrlKey

    if (isMod && event.shiftKey && event.key.toLowerCase() === 't') {
      if (isVisible.value && canColorTextState.value) {
        event.preventDefault()
        handleColorText()
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
    handleColorText,
    canColorText: canColorTextState,
    label: label || `Color text to ${textColor}`,
    shortcutKeys: COLOR_TEXT_SHORTCUT_KEY,
    Icon: markRaw(TextColorSmallIcon),
  }
}
