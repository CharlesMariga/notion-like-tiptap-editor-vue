<script setup lang="ts">
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
</script>

<template>
  <button class="tiptap-button">
    <slot />
  </button>
</template>

<style lang="scss">
@use "./button-colors.scss";
@use "./button.scss";
</style>
