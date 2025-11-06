<script setup lang="ts">
import { inject } from 'vue'
import type { Editor, Range } from '@tiptap/core'
import type { ShallowRef } from 'vue'
import type { EmojiItem } from '@tiptap/extension-emoji'
import type {
  SuggestionItem,
  SuggestionMenuProps,
  SuggestionMenuRenderProps,
} from '@/components/tiptap-ui-utils/suggestion-menu'
import SuggestionMenu from '@/components/tiptap-ui-utils/suggestion-menu/SuggestionMenu.vue'
import { EmojiMenuItem, getFilteredEmojis } from '@/components/tiptap-ui/emoji-menu'
import { Card, CardBody } from '@/components/tiptap-ui-primitive/card'
import { ButtonGroup } from '@/components/tiptap-ui-primitive/button'

export type EmojiDropdownMenuProps = Omit<
  SuggestionMenuProps,
  'items' | 'children'
>

const props = defineProps<EmojiDropdownMenuProps>()

// Inject editor from parent if not provided as prop
const injectedEditor = inject<ShallowRef<Editor | null>>('editor')
const editor = props.editor ?? (injectedEditor as any)

const getSuggestionItems = async (params: { query: string; editor: Editor }) => {
  const emojis: EmojiItem[] = params.editor.extensionStorage.emoji.emojis || []
  const filteredEmojis = getFilteredEmojis({ query: params.query, emojis })

  return filteredEmojis.map(
    (emoji): SuggestionItem<EmojiItem> => ({
      title: emoji.name,
      subtext: emoji.shortcodes.join(', '),
      context: emoji,
      onSelect: (params: {
        editor: Editor
        range: Range
        context?: EmojiItem
      }) => {
        if (!params.editor || !params.range || !params.context) return
        params.editor.chain().focus().setEmoji(params.context.name).run()
      },
    })
  )
}
</script>

<template>
  <SuggestionMenu
    v-bind="props"
    :editor="editor"
    char=":"
    plugin-key="emojiDropdownMenu"
    decoration-class="tiptap-emoji-decoration"
    selector="tiptap-emoji-dropdown-menu"
    :items="getSuggestionItems"
  >
    <template #default="{ items, selectedIndex, onSelect }: SuggestionMenuRenderProps<EmojiItem>">
      <Card
        v-if="items.length"
        :style="{
          maxHeight: 'var(--suggestion-menu-max-height)',
        }"
      >
        <CardBody>
          <ButtonGroup>
            <EmojiMenuItem
              v-for="(item, index) in items"
              v-show="item.context"
              :key="item.title"
              :emoji="item.context!"
              :index="index"
              :is-selected="index === selectedIndex"
              selector="[data-selector='tiptap-emoji-dropdown-menu']"
              @select="() => onSelect(item)"
            />
          </ButtonGroup>
        </CardBody>
      </Card>
    </template>
  </SuggestionMenu>
</template>
