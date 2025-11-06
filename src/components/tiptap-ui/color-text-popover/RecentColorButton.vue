<template>
  <ColorTextButton
    v-if="colorObj.type === 'text'"
    :text-color="color.value"
    :label="color.label"
    :tooltip="color.label"
    :text="withLabel ? color.label : undefined"
    :on-applied="handleApplied"
    v-bind="$attrs"
  />
  <ColorHighlightButton
    v-else
    :highlight-color="color.value"
    :tooltip="color.label"
    :on-applied="handleApplied"
    v-bind="$attrs"
  />
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { RecentColor, ColorType } from '@/composables/useColorTextPopover'
import { getColorByValue } from '@/composables/useColorTextPopover'
import { TEXT_COLORS } from '@/composables/useColorText'
import { HIGHLIGHT_COLORS } from '@/composables/useColorHighlight'

// --- UI Components ---
import ColorTextButton from '@/components/tiptap-ui/color-text-button/ColorTextButton.vue'
import ColorHighlightButton from '@/components/tiptap-ui/color-highlight-button/ColorHighlightButton.vue'

const props = withDefaults(
  defineProps<{
    colorObj: RecentColor
    withLabel?: boolean
    onColorChanged?: ({
      type,
      label,
      value,
    }: {
      type: ColorType
      label: string
      value: string
    }) => void
  }>(),
  {
    withLabel: false,
  }
)

const colorSet = computed(() =>
  props.colorObj.type === 'text' ? TEXT_COLORS : HIGHLIGHT_COLORS
)

const color = computed(() =>
  getColorByValue(props.colorObj.value, colorSet.value)
)

const handleApplied = () => {
  props.onColorChanged?.({
    type: props.colorObj.type,
    label: color.value.label,
    value: color.value.value,
  })
}
</script>
