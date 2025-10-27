<script setup lang="ts">
import { computed, type PropType } from "vue";

type SeparatorOrientation = "horizontal" | "vertical";

const props = defineProps({
  orientation: {
    type: String as PropType<SeparatorOrientation>,
    required: false,
    default: "vertical",
  },
  decorative: {
    type: Boolean,
    required: false,
  },
});

const computedAriaOrientation = computed(() =>
  props.orientation === "vertical" ? props.orientation : undefined
);
const computedSemanticProps = computed(() =>
  props.decorative
    ? { role: "none" }
    : { "aria-orientation": computedAriaOrientation.value, role: "separator" }
);
</script>

<template>
  <div
    class="tiptap-separator"
    :data-orientation="orientation"
    v-bind="computedSemanticProps"
  />
</template>

<style lang="scss">
@use "./separator.scss";
</style>
