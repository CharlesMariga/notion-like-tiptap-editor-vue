<script setup lang="ts">
import type { Editor } from "@tiptap/vue-3";

// --- Tiptap UI ---
import { filterSuggestionItems } from "@/components/tiptap-ui-utils/suggestion-menu/suggestion-menu-utils";
import SuggestionMenu from "@/components/tiptap-ui-utils/suggestion-menu/SuggestionMenu.vue";

// --- Hooks ---
import type { SlashMenuConfig } from "@/components/tiptap-ui/slash-dropdown-menu/useSlashDropdownMenu";
import { useSlashDropdownMenu } from "@/components/tiptap-ui/slash-dropdown-menu/useSlashDropdownMenu";

// --- Components ---
import SlashDropdownList from "./SlashDropdownList.vue";

import "@/components/tiptap-ui/slash-dropdown-menu/slash-dropdown-menu.scss";

interface SlashDropdownMenuProps {
  editor?: Editor | null;
  config?: SlashMenuConfig;
}

const props = defineProps<SlashDropdownMenuProps>();

const { getSlashMenuItems } = useSlashDropdownMenu(props.config);

const getItems = ({ query, editor }: { query: string; editor: any }) => {
  return filterSuggestionItems(getSlashMenuItems(editor as Editor), query);
};
</script>

<template>
  <SuggestionMenu
    char="/"
    plugin-key="slashDropdownMenu"
    decoration-class="tiptap-slash-decoration"
    decoration-content="Filter..."
    selector="tiptap-slash-dropdown-menu"
    :items="getItems"
    :editor="editor"
  >
    <template #default="slotProps">
      <SlashDropdownList v-bind="slotProps" :config="config" />
    </template>
  </SuggestionMenu>
</template>
