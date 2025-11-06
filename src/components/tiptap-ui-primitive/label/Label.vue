<script setup lang="ts">
import { type HTMLAttributes } from 'vue'
import { cn } from '@/lib/tiptap-utils'
import './label.scss'

export interface LabelProps {
  as?: 'label' | 'div'
  htmlFor?: string
  class?: HTMLAttributes['class']
}

const props = withDefaults(defineProps<LabelProps>(), {
  as: 'div',
})

const handleMouseDown = (event: MouseEvent) => {
  if (props.as === 'label') {
    // only prevent text selection if clicking inside the label itself
    const target = event.target as HTMLElement
    if (target.closest('button, input, select, textarea')) return

    // prevent text selection when double clicking label
    if (!event.defaultPrevented && event.detail > 1) {
      event.preventDefault()
    }
  }
}
</script>

<template>
  <component
    :is="as"
    :for="as === 'label' ? htmlFor : undefined"
    :class="cn('tiptap-label', props.class)"
    @mousedown="handleMouseDown"
  >
    <slot />
  </component>
</template>
