<template>
  <div :class="cn('tiptap-input-group', className)" v-bind="$attrs">
    <slot />
  </div>
</template>

<script setup lang="ts">
import { cn } from '@/lib/tiptap-utils'

interface InputGroupProps {
  className?: string
}

defineProps<InputGroupProps>()
</script>
