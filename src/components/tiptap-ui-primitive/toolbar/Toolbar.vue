<template>
  <div
    ref="toolbarRef"
    role="toolbar"
    aria-label="toolbar"
    :data-variant="variant"
    :class="cn('tiptap-toolbar', className)"
    v-bind="$attrs"
  >
    <slot />
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { cn } from '@/lib/tiptap-utils'

interface ToolbarProps {
  className?: string
  variant?: 'floating' | 'fixed'
}

withDefaults(defineProps<ToolbarProps>(), {
  variant: 'fixed',
})

const toolbarRef = ref<HTMLDivElement | null>(null)
</script>

<style lang="scss">
@use './toolbar.scss';
</style>
