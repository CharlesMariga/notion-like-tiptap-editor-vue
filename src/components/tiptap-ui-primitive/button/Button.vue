<script setup lang="ts">
import { ref } from "vue";

defineProps({
  tooltip: {},
  showTooltip: {
    type: Boolean,
    default: true,
  },
  shortcutKeys: {
    type: String,
    required: false,
  },
});

const buttonRef = ref<HTMLButtonElement | null>(null);

defineExpose({
  buttonRef,
});
</script>

<template>
  <button
    ref="buttonRef"
    class="tiptap-button"
  >
    <slot />
  </button>
</template>

<style lang="scss">
@use "./button-colors.scss";
@use "./button.scss";
</style>
