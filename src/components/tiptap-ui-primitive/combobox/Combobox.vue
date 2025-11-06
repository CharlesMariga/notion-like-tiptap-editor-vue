<script setup lang="ts">
import { ComboboxInput } from 'radix-vue'
import { cn } from '@/lib/tiptap-utils'

interface ComboboxProps {
  modelValue?: string
  class?: string
}

const props = withDefaults(defineProps<ComboboxProps>(), {
  modelValue: '',
  class: '',
})

const emit = defineEmits<{
  (e: 'update:modelValue', value: string): void
}>()
</script>

<template>
  <ComboboxInput
    :model-value="modelValue"
    :class="cn('tiptap-combobox', props.class)"
    @update:model-value="emit('update:modelValue', $event)"
  >
    <slot />
  </ComboboxInput>
</template>
