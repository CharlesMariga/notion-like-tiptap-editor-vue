<script setup lang="ts" generic="T extends EmojiItem">
import { ref, computed } from 'vue'
import type { EmojiItem } from '@tiptap/extension-emoji'
import { useMenuNavigation } from '@/composables/useMenuNavigation'
import { ButtonGroup } from '@/components/tiptap-ui-primitive/button'
import { Input } from '@/components/tiptap-ui-primitive/input'
import { Card, CardBody, CardHeader } from '@/components/tiptap-ui-primitive/card'
import { getFilteredEmojis } from './emoji-menu-utils'
import EmojiMenuItem from './EmojiMenuItem.vue'

import './emoji-menu.scss'

export interface EmojiMenuProps<T extends EmojiItem> {
  emojis: T[]
  onSelect?: (emoji: T) => void
  onClose?: () => void
  showSearch?: boolean
  selector?: string
}

const props = withDefaults(defineProps<EmojiMenuProps<T>>(), {
  showSearch: false,
  selector: '.emoji-menu-list',
})

const emit = defineEmits<{
  select: [emoji: T]
  close: []
}>()

const containerRef = ref<HTMLElement | null>(null)
const searchRef = ref<HTMLInputElement>()
const searchQuery = ref('')

const filteredEmojis = computed(() => {
  return getFilteredEmojis({ query: searchQuery.value, emojis: props.emojis })
})

const { selectedIndex } = useMenuNavigation({
  containerRef,
  query: searchQuery,
  items: filteredEmojis,
  onSelect: (emoji: any) => {
    props.onSelect?.(emoji as T)
    emit('select', emoji as T)
  },
  onClose: () => {
    props.onClose?.()
    emit('close')
  },
})

const handleSelect = (emoji: T) => {
  props.onSelect?.(emoji)
  emit('select', emoji)
}
</script>

<template>
  <Card ref="containerRef">
    <CardHeader v-if="showSearch">
      <Input
        ref="searchRef"
        v-model="searchQuery"
        type="text"
        placeholder="Add a emoji reaction..."
        autofocus
        class="emoji-menu-search-input"
      />
    </CardHeader>

    <CardBody v-if="filteredEmojis.length" class="emoji-menu-list">
      <ButtonGroup>
        <EmojiMenuItem
          v-for="(emoji, index) in filteredEmojis"
          :key="emoji.name"
          :emoji="emoji"
          :index="index"
          :is-selected="index === selectedIndex"
          :selector="selector"
          @select="(handleSelect as any)"
        />
      </ButtonGroup>
    </CardBody>
  </Card>
</template>
