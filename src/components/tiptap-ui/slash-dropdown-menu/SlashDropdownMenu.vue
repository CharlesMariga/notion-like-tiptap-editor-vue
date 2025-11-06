<template>
  <SuggestionMenu
    char="/"
    plugin-key="slashDropdownMenu"
    decoration-class="tiptap-slash-decoration"
    decoration-content="Filter..."
    selector="tiptap-slash-dropdown-menu"
    :items="getItems"
    :editor="editor"
    v-bind="$attrs"
  >
    <template #default="{ items, selectedIndex, onSelect }">
      <List
        :items="items"
        :selected-index="selectedIndex"
        :on-select="onSelect"
        :config="config"
      />
    </template>
  </SuggestionMenu>
</template>

<script setup lang="ts">
import { inject } from 'vue'
import type { Editor } from '@tiptap/vue-3'
import type { ShallowRef } from 'vue'

import { SuggestionMenu, filterSuggestionItems } from '@/components/tiptap-ui-utils/suggestion-menu'
import type { SlashMenuConfig } from './useSlashDropdownMenu'
import { useSlashDropdownMenu } from './useSlashDropdownMenu'
import List from './SlashDropdownMenuList.vue'

interface SlashDropdownMenuProps {
  editor?: Editor | null
  config?: SlashMenuConfig
}

const props = defineProps<SlashDropdownMenuProps>()

// Inject editor from parent if not provided as prop
const injectedEditor = inject<ShallowRef<Editor | null>>('editor')
// SuggestionMenu can handle both Editor and ShallowRef<Editor>, so pass the ref directly
const editor = props.editor ?? (injectedEditor as any)

const { getSlashMenuItems } = useSlashDropdownMenu(props.config)

const getItems = (args: { query: string; editor: any }) => {
  return filterSuggestionItems(getSlashMenuItems(args.editor as Editor), args.query)
}
</script>

<style lang="scss">
@use './slash-dropdown-menu.scss';
</style>
