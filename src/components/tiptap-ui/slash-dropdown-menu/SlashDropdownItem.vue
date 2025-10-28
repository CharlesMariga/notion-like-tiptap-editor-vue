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

const itemRef = ref<InstanceType<typeof Button> | null>(null);

watch(
  () => props.isSelected,
  async (isSelected) => {
    const selector = document.querySelector(
      '[data-selector="tiptap-slash-dropdown-menu"]'
    ) as HTMLElement;

    if (!itemRef.value?.buttonRef || !isSelected || !selector) return;

    await nextTick();

    const buttonElement = itemRef.value.buttonRef;
    const overflow = getElementOverflowPosition(buttonElement, selector);

    if (overflow === "top") {
      buttonElement.scrollIntoView(true);
    } else if (overflow === "bottom") {
      buttonElement.scrollIntoView(false);
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
