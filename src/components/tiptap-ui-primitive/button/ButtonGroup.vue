<template>
  <div
    :class="cn('tiptap-button-group', className)"
    :data-orientation="orientation"
    role="group"
    v-bind="$attrs"
  >
    <slot />
  </div>
</template>

<script setup lang="ts">
import { cn } from "@/lib/tiptap-utils";

interface ButtonGroupProps {
  className?: string;
  orientation?: "horizontal" | "vertical";
}

withDefaults(defineProps<ButtonGroupProps>(), {
  orientation: "vertical",
});
</script>

<style lang="scss">
@use "./button-group.scss" as *;
</style>
