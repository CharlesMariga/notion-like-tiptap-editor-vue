import { ref, onMounted, onUnmounted, computed, markRaw } from 'vue'
import type { Editor } from '@tiptap/vue-3'

// --- Composables ---
import { useTiptapEditor } from '@/composables/useTiptapEditor'

// --- Icons ---
import TextColorSmallIcon from '@/components/tiptap-icons/TextColorSmallIcon.vue'

// --- Lib ---
import { getActiveMarkAttrs } from '@/lib/tiptap-advanced-utils'

// --- Tiptap UI ---
import { canColorText } from '@/composables/useColorText'
import { canColorHighlight } from '@/composables/useColorHighlight'

export type ColorType = 'text' | 'highlight'

export interface ColorItem {
  value: string
  label: string
}

export interface RecentColor {
  type: ColorType
  label: string
  value: string
}

/**
 * Configuration for the color text popover functionality
 */
export interface UseColorTextPopoverConfig {
  /**
   * The Tiptap editor instance.
   */
  editor?: Editor | null
  /**
   * Whether the popover should hide when color text is not available.
   * @default false
   */
  hideWhenUnavailable?: boolean
  /**
   * Callback function called after a color is applied.
   */
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

/**
 * Get a color object by its value
 */
export function getColorByValue(
  value: string,
  colorArray: ColorItem[]
): ColorItem {
  return (
    colorArray.find((color) => color.value === value) ?? {
      value,
      label: value,
    }
  )
}

/**
 * Checks if color text popover should be shown
 */
export function shouldShowColorTextPopover(params: {
  editor: Editor | null
  hideWhenUnavailable: boolean
}): boolean {
  const { editor, hideWhenUnavailable } = params

  if (!editor || !editor.isEditable) return false

  if (hideWhenUnavailable && !editor.isActive('code')) {
    return canColorText(editor) || canColorHighlight(editor)
  }

  return true
}

/**
 * Hook to manage recently used colors
 */
export function useRecentColors(maxColors: number = 3) {
  const recentColors = ref<RecentColor[]>([])
  const isInitialized = ref(false)

  onMounted(() => {
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
  })

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

    try {
      localStorage.setItem('tiptapRecentlyUsedColors', JSON.stringify(updated))
    } catch (e) {
      console.error('Failed to store colors:', e)
    }

    recentColors.value = updated
  }

  return { recentColors, addRecentColor, isInitialized }
}

/**
 * Custom composable that provides color text popover functionality for Tiptap editor
 */
export function useColorTextPopover(config?: UseColorTextPopoverConfig) {
  const {
    editor: providedEditor,
    hideWhenUnavailable = false,
    onColorChanged,
  } = config || {}

  const { editor } = useTiptapEditor(providedEditor)
  const isVisible = ref(true)

  // Schema checks - can be used for validation if needed
  // const textStyleInSchema = computed(() => isMarkInSchema('textStyle', editor.value))
  // const highlightInSchema = computed(() => isMarkInSchema('highlight', editor.value))

  const activeTextStyle = computed(() => getActiveMarkAttrs(editor.value, 'textStyle') || {})
  const activeHighlight = computed(() => getActiveMarkAttrs(editor.value, 'highlight') || {})

  const canToggle = computed(() =>
    canColorText(editor.value) || canColorHighlight(editor.value)
  )

  // Cleanup array
  const cleanup: Array<() => void> = []

  onMounted(() => {
    if (!editor.value) return

    const updateVisibility = () => {
      isVisible.value = shouldShowColorTextPopover({
        editor: editor.value,
        hideWhenUnavailable,
      })
    }

    updateVisibility()

    editor.value.on('selectionUpdate', updateVisibility)
    cleanup.push(() => editor.value?.off('selectionUpdate', updateVisibility))
  })

  onUnmounted(() => {
    cleanup.forEach(fn => fn())
  })

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
    label: 'Text color',
    Icon: markRaw(TextColorSmallIcon),
  }
}
