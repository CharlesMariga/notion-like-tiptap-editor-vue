<script setup lang="ts">
import NotionEditorContent from "./NotionLikeEditorContent.vue";

defineProps({
  room: {
    type: String,
  },
  placeholder: {
    type: String,
    required: false,
    default: "Start writing...",
  },
});
</script>

<template>
  <NotionEditorContent :placeholder="placeholder" />
</template>

<style lang="scss">
@use "./notion-like-editor.scss";
@use "../../tiptap-node/paragraph-node/paragraph-node.scss";
</style>
