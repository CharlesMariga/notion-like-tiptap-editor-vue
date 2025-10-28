<script setup lang="ts">
defineProps<{
  orientation?: "horizontal" | "vertical";
}>();
</script>

<template>
  <div
    class="tiptap-card-item-group"
    :data-orientation="orientation || 'vertical'"
  >
    <slot />
  </div>
</template>
