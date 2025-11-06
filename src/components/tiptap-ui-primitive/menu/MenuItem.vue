<script setup lang="ts">
import { DropdownMenuItem } from 'radix-vue'
import { useMenuItemClick } from './menu-hooks'
import { cn } from '@/lib/tiptap-utils'
import type { MenuItemProps } from './menu-types'

const props = withDefaults(defineProps<MenuItemProps & { class?: string }>(), {
  class: '',
  preventClose: false,
})

const hideOnClick = useMenuItemClick(props.preventClose)
</script>

<template>
  <DropdownMenuItem
    :class="cn('tiptap-menu-item', props.class)"
    @click="hideOnClick"
  >
    <slot />
  </DropdownMenuItem>
</template>
