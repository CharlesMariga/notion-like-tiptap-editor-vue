<template>
  <div :class="cn('tiptap-card', className)" v-bind="$attrs">
    <slot />
  </div>
</template>

<script setup lang="ts">
import { cn } from '@/lib/tiptap-utils'

interface CardProps {
  className?: string
}

defineProps<CardProps>()
</script>

<style lang="scss">
@use './card.scss' as *;
</style>
