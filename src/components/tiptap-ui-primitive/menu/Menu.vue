<script setup lang="ts">
import { provide, computed, ref } from 'vue'
import { DropdownMenuRoot } from 'radix-vue'
import { SEARCHABLE_CONTEXT_KEY, MENU_CONTEXT_KEY } from './menu-context'
import type { MenuProps } from './menu-types'
import { ComboboxProvider } from '@/components/tiptap-ui-primitive/combobox'
import './menu.scss'

const props = withDefaults(defineProps<MenuProps>(), {
  open: undefined,
})

const emit = defineEmits<{
  (e: 'update:open', value: boolean): void
  (e: 'update:value', value: string): void
  (e: 'update:values', values: Record<string, string>): void
}>()

const isRootMenu = true // We'll determine this later if needed
const internalOpen = ref(false)
// Temporarily disable searchable to test if ComboboxProvider is causing issues
const searchable = computed(() => false) // was: !!props.onValuesChange || isRootMenu

const isOpen = computed({
  get: () => props.open ?? internalOpen.value,
  set: (value) => {
    if (internalOpen.value !== value) {
      internalOpen.value = value
    }
    props.onOpenChange?.(value)
    emit('update:open', value)
  },
})

const menuContextValue = computed(() => ({
  isRootMenu,
  open: isOpen.value,
}))

const handleValueChange = (value: string) => {
  props.onValueChange?.(value)
  emit('update:value', value)
}

// Provide contexts
provide(SEARCHABLE_CONTEXT_KEY, searchable)
provide(MENU_CONTEXT_KEY, menuContextValue)
</script>

<template>
  <ComboboxProvider v-if="searchable" :value="value" :set-value="handleValueChange">
    <DropdownMenuRoot :open="isOpen" @update:open="isOpen = $event">
      <slot name="trigger" />
      <slot />
    </DropdownMenuRoot>
  </ComboboxProvider>
  <DropdownMenuRoot v-else :open="isOpen" @update:open="isOpen = $event">
    <slot name="trigger" />
    <slot />
  </DropdownMenuRoot>
</template>
