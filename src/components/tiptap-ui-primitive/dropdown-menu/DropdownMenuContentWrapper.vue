<script setup lang="ts">
import { DropdownMenuContent, DropdownMenuPortal } from 'radix-vue'
import { type HTMLAttributes } from 'vue'
import { cn } from '@/lib/tiptap-utils'
import './dropdown-menu.scss'

export interface DropdownMenuContentWrapperProps {
  class?: HTMLAttributes['class']
  sideOffset?: number
  side?: 'top' | 'right' | 'bottom' | 'left'
  align?: 'start' | 'center' | 'end'
  alignOffset?: number
  avoidCollisions?: boolean
  portal?: boolean
}

const props = withDefaults(defineProps<DropdownMenuContentWrapperProps>(), {
  sideOffset: 4,
  portal: false,
})
</script>

<template>
  <component :is="portal ? DropdownMenuPortal : 'template'">
    <DropdownMenuContent
      :class="cn('tiptap-dropdown-menu', props.class)"
      :side-offset="sideOffset"
      :side="side"
      :align="align"
      :align-offset="alignOffset"
      :avoid-collisions="avoidCollisions"
      @close-auto-focus.prevent
    >
      <slot />
    </DropdownMenuContent>
  </component>
</template>
