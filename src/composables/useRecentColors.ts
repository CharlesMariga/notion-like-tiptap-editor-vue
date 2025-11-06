import { ref, onMounted } from 'vue'

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
 * Hook to manage recently used colors in localStorage
 * @param maxColors Maximum number of recent colors to store (default: 3)
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
    // Remove existing entry with same type and value
    const filtered = recentColors.value.filter(
      (c) => !(c.type === type && c.value === value)
    )
    // Add new color at the beginning and limit to maxColors
    const updated = [{ type, label, value }, ...filtered].slice(0, maxColors)
    recentColors.value = updated

    try {
      localStorage.setItem('tiptapRecentlyUsedColors', JSON.stringify(updated))
    } catch (e) {
      console.error('Failed to store colors:', e)
    }
  }

  return { recentColors, addRecentColor, isInitialized }
}
