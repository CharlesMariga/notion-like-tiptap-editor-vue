<template>
  <MenuItem>
    <DropdownMenuSub :open="isOpen" @update:open="handleOpenChange">
      <DropdownMenuSubTrigger
        as-child
        @click.capture="handleClick"
        @pointerenter.capture="handlePointerEnter"
        @pointermove.capture="handlePointerMove"
        @keydown="handleKeyDown"
      >
        <Button data-style="ghost" type="button">
          <component :is="icon" class="tiptap-button-icon" />
          <span class="tiptap-button-text">{{ label }}</span>
          <Spacer />
          <ChevronRightIcon class="tiptap-button-icon" />
        </Button>
      </DropdownMenuSubTrigger>

      <DropdownMenuPortal>
        <DropdownMenuSubContent
          class="tiptap-menu-content"
          :side-offset="0"
          @escape-key-down="closeSubmenu"
        >
          <Card>
            <CardBody>
              <slot />
            </CardBody>
          </Card>
        </DropdownMenuSubContent>
      </DropdownMenuPortal>
    </DropdownMenuSub>
  </MenuItem>
</template>

<script setup lang="ts">
import { ref, inject, provide, watch, type InjectionKey, type Ref } from 'vue'
import type { Component } from 'vue'
import {
  DropdownMenuSub,
  DropdownMenuSubTrigger,
  DropdownMenuSubContent,
  DropdownMenuPortal,
} from 'radix-vue'
import { MenuItem } from '@/components/tiptap-ui-primitive/menu'
import Button from '@/components/tiptap-ui-primitive/button/Button.vue'
import { Card, CardBody } from '@/components/tiptap-ui-primitive/card'
import { Spacer } from '@/components/tiptap-ui-primitive/spacer'
import ChevronRightIcon from '@/components/tiptap-icons/ChevronRightIcon.vue'

interface SubMenuTriggerProps {
  icon: Component
  label: string
}

const props = defineProps<SubMenuTriggerProps>()

// Create a shared context key for active submenu
const ACTIVE_SUBMENU_KEY = Symbol('activeSubmenu') as InjectionKey<Ref<string | null>>

// Get or create the active submenu ref
const activeSubmenu = inject(ACTIVE_SUBMENU_KEY, ref<string | null>(null))

// Provide it for any nested components
provide(ACTIVE_SUBMENU_KEY, activeSubmenu)

const isOpen = ref(false)

// Watch for changes in active submenu - close if another submenu opens
watch(activeSubmenu, (newActive) => {
  if (newActive !== props.label && isOpen.value) {
    isOpen.value = false
  }
})

const handleClick = (e: MouseEvent) => {
  e.preventDefault()
  e.stopPropagation()

  // Toggle this submenu
  if (isOpen.value) {
    closeSubmenu()
  } else {
    openSubmenu()
  }
}

const openSubmenu = () => {
  activeSubmenu.value = props.label
  isOpen.value = true
}

const closeSubmenu = () => {
  isOpen.value = false
  if (activeSubmenu.value === props.label) {
    activeSubmenu.value = null
  }
}

const handleOpenChange = (open: boolean) => {
  // Prevent hover-triggered opens
  // Only allow opens that we explicitly triggered via click
  if (open && activeSubmenu.value !== props.label) {
    // This is a hover-triggered open, ignore it
    return
  }

  // Handle explicit closes
  if (!open && isOpen.value) {
    closeSubmenu()
  }
}

const handlePointerEnter = (e: PointerEvent) => {
  // Stop the event from triggering Radix's hover behavior
  e.stopPropagation()
}

const handlePointerMove = (e: PointerEvent) => {
  // Stop the event from triggering Radix's hover behavior
  e.stopPropagation()
}

const handleKeyDown = (e: KeyboardEvent) => {
  // Right arrow or Enter: open submenu
  if ((e.key === 'ArrowRight' || e.key === 'Enter') && !isOpen.value) {
    e.preventDefault()
    e.stopPropagation()
    openSubmenu()
  }
  // Left arrow: close submenu
  else if (e.key === 'ArrowLeft' && isOpen.value) {
    e.preventDefault()
    e.stopPropagation()
    closeSubmenu()
  }
}
</script>
