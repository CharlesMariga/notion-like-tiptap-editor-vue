<template>
  <div :class="cn('tiptap-card-header', className)" v-bind="$attrs">
    <slot />
  </div>
</template>

<script setup lang="ts">
import { cn } from '@/lib/tiptap-utils'

interface CardHeaderProps {
  className?: string
}

defineProps<CardHeaderProps>()
</script>
