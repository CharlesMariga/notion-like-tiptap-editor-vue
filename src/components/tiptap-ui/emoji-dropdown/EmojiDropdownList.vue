<script setup lang="ts">
import { computed, h, type VNode } from "vue";
import type { EmojiItem } from "@tiptap/extension-emoji";
import type { SuggestionItem } from "@/components/tiptap-ui-utils/suggestion-menu/suggestion-menu-types";
import { EmojiMenuItem } from "@/components/tiptap-ui/emoji-menu";
import { ButtonGroup } from "@/components/tiptap-ui-primitive/button";
import { Card, CardBody } from "@/components/tiptap-ui-primitive/card";

interface EmojiDropdownListProps {
  items: SuggestionItem[];
  selectedIndex?: number;
  onSelect: (item: SuggestionItem) => void;
}

const props = withDefaults(defineProps<EmojiDropdownListProps>(), {
  selectedIndex: 0,
});

const renderedItems = computed(() => {
  const rendered: VNode[] = [];

  props.items.forEach((item, index) => {
    if (!item.context) return;

    rendered.push(
      h(EmojiMenuItem, {
        key: item.title,
        emoji: item.context as EmojiItem,
        index,
        isSelected: index === props.selectedIndex,
        selector: "[data-selector='tiptap-emoji-dropdown-menu']",
        onSelect: () => props.onSelect(item),
      })
    );
  });

  return rendered;
});
</script>

<template>
  <Card
    v-if="renderedItems.length"
    :style="{
      maxHeight: 'var(--suggestion-menu-max-height)',
    }"
  >
    <CardBody>
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
