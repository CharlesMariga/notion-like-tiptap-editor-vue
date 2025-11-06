<template>
  <div
    role="group"
    :class="cn('tiptap-toolbar-group', className)"
    v-bind="$attrs"
  >
    <slot />
  </div>
</template>

<script setup lang="ts">
import { cn } from '@/lib/tiptap-utils'

interface ToolbarGroupProps {
  className?: string
}

defineProps<ToolbarGroupProps>()
</script>
