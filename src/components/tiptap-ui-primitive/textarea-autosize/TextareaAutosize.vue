<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount, watch, nextTick } from 'vue'
import autosize from 'autosize'

interface TextareaAutosizeProps {
  modelValue?: string
  placeholder?: string
  rows?: number
  maxRows?: number
}

const props = defineProps<TextareaAutosizeProps>()
const emit = defineEmits<{
  'update:modelValue': [value: string]
}>()

const textareaRef = ref<HTMLTextAreaElement | null>(null)

onMounted(async () => {
  await nextTick()
  if (textareaRef.value) {
    autosize(textareaRef.value)
  }
})

onBeforeUnmount(() => {
  if (textareaRef.value) {
    autosize.destroy(textareaRef.value)
  }
})

// Watch for external modelValue changes and update autosize
watch(() => props.modelValue, async () => {
  await nextTick()
  if (textareaRef.value) {
    autosize.update(textareaRef.value)
  }
})

const handleInput = (event: Event) => {
  const target = event.target as HTMLTextAreaElement
  emit('update:modelValue', target.value)
}
</script>

<template>
  <textarea
    ref="textareaRef"
    :value="modelValue"
    :placeholder="placeholder"
    :rows="rows"
    @input="handleInput"
    v-bind="$attrs"
  />
</template>
