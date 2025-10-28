<script setup lang="ts" generic="T extends EmojiItem">
import { ref, computed, h, type VNode } from "vue";
import type { EmojiItem } from "@tiptap/extension-emoji";

// --- Composables ---
import { useMenuNavigation } from "@/composables/useMenuNavigation";

// --- Components ---
import EmojiMenuItem from "./EmojiMenuItem.vue";

// --- UI Primitives ---
import { ButtonGroup } from "@/components/tiptap-ui-primitive/button";
import { Card, CardBody, CardHeader } from "@/components/tiptap-ui-primitive/card";

import { getFilteredEmojis } from "./emoji-menu-utils";

// --- Styles ---
import "@/components/tiptap-ui/emoji-menu/emoji-menu.scss";

interface EmojiMenuProps {
  emojis: T[];
  showSearch?: boolean;
  selector?: string;
}

const props = withDefaults(defineProps<EmojiMenuProps>(), {
  showSearch: false,
  selector: ".emoji-menu-list",
});

const emit = defineEmits<{
  select: [emoji: T];
  close: [];
}>();

const containerRef = ref<HTMLElement | null>(null);
const searchRef = ref<HTMLInputElement | null>(null);
const searchQuery = ref("");

const filteredEmojis = computed(() => {
  return getFilteredEmojis({ query: searchQuery.value, emojis: props.emojis });
});

const { selectedIndex } = useMenuNavigation({
  containerRef,
  query: searchQuery.value,
  items: filteredEmojis.value,
  onSelect: (emoji: T) => emit("select", emoji),
  onClose: () => emit("close"),
});

const renderedItems = computed(() => {
  const rendered: VNode[] = [];

  filteredEmojis.value.forEach((emoji, index) => {
    rendered.push(
      h(EmojiMenuItem, {
        key: emoji.name,
        emoji,
        index,
        isSelected: index === selectedIndex.value,
        selector: props.selector,
        onSelect: () => emit("select", emoji),
      })
    );
  });

  return rendered;
});
</script>

<template>
  <Card ref="containerRef">
    <CardHeader v-if="showSearch">
      <input
        ref="searchRef"
        v-model="searchQuery"
        type="text"
        placeholder="Add a emoji reaction..."
        autofocus
        class="emoji-menu-search-input"
      />
    </CardHeader>

    <CardBody v-if="renderedItems.length" class="emoji-menu-list">
      <ButtonGroup>
        <component
          v-for="(item, index) in renderedItems"
          :key="index"
          :is="item"
        />
      </ButtonGroup>
    </CardBody>
  </Card>
</template>
