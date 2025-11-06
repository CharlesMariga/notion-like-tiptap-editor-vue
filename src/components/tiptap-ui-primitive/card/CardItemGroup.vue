<template>
  <div
    :class="cn('tiptap-card-item-group', className)"
    :data-orientation="orientation"
    v-bind="$attrs"
  >
    <slot />
  </div>
</template>

<script setup lang="ts">
import { cn } from '@/lib/tiptap-utils'

interface CardItemGroupProps {
  className?: string
  orientation?: 'horizontal' | 'vertical'
}

withDefaults(defineProps<CardItemGroupProps>(), {
  orientation: 'vertical',
})
</script>
