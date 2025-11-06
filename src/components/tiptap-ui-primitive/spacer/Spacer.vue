<script setup lang="ts">
import { computed } from 'vue'

export type SpacerOrientation = 'horizontal' | 'vertical'

interface SpacerProps {
  orientation?: SpacerOrientation
  size?: string | number
}

const props = withDefaults(defineProps<SpacerProps>(), {
  orientation: 'horizontal',
  size: undefined,
})

const computedStyle = computed(() => {
  const style: Record<string, any> = {}

  if (props.orientation === 'horizontal' && !props.size) {
    style.flex = 1
  }

  if (props.size) {
    style.width = props.orientation === 'vertical' ? '1px' : props.size
    style.height = props.orientation === 'horizontal' ? '1px' : props.size
  }

  return style
})
</script>

<template>
  <div :style="computedStyle" v-bind="$attrs" />
</template>
