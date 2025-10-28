<script setup lang="ts">
import { ref, watch, nextTick } from "vue";
import { getElementOverflowPosition } from "@/lib/tiptap-collab-utils";
import type { SuggestionItem } from "@/components/tiptap-ui-utils/suggestion-menu/suggestion-menu-types";
import { Button } from "@/components/tiptap-ui-primitive/button";

interface SlashDropdownItemProps {
  item: SuggestionItem;
  isSelected: boolean;
  onSelect: () => void;
}

const props = defineProps<SlashDropdownItemProps>();

const itemRef = ref<HTMLDivElement | null>(null);

watch(
  () => props.isSelected,
  async (isSelected) => {
    const selector = document.querySelector(
      '[data-selector="tiptap-slash-dropdown-menu"]'
    ) as HTMLElement;

    if (!itemRef.value || !isSelected || !selector) return;

    await nextTick();

    const overflow = getElementOverflowPosition(itemRef.value, selector);

    if (overflow === "top") {
      itemRef.value.scrollIntoView(true);
    } else if (overflow === "bottom") {
      itemRef.value.scrollIntoView(false);
    }
  }
);

const BadgeIcon = props.item.badge;
</script>

<template>
  <Button
    data-style="ghost"
    :data-active-state="isSelected ? 'on' : 'off'"
    ref="itemRef"
    @click="onSelect"
  >
    <component v-if="BadgeIcon" :is="BadgeIcon" class="tiptap-button-icon" />
    <div class="tiptap-button-text">{{ item.title }}</div>
  </Button>
</template>
