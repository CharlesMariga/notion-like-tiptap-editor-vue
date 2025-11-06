import { ref, computed, watch } from 'vue'
import type { Editor } from '@tiptap/vue-3'
import { useTiptapEditor } from '@/composables/useTiptapEditor'
import { isMarkInSchema, isNodeTypeSelected } from '@/lib/tiptap-utils'
import { getActiveMarkAttrs } from '@/lib/tiptap-advanced-utils'

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

export const HIGHLIGHT_COLORS = [
  {
    label: 'Default highlight',
    value: 'var(--tt-color-highlight)',
  },
  {
    label: 'Gray highlight',
    value: 'var(--tt-color-highlight-gray)',
  },
  {
    label: 'Brown highlight',
    value: 'var(--tt-color-highlight-brown)',
  },
  {
    label: 'Orange highlight',
    value: 'var(--tt-color-highlight-orange)',
  },
  {
    label: 'Yellow highlight',
    value: 'var(--tt-color-highlight-yellow)',
  },
  {
    label: 'Green highlight',
    value: 'var(--tt-color-highlight-green)',
  },
  {
    label: 'Blue highlight',
    value: 'var(--tt-color-highlight-blue)',
  },
  {
    label: 'Purple highlight',
    value: 'var(--tt-color-highlight-purple)',
  },
  {
    label: 'Pink highlight',
    value: 'var(--tt-color-highlight-pink)',
  },
  {
    label: 'Red highlight',
    value: 'var(--tt-color-highlight-red)',
  },
]

export type ColorType = 'text' | 'highlight'

export interface ColorItem {
  value: string
  label: string
  border?: string
}

export interface RecentColor {
  type: ColorType
  label: string
  value: string
}

export function canColorText(editor: Editor | null): boolean {
  if (!editor || !editor.isEditable) return false
  if (
    !isMarkInSchema('textStyle', editor) ||
    isNodeTypeSelected(editor, ['codeBlock'])
  )
    return false

  return editor.can().setColor('black')
}

export function canColorHighlight(editor: Editor | null): boolean {
  if (!editor || !editor.isEditable) return false
  if (
    !isMarkInSchema('highlight', editor) ||
    isNodeTypeSelected(editor, ['codeBlock'])
  )
    return false

  return editor.can().setHighlight()
}

export function setTextColor(editor: Editor | null, color: string): boolean {
  if (!editor || !canColorText(editor)) return false

  if (color === 'var(--tt-color-text)') {
    return editor.chain().focus().unsetColor().run()
  }

  return editor.chain().focus().setColor(color).run()
}

export function setHighlightColor(editor: Editor | null, color: string): boolean {
  if (!editor || !canColorHighlight(editor)) return false

  return editor.chain().focus().setHighlight({ color }).run()
}

export function removeHighlight(editor: Editor | null): boolean {
  if (!editor) return false
  return editor.chain().focus().unsetHighlight().run()
}

/**
 * Hook to manage recently used colors in localStorage
 */
export function useRecentColors(maxColors: number = 3) {
  const recentColors = ref<RecentColor[]>([])
  const isInitialized = ref(false)

  // Load from localStorage
  if (typeof window !== 'undefined') {
    try {
      const storedColors = localStorage.getItem('tiptapRecentlyUsedColors')
      if (storedColors) {
        const colors = JSON.parse(storedColors) as RecentColor[]
        recentColors.value = colors.slice(0, maxColors)
      }
    } catch (e) {
      console.error('Failed to load stored colors:', e)
    } finally {
      isInitialized.value = true
    }
  }

  const addRecentColor = ({
    type,
    label,
    value,
  }: {
    type: ColorType
    label: string
    value: string
  }) => {
    const filtered = recentColors.value.filter(
      (c) => !(c.type === type && c.value === value)
    )
    const updated = [{ type, label, value }, ...filtered].slice(0, maxColors)

    recentColors.value = updated

    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem('tiptapRecentlyUsedColors', JSON.stringify(updated))
      } catch (e) {
        console.error('Failed to store colors:', e)
      }
    }
  }

  return { recentColors, addRecentColor, isInitialized }
}

export interface UseColorTextPopoverConfig {
  editor?: Editor | null
  hideWhenUnavailable?: boolean
  onColorChanged?: ({
    type,
    label,
    value,
  }: {
    type: ColorType
    label: string
    value: string
  }) => void
}

export function useColorTextPopover(config?: UseColorTextPopoverConfig) {
  const {
    editor: providedEditor,
    hideWhenUnavailable = false,
    onColorChanged,
  } = config || {}

  const { editor } = useTiptapEditor(providedEditor)
  const isVisible = ref(true)

  const textStyleInSchema = computed(() =>
    isMarkInSchema('textStyle', editor.value)
  )
  const highlightInSchema = computed(() =>
    isMarkInSchema('highlight', editor.value)
  )

  const activeTextStyle = computed(() =>
    getActiveMarkAttrs(editor.value, 'textStyle')
  )
  const activeHighlight = computed(() =>
    getActiveMarkAttrs(editor.value, 'highlight')
  )

  const canToggle = computed(() =>
    canColorText(editor.value) || canColorHighlight(editor.value)
  )

  watch(
    editor,
    (newEditor) => {
      if (!newEditor) return

      const updateVisibility = () => {
        if (!newEditor || !newEditor.isEditable) {
          isVisible.value = false
          return
        }

        if (hideWhenUnavailable && !newEditor.isActive('code')) {
          isVisible.value = canColorText(newEditor) || canColorHighlight(newEditor)
        } else {
          isVisible.value = true
        }
      }

      updateVisibility()

      newEditor.on('selectionUpdate', updateVisibility)

      return () => {
        newEditor.off('selectionUpdate', updateVisibility)
      }
    },
    { immediate: true }
  )

  const handleColorChanged = ({
    type,
    label,
    value,
  }: {
    type: ColorType
    label: string
    value: string
  }) => {
    onColorChanged?.({ type, label, value })
  }

  return {
    isVisible,
    canToggle,
    activeTextStyle,
    activeHighlight,
    handleColorChanged,
    textStyleInSchema,
    highlightInSchema,
  }
}
