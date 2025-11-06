<script setup lang="ts">
import { DropdownMenuGroup } from 'radix-vue'
import { cn } from '@/lib/tiptap-utils'

defineProps<{ class?: string }>()
</script>

<template>
  <DropdownMenuGroup :class="cn('tiptap-menu-group', $props.class)">
    <slot />
  </DropdownMenuGroup>
</template>
