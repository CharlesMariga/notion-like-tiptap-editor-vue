<template>
  <div :class="cn('tiptap-card-group-label', className)" v-bind="$attrs">
    <slot />
  </div>
</template>

<script setup lang="ts">
import { cn } from '@/lib/tiptap-utils'

defineProps<{ className?: string }>()
</script>
