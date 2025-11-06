<script setup lang="ts">
import { ref, watchEffect } from 'vue'
import type { SuggestionItem } from '@/components/tiptap-ui-utils/suggestion-menu'
import { getElementOverflowPosition } from '@/lib/tiptap-collab-utils'
import {
  Avatar,
  AvatarImage,
  AvatarFallback,
} from '@/components/tiptap-ui-primitive/avatar'
import { Button } from '@/components/tiptap-ui-primitive/button'

interface User {
  id: number
  name: string
  position: string
  avatarUrl: string
}

interface Props {
  item: SuggestionItem<User>
  isSelected: boolean
}

const props = defineProps<Props>()

const emit = defineEmits<{
  select: []
}>()

const itemRef = ref<InstanceType<typeof Button>>()

watchEffect(() => {
  const menuElement = document.querySelector(
    '[data-selector="tiptap-mention-dropdown-menu"]'
  ) as HTMLElement
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
  emit('select')
}
</script>

<template>
  <Button
    ref="itemRef"
    data-style="ghost"
    :data-active-state="isSelected ? 'on' : 'off'"
    :data-user-id="item.context?.id"
    @click="handleClick"
  >
    <Avatar>
      <AvatarImage :src="item.context?.avatarUrl" :alt="item.title" />
      <AvatarFallback>{{ item.title[0]?.toUpperCase() }}</AvatarFallback>
    </Avatar>

    <span class="tiptap-button-text">{{ item.title }}</span>
  </Button>
</template>
