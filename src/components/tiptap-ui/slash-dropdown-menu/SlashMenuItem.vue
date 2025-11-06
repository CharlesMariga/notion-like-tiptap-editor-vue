<script setup lang="ts">
import { ref, watch } from 'vue'
import type { Component as VueComponent } from 'vue'

import { getElementOverflowPosition } from '@/lib/tiptap-collab-utils'
import type { SuggestionItem } from '@/components/tiptap-ui-utils/suggestion-menu'
import Button from '@/components/tiptap-ui-primitive/button/Button.vue'

interface SlashMenuItemProps {
  item: SuggestionItem
  isSelected: boolean
}

const props = defineProps<SlashMenuItemProps>()
const emit = defineEmits<{
  select: []
}>()

const itemRef = ref<InstanceType<typeof Button> | null>(null)

watch(
  () => props.isSelected,
  (selected) => {
    const selector = document.querySelector(
      '[data-selector="tiptap-slash-dropdown-menu"]'
    ) as HTMLElement
    if (!itemRef.value || !selected || !selector) return

    // Access the actual DOM element from the component instance
    const element = (itemRef.value as any).$el as HTMLElement
    if (!element) return

    const overflow = getElementOverflowPosition(element, selector)

    if (overflow === 'top') {
      element.scrollIntoView({ block: 'nearest', inline: 'nearest' })
    } else if (overflow === 'bottom') {
      element.scrollIntoView({ block: 'nearest', inline: 'nearest' })
    }
  }
)

const handleClick = () => {
  emit('select')
}

const BadgeIcon = props.item.badge as VueComponent | undefined
</script>

<template>
  <Button
    ref="itemRef"
    data-style="ghost"
    :data-active-state="isSelected ? 'on' : 'off'"
    @click="handleClick"
  >
    <component
      v-if="BadgeIcon && typeof BadgeIcon !== 'string'"
      :is="BadgeIcon"
      class="tiptap-button-icon"
    />
    <div class="tiptap-button-text">{{ item.title }}</div>
  </Button>
</template>
