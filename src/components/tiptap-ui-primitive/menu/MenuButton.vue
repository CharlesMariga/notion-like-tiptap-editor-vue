<script setup lang="ts">
import { DropdownMenuTrigger } from 'radix-vue'
import { cn } from '@/lib/tiptap-utils'

defineProps<{ class?: string }>()
</script>

<template>
  <DropdownMenuTrigger :class="cn('tiptap-menu-button', $props.class)" as-child>
    <slot />
  </DropdownMenuTrigger>
</template>
