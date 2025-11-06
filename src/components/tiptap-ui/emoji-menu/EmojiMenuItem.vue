<script setup lang="ts">
import { ref, watchEffect } from 'vue'
import type { EmojiItem } from '@tiptap/extension-emoji'
import { getElementOverflowPosition } from '@/lib/tiptap-collab-utils'
import { Button } from '@/components/tiptap-ui-primitive/button'

interface Props {
  emoji: EmojiItem
  index: number
  isSelected: boolean
  selector: string
}

const props = defineProps<Props>()

const emit = defineEmits<{
  select: [emoji: EmojiItem]
}>()

const itemRef = ref<InstanceType<typeof Button>>()

watchEffect(() => {
  const menuElement = document.querySelector(props.selector) as HTMLElement
  if (!itemRef.value || !props.isSelected || !menuElement) return

  // Access the actual DOM element from the component instance
  const element = (itemRef.value as any).$el as HTMLElement
  if (!element) return

  const overflow = getElementOverflowPosition(element, menuElement)
  if (overflow === 'top') {
    element.scrollIntoView({ block: 'nearest', inline: 'nearest' })
  } else if (overflow === 'bottom') {
    element.scrollIntoView({ block: 'nearest', inline: 'nearest' })
  }
})

const handleClick = () => {
  emit('select', props.emoji)
}
</script>

<template>
  <Button
    v-if="emoji"
    ref="itemRef"
    data-style="ghost"
    :data-active-state="isSelected ? 'on' : 'off'"
    @click="handleClick"
  >
    <img
      v-if="emoji.fallbackImage"
      class="tiptap-button-emoji"
      :src="emoji.fallbackImage"
      :alt="emoji.name"
    />
    <span v-else class="tiptap-button-emoji">{{ emoji.emoji }}</span>
    <span class="tiptap-button-text">:{{ emoji.name }}:</span>
  </Button>
</template>
