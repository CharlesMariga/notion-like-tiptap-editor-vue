<template>
  <CardItemGroup v-if="recentColors.length > 0">
    <CardGroupLabel>Recently used</CardGroupLabel>
    <ButtonGroup orientation="horizontal">
      <RecentColorButton
        v-for="(colorObj, index) in recentColors"
        :key="`recent-${colorObj.type}-${colorObj.value}`"
        :color-obj="colorObj"
        :on-color-changed="onColorSelected"
        :tabindex="selectedIndex === index ? 0 : -1"
        :data-highlighted="selectedIndex === index"
      />
    </ButtonGroup>
  </CardItemGroup>
</template>

<script setup lang="ts">
import type { RecentColor, ColorType } from '@/composables/useColorTextPopover'

// --- UI Primitives ---
import { ButtonGroup } from '@/components/tiptap-ui-primitive/button'
import { CardItemGroup, CardGroupLabel } from '@/components/tiptap-ui-primitive/card'

// --- Components ---
import RecentColorButton from './RecentColorButton.vue'

defineProps<{
  recentColors: RecentColor[]
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
}>()
</script>
