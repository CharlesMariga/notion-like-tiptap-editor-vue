<script setup lang="ts">
import type { PropType } from "vue";

type ButtonGroupOrientation = "horizontal" | "vertical";
defineProps({
  orientation: {
    type: String as PropType<ButtonGroupOrientation>,
    default: "vertical",
  },
});
</script>

<template>
  <div
    :data-orientation="orientation"
    class="tiptap-button-group"
  >
    <slot />
  </div>
</template>

<style lang="scss">
@use "./button-group.scss";
</style>
