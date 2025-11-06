<template>
  <div :class="cn('tiptap-card-body', className)" v-bind="$attrs">
    <slot />
  </div>
</template>

<script setup lang="ts">
import { cn } from '@/lib/tiptap-utils'

interface CardBodyProps {
  className?: string
}

defineProps<CardBodyProps>()
</script>
