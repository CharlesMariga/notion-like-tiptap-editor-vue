<script setup lang="ts">
import { computed } from "vue";
import { cn } from "@/lib/tiptap-utils";

interface ToolbarGroupProps {
  class?: string;
}

const props = defineProps<ToolbarGroupProps>();

const className = computed(() => cn("tiptap-toolbar-group", props.class));
</script>

<template>
  <div
    role="group"
    :class="className"
  >
    <slot />
  </div>
</template>
