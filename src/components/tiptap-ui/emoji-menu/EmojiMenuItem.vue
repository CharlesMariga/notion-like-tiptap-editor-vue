<script setup lang="ts">
import { ref, watch, nextTick } from "vue";
import type { EmojiItem } from "@tiptap/extension-emoji";
import { getElementOverflowPosition } from "@/lib/tiptap-collab-utils";
import { Button } from "@/components/tiptap-ui-primitive/button";

interface EmojiMenuItemProps {
  emoji: EmojiItem;
  index: number;
  isSelected: boolean;
  selector: string;
}

const props = defineProps<EmojiMenuItemProps>();
const emit = defineEmits<{
  select: [emoji: EmojiItem];
}>();

const itemRef = ref<InstanceType<typeof Button> | null>(null);

watch(
  () => props.isSelected,
  async (isSelected) => {
    if (!isSelected) return;

    await nextTick();

    const menuElement = document.querySelector(props.selector) as HTMLElement;
    const buttonElement = itemRef.value?.buttonRef;
    if (!buttonElement || !menuElement) return;

    const overflow = getElementOverflowPosition(buttonElement, menuElement);
    if (overflow === "top") {
      buttonElement.scrollIntoView(true);
    } else if (overflow === "bottom") {
      buttonElement.scrollIntoView(false);
    }
  }
);

const handleSelect = () => {
  emit("select", props.emoji);
};
</script>

<template>
  <Button
    v-if="emoji"
    ref="itemRef"
    data-style="ghost"
    :data-active-state="isSelected ? 'on' : 'off'"
    @click="handleSelect"
  >
    <img
      v-if="emoji.fallbackImage"
      class="tiptap-button-emoji"
      :src="emoji.fallbackImage"
      :alt="emoji.name"
    />
    <span v-else class="tiptap-button-emoji">{{ emoji.emoji }}</span>
    <span class="tiptap-button-text">:{{ emoji.name }}:</span>
  </Button>
</template>
