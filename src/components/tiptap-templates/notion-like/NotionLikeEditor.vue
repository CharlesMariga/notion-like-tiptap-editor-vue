<script setup lang="ts">
import NotionLikeEditorProvider from "./NotionLikeEditorProvider.vue";

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
  <NotionLikeEditorProvider :placeholder="placeholder" />
</template>

<style lang="scss">
@use "./notion-like-editor.scss";
@use "../../tiptap-node/blockquote-node/blockquote-node.scss";
@use "../../tiptap-node/code-block-node/code-block-node.scss";
@use "../../tiptap-node/heading-node/heading-node.scss";
@use "../../tiptap-node/horizontal-rule-node/horizontal-rule-node.scss";
@use "../../tiptap-node/image-node/image-node.scss";
@use "../../tiptap-node/list-node/list-node.scss";
@use "../../tiptap-node/paragraph-node/paragraph-node.scss";
</style>
