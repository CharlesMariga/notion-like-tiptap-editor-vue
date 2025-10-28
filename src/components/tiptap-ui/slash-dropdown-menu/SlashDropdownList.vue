<script setup lang="ts">
import { computed, h, type VNode } from "vue";
import type { SuggestionItem } from "@/components/tiptap-ui-utils/suggestion-menu/suggestion-menu-types";
import type { SlashMenuConfig } from "@/components/tiptap-ui/slash-dropdown-menu/useSlashDropdownMenu";
import SlashDropdownItem from "./SlashDropdownItem.vue";
import { ButtonGroup } from "@/components/tiptap-ui-primitive/button";
import { Separator } from "@/components/tiptap-ui-primitive/separator";
import {
  Card,
  CardBody,
  CardGroupLabel,
  CardItemGroup,
} from "@/components/tiptap-ui-primitive/card";

interface SlashDropdownListProps {
  items: SuggestionItem[];
  selectedIndex?: number;
  onSelect: (item: SuggestionItem) => void;
  config?: SlashMenuConfig;
}

const props = withDefaults(defineProps<SlashDropdownListProps>(), {
  selectedIndex: 0,
});

const renderedItems = computed(() => {
  const rendered: VNode[] = [];
  const showGroups = props.config?.showGroups !== false;

  if (!showGroups) {
    props.items.forEach((item, index) => {
      rendered.push(
        h(SlashDropdownItem, {
          key: `item-${index}-${item.title}`,
          item,
          isSelected: index === props.selectedIndex,
          onSelect: () => props.onSelect(item),
        })
      );
    });
    return rendered;
  }

  const groups: {
    [groupLabel: string]: { items: SuggestionItem[]; indices: number[] };
  } = {};

  props.items.forEach((item, index) => {
    const groupLabel = item.group || "";
    if (!groups[groupLabel]) {
      groups[groupLabel] = { items: [], indices: [] };
    }
    groups[groupLabel].items.push(item);
    groups[groupLabel].indices.push(index);
  });

  Object.entries(groups).forEach(([groupLabel, groupData], groupIndex) => {
    if (groupIndex > 0) {
      rendered.push(
        h(Separator, {
          key: `separator-${groupIndex}`,
          orientation: "horizontal",
        })
      );
    }

    const groupItems = groupData.items.map((item, itemIndex) => {
      const originalIndex = groupData.indices[itemIndex];
      return h(SlashDropdownItem, {
        key: `item-${originalIndex}-${item.title}`,
        item,
        isSelected: originalIndex === props.selectedIndex,
        onSelect: () => props.onSelect(item),
      });
    });

    if (groupLabel) {
      rendered.push(
        h(
          CardItemGroup,
          { key: `group-${groupIndex}-${groupLabel}` },
          {
            default: () => [
              h(CardGroupLabel, {}, { default: () => groupLabel }),
              h(ButtonGroup, {}, { default: () => groupItems }),
            ],
          }
        )
      );
    } else {
      rendered.push(...groupItems);
    }
  });

  return rendered;
});
</script>

<template>
  <Card
    v-if="renderedItems.length"
    class="tiptap-slash-card"
    :style="{
      maxHeight: 'var(--suggestion-menu-max-height)',
    }"
  >
    <CardBody class="tiptap-slash-card-body">
      <component
        v-for="(item, index) in renderedItems"
        :key="index"
        :is="item"
      />
    </CardBody>
  </Card>
</template>
