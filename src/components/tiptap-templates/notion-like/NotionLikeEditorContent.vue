<script setup lang="ts">
import NotionLikeEditorProvider from "./NotionLikeEditorProvider.vue";

defineProps<{
  placeholder: string;
}>();
</script>

<template>
  <NotionLikeEditorProvider :placeholder="placeholder" />
</template>

<style lang="scss"></style>
