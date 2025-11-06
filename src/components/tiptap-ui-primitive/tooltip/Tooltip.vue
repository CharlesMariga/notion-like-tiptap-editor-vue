<script setup lang="ts">
import {
  TooltipContent,
  TooltipPortal,
  TooltipProvider,
  TooltipRoot,
  TooltipTrigger,
} from 'radix-vue'
import { type HTMLAttributes } from 'vue'
import { cn } from '@/lib/tiptap-utils'
import './tooltip.scss'

export interface TooltipProps {
  defaultOpen?: boolean
  open?: boolean
  delayDuration?: number
  disableHoverableContent?: boolean
  side?: 'top' | 'right' | 'bottom' | 'left'
  sideOffset?: number
  align?: 'start' | 'center' | 'end'
  alignOffset?: number
  avoidCollisions?: boolean
  class?: HTMLAttributes['class']
  contentClass?: HTMLAttributes['class']
}

withDefaults(defineProps<TooltipProps>(), {
  delayDuration: 600,
  sideOffset: 4,
  side: 'top',
  align: 'center',
  avoidCollisions: true,
})

const emit = defineEmits<{
  'update:open': [value: boolean]
}>()

const handleOpenChange = (value: boolean) => {
  emit('update:open', value)
}
</script>

<template>
  <TooltipProvider :delay-duration="delayDuration" :disable-hoverable-content="disableHoverableContent">
    <TooltipRoot
      :default-open="defaultOpen"
      :open="open"
      @update:open="handleOpenChange"
    >
      <TooltipTrigger as-child>
        <slot name="trigger" />
      </TooltipTrigger>

      <TooltipPortal>
        <TooltipContent
          :class="cn('tiptap-tooltip', contentClass)"
          :side="side"
          :side-offset="sideOffset"
          :align="align"
          :align-offset="alignOffset"
          :avoid-collisions="avoidCollisions"
        >
          <slot />
        </TooltipContent>
      </TooltipPortal>
    </TooltipRoot>
  </TooltipProvider>
</template>
