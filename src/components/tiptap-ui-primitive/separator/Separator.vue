<template>
  <div
    :class="cn('tiptap-separator', className)"
    :data-orientation="orientation"
    v-bind="{ ...semanticProps, ...$attrs }"
  />
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { cn } from '@/lib/tiptap-utils'

type Orientation = 'horizontal' | 'vertical'

interface SeparatorProps {
  className?: string
  orientation?: Orientation
  decorative?: boolean
}

const props = withDefaults(defineProps<SeparatorProps>(), {
  orientation: 'vertical',
  decorative: false,
})

const semanticProps = computed(() => {
  if (props.decorative) {
    return { role: 'none' }
  }
  const ariaOrientation = props.orientation === 'vertical' ? props.orientation : undefined
  return {
    'aria-orientation': ariaOrientation,
    role: 'separator',
  }
})
</script>

<style lang="scss">
@use './separator.scss' as *;
</style>
