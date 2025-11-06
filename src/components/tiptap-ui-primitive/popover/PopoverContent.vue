<script setup lang="ts">
import { PopoverContent as RadixPopoverContent, PopoverPortal } from 'radix-vue'
import { cn } from '@/lib/tiptap-utils'

interface PopoverContentProps {
  className?: string
  align?: 'start' | 'center' | 'end'
  sideOffset?: number
}

withDefaults(defineProps<PopoverContentProps>(), {
  align: 'center',
  sideOffset: 4,
})
</script>

<template>
  <PopoverPortal>
    <RadixPopoverContent
      :align="align"
      :side-offset="sideOffset"
      :class="cn('tiptap-popover', className)"
      v-bind="$attrs"
    >
      <slot />
    </RadixPopoverContent>
  </PopoverPortal>
</template>

<style lang="scss">
@use './popover.scss' as *;
</style>
