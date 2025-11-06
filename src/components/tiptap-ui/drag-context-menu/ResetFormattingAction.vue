<template>
  <BaseMenuItem
    :icon="Icon"
    :label="label"
    :disabled="!canReset"
    :on-click="handleResetFormatting"
  />
</template>

<script setup lang="ts">
import BaseMenuItem from './BaseMenuItem.vue'
import { useResetAllFormatting } from '@/composables/useResetAllFormatting'

const { canReset, handleResetFormatting, label, Icon } = useResetAllFormatting({
  hideWhenUnavailable: true,
  preserveMarks: ['inlineThread'],
})
</script>
