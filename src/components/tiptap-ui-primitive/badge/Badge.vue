<template>
  <div
    :class="cn('tiptap-badge', className)"
    :data-style="variant"
    :data-size="size"
    :data-appearance="appearance"
    :data-text-trim="trimText ? 'on' : 'off'"
    v-bind="$attrs"
  >
    <slot />
  </div>
</template>

<script setup lang="ts">
import { cn } from "@/lib/tiptap-utils";

interface BadgeProps {
  className?: string;
  variant?: "ghost" | "white" | "gray" | "green" | "default";
  size?: "default" | "small";
  appearance?: "default" | "subdued" | "emphasized";
  trimText?: boolean;
}

withDefaults(defineProps<BadgeProps>(), {
  size: "default",
  appearance: "default",
  trimText: false,
});
</script>

<style lang="scss">
@use "./badge-colors.scss" as *;
@use "./badge.scss" as *;
@use "./badge-group.scss" as *;
</style>
