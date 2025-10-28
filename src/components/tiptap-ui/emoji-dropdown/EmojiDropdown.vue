<script setup lang="ts">
import type { Editor } from "@tiptap/vue-3";
import type { EmojiItem } from "@tiptap/extension-emoji";

// --- Tiptap UI ---
import type { SuggestionItem } from "@/components/tiptap-ui-utils/suggestion-menu/suggestion-menu-types";
import SuggestionMenu from "@/components/tiptap-ui-utils/suggestion-menu/SuggestionMenu.vue";
import { getFilteredEmojis } from "@/components/tiptap-ui/emoji-menu";

// --- Components ---
import EmojiDropdownList from "./EmojiDropdownList.vue";

interface EmojiDropdownMenuProps {
  editor?: Editor | null;
}

defineProps<EmojiDropdownMenuProps>();

const getItems = ({ query, editor }: { query: string; editor: any }) => {
  const emojis: EmojiItem[] = editor.extensionStorage.emoji.emojis || [];
  const filteredEmojis = getFilteredEmojis({ query, emojis });

  return filteredEmojis.map(
    (emoji): SuggestionItem<EmojiItem> => ({
      title: emoji.name,
      subtext: emoji.shortcodes.join(", "),
      context: emoji,
      onSelect: ({ editor }) => {
        // Insert the emoji node directly
        editor
          .chain()
          .focus()
          .insertContent({
            type: 'emoji',
            attrs: {
              name: emoji.name,
            },
          })
          .run();
      },
    })
  );
};
</script>

<template>
  <SuggestionMenu
    char=":"
    plugin-key="emojiDropdownMenu"
    decoration-class="tiptap-emoji-decoration"
    selector="tiptap-emoji-dropdown-menu"
    :items="getItems"
    :editor="editor"
  >
    <template #default="slotProps">
      <EmojiDropdownList v-bind="slotProps" />
    </template>
  </SuggestionMenu>
</template>
