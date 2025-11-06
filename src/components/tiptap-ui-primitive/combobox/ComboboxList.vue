<script setup lang="ts">
import { ComboboxContent } from 'radix-vue'
import { cn } from '@/lib/tiptap-utils'

defineProps<{ class?: string }>()
</script>

<template>
  <ComboboxContent :class="cn('tiptap-combobox-list', $props.class)">
    <slot />
  </ComboboxContent>
</template>
