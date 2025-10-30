<script setup lang="ts">
import NotionEditor from "./components/tiptap-templates/notion-like/NotionLikeEditor.vue";
</script>

<template>
  <div style="height: 100vh; width: 100vw">
    <NotionEditor
      room="team-notes"
      placeholder="Share your ideas..."
    />
  </div>
</template>
