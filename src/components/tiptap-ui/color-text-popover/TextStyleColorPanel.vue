<template>
  <Card ref="containerRef" :tabindex="0" role="menu">
    <CardBody>
      <RecentColorsSection
        v-if="isInitialized"
        :recent-colors="recentColors"
        :on-color-selected="handleColorSelected"
        :selected-index="selectedIndex"
      />

      <CardItemGroup>
        <CardGroupLabel>Text color</CardGroupLabel>
        <ColorGroup
          type="text"
          :colors="textColorGroups"
          :on-color-selected="handleColorSelected"
          :selected-index="selectedIndex"
          :start-index-offset="textColorStartIndex"
        />
      </CardItemGroup>

      <CardItemGroup>
        <CardGroupLabel>Highlight color</CardGroupLabel>
        <ColorGroup
          type="highlight"
          :colors="highlightColorGroups"
          :on-color-selected="handleColorSelected"
          :selected-index="selectedIndex"
          :start-index-offset="highlightColorStartIndex"
        />
      </CardItemGroup>
    </CardBody>
  </Card>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'

// --- Composables ---
import { useRecentColors, type ColorType } from '@/composables/useColorTextPopover'
import { useMenuNavigation } from '@/composables/useMenuNavigation'
import { TEXT_COLORS } from '@/composables/useColorText'
import { HIGHLIGHT_COLORS } from '@/composables/useColorHighlight'

// --- Utils ---
import { chunkArray } from '@/lib/tiptap-advanced-utils'

// --- UI Primitives ---
import {
  Card,
  CardBody,
  CardGroupLabel,
  CardItemGroup,
} from '@/components/tiptap-ui-primitive/card'

// --- Components ---
import RecentColorsSection from './RecentColorsSection.vue'
import ColorGroup from './ColorGroup.vue'

export interface TextStyleColorPanelProps {
  maxColorsPerGroup?: number
  maxRecentColors?: number
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

const props = withDefaults(defineProps<TextStyleColorPanelProps>(), {
  maxColorsPerGroup: 5,
  maxRecentColors: 3,
})

const { recentColors, addRecentColor, isInitialized } = useRecentColors(
  props.maxRecentColors
)

const containerRef = ref<HTMLDivElement | null>(null)

const textColorGroups = computed(() =>
  chunkArray(TEXT_COLORS, props.maxColorsPerGroup)
)

const highlightColorGroups = computed(() =>
  chunkArray(HIGHLIGHT_COLORS, props.maxColorsPerGroup)
)

const allTextColors = computed(() => textColorGroups.value.flat())

const allHighlightColors = computed(() => highlightColorGroups.value.flat())

const textColorStartIndex = computed(() =>
  isInitialized.value ? recentColors.value.length : 0
)

const highlightColorStartIndex = computed(
  () => textColorStartIndex.value + allTextColors.value.length
)

const menuItems = computed(() => {
  const items = []

  if (isInitialized.value && recentColors.value.length > 0) {
    items.push(
      ...recentColors.value.map((color) => ({
        type: color.type,
        value: color.value,
        label: `Recent ${color.type === 'text' ? 'text' : 'highlight'} color`,
        group: 'recent',
      }))
    )
  }

  items.push(
    ...allTextColors.value.map((color) => ({
      type: 'text' as ColorType,
      value: color.value,
      label: color.label,
      group: 'text',
    }))
  )

  items.push(
    ...allHighlightColors.value.map((color) => ({
      type: 'highlight' as ColorType,
      value: color.value,
      label: color.label,
      group: 'highlight',
    }))
  )

  return items
})

const handleColorSelected = ({
  type,
  label,
  value,
}: {
  type: ColorType
  label: string
  value: string
}) => {
  if (!containerRef.value) return false

  // Get the actual DOM element from the component ref
  const container = containerRef.value
  const domElement = (container instanceof HTMLElement)
    ? container
    : (container as any)?.$el

  if (domElement && domElement.querySelector) {
    const highlightedElement = domElement.querySelector(
      '[data-highlighted="true"]'
    ) as HTMLElement

    if (highlightedElement) {
      highlightedElement.click()
    }
  }

  addRecentColor({ type, label, value })
  props.onColorChanged?.({ type, label, value })
}

const { selectedIndex } = useMenuNavigation({
  containerRef,
  items: menuItems.value,
  onSelect: (item) => {
    if (item) {
      handleColorSelected({
        type: item.type as ColorType,
        label: item.label,
        value: item.value,
      })
    }
  },
  orientation: 'both',
  autoSelectFirstItem: false,
})
</script>
