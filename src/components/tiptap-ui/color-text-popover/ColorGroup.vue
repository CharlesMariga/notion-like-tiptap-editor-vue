<template>
  <ButtonGroup
    v-for="(group, groupIndex) in colors"
    :key="`${type}-group-${groupIndex}`"
    orientation="horizontal"
  >
    <template v-for="(color, colorIndex) in group" :key="`${type}-${color.value}-${colorIndex}`">
      <ColorTextButton
        v-if="type === 'text'"
        :text-color="color.value"
        :label="color.label"
        :tooltip="color.label"
        :on-applied="() => handleColorClick(color)"
        :tabindex="getItemIndex(groupIndex, colorIndex) === selectedIndex ? 0 : -1"
        :data-highlighted="getItemIndex(groupIndex, colorIndex) === selectedIndex"
        :aria-label="`${color.label} text color`"
      />
      <ColorHighlightButton
        v-else
        :highlight-color="color.value"
        :tooltip="color.label"
        :on-applied="() => handleColorClick(color)"
        :tabindex="getItemIndex(groupIndex, colorIndex) === selectedIndex ? 0 : -1"
        :data-highlighted="getItemIndex(groupIndex, colorIndex) === selectedIndex"
        :aria-label="`${color.label} highlight color`"
      />
    </template>
  </ButtonGroup>
</template>

<script setup lang="ts">
import type { ColorType, ColorItem } from '@/composables/useColorTextPopover'

// --- UI Primitives ---
import { ButtonGroup } from '@/components/tiptap-ui-primitive/button'

// --- UI Components ---
import ColorTextButton from '@/components/tiptap-ui/color-text-button/ColorTextButton.vue'
import ColorHighlightButton from '@/components/tiptap-ui/color-highlight-button/ColorHighlightButton.vue'

const props = defineProps<{
  type: ColorType
  colors: ColorItem[][]
  onColorSelected: ({
    type,
    label,
    value,
  }: {
    type: ColorType
    label: string
    value: string
  }) => void
  selectedIndex?: number
  startIndexOffset: number
}>()

const getItemIndex = (groupIndex: number, colorIndex: number): number => {
  return (
    props.startIndexOffset +
    props.colors.slice(0, groupIndex).reduce((acc, g) => acc + g.length, 0) +
    colorIndex
  )
}

const handleColorClick = (color: ColorItem) => {
  props.onColorSelected({
    type: props.type,
    label: color.label,
    value: color.value,
  })
}
</script>
