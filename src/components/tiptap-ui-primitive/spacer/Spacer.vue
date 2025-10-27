<script setup lang="ts">
import { computed, type PropType } from "vue";

type SpacerOrientation = "vertical" | "horizontal";

const props = defineProps({
  orientation: {
    type: String as PropType<SpacerOrientation>,
    default: "horizontal",
  },
  size: [Number, String] as PropType<number | string>,
});

const computedStyles = computed(() => {
  return {
    height: props.orientation === "vertical" ? "1px" : props.size,
    width: props.orientation === "horizontal" ? "1px" : props.size,
    flex: props.orientation === "horizontal" && !props.size ? 1 : undefined,
  };
});
</script>

<template>
  <div :style="computedStyles" />
</template>
