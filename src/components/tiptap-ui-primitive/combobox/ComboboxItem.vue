<script setup lang="ts">
import { ComboboxItem as RadixComboboxItem } from 'radix-vue'
import { cn } from '@/lib/tiptap-utils'

interface ComboboxItemProps {
  value: string
  class?: string
  hideOnClick?: boolean | ((event: MouseEvent) => boolean)
}

const props = withDefaults(defineProps<ComboboxItemProps>(), {
  class: '',
  hideOnClick: true,
})

const handleClick = (event: MouseEvent) => {
  if (typeof props.hideOnClick === 'function') {
    props.hideOnClick(event)
  }
}
</script>

<template>
  <RadixComboboxItem
    :value="value"
    :class="cn('tiptap-combobox-item', props.class)"
    @click="handleClick"
  >
    <slot />
  </RadixComboboxItem>
</template>
