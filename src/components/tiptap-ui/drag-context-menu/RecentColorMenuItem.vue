<template>
  <TextColorMenuItem v-if="colorObj.type === 'text'" :color="color" />
  <HighlightColorMenuItem v-else :color="color" />
</template>

<script setup lang="ts">
import { computed } from 'vue'
import TextColorMenuItem from './TextColorMenuItem.vue'
import HighlightColorMenuItem from './HighlightColorMenuItem.vue'
import { getColorByValue, type RecentColor } from '@/composables/useRecentColors'
import { TEXT_COLORS } from '@/composables/useColorText'
import { HIGHLIGHT_COLORS } from '@/composables/useColorHighlight'

interface RecentColorMenuItemProps {
  colorObj: RecentColor
}

const props = defineProps<RecentColorMenuItemProps>()

const color = computed(() => {
  const colorSet = props.colorObj.type === 'text' ? TEXT_COLORS : HIGHLIGHT_COLORS
  return getColorByValue(props.colorObj.value, colorSet)
})
</script>
