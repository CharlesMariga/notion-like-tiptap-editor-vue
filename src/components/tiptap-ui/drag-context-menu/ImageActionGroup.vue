<template>
  <template v-if="canDownload">
    <BaseMenuItem
      :icon="Icon"
      :label="label"
      :disabled="!canDownload"
      :on-click="handleDownload"
    />
    <Separator orientation="horizontal" />
  </template>
</template>

<script setup lang="ts">
import BaseMenuItem from './BaseMenuItem.vue'
import { Separator } from '@/components/tiptap-ui-primitive/separator'
import { useImageDownload } from '@/composables/useImageDownload'

const { canDownload, handleDownload, label, Icon } = useImageDownload({
  hideWhenUnavailable: true,
})
</script>
