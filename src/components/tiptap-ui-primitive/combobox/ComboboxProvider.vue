<script setup lang="ts">
import { ref, watch } from 'vue'
import { ComboboxRoot } from 'radix-vue'

interface ComboboxProviderProps {
  value?: string
  setValue?: (value: string) => void
}

const props = withDefaults(defineProps<ComboboxProviderProps>(), {
  value: '',
})

const internalValue = ref(props.value)

// Watch for external value changes
watch(() => props.value, (newValue) => {
  if (internalValue.value !== newValue) {
    internalValue.value = newValue
  }
})

// Notify parent of value changes
watch(internalValue, (newValue) => {
  if (props.value !== newValue) {
    props.setValue?.(newValue)
  }
})
</script>

<template>
  <ComboboxRoot v-model="internalValue" v-model:search-term="internalValue">
    <slot />
  </ComboboxRoot>
</template>
