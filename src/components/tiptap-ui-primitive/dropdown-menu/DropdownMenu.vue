<script setup lang="ts">
import { DropdownMenuRoot } from 'radix-vue'

export interface DropdownMenuProps {
  defaultOpen?: boolean
  open?: boolean
  modal?: boolean
}

withDefaults(defineProps<DropdownMenuProps>(), {
  modal: false,
})

const emit = defineEmits<{
  'update:open': [value: boolean]
}>()

const handleOpenChange = (value: boolean) => {
  emit('update:open', value)
}
</script>

<template>
  <DropdownMenuRoot
    :default-open="defaultOpen"
    :open="open"
    :modal="modal"
    @update:open="handleOpenChange"
  >
    <slot />
  </DropdownMenuRoot>
</template>
