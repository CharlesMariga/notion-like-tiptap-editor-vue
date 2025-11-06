<template>
  <button
    :class="cn('tiptap-button', className)"
    :aria-label="ariaLabel"
    :data-active-state="activeState ? 'on' : undefined"
    :data-size="size"
    :data-style="buttonStyle"
    :data-appearance="appearance"
    v-bind="$attrs"
  >
    <slot />
  </button>
</template>

<script setup lang="ts">
import { cn } from '@/lib/tiptap-utils'

interface ButtonProps {
  className?: string
  ariaLabel?: string
  activeState?: boolean
  size?: 'small' | 'default' | 'large'
  buttonStyle?: 'default' | 'ghost' | 'primary'
  appearance?: 'default' | 'emphasized' | 'subdued'
}

withDefaults(defineProps<ButtonProps>(), {
  size: 'default',
  buttonStyle: 'default',
  appearance: 'default',
  activeState: false,
})
</script>

<style lang="scss">
@use './button-colors.scss' as *;
@use './button.scss' as *;
</style>
