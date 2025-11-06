<template>
  <input
    :type="type"
    :class="cn('tiptap-input', className)"
    v-bind="$attrs"
  />
</template>

<script setup lang="ts">
import { cn } from '@/lib/tiptap-utils'

interface InputProps {
  className?: string
  type?: string
}

withDefaults(defineProps<InputProps>(), {
  type: 'text',
})
</script>

<style lang="scss">
@use './input.scss' as *;
</style>
