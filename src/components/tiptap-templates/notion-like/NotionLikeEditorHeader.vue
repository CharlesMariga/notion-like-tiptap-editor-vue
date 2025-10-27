<script setup lang="ts">
// --- Tiptap UI ---
import { UndoRedoButton } from "../../tiptap-ui/undo-redo-button";

// --- UI Primitives ---
import { ButtonGroup } from "../../tiptap-ui-primitive/button";
import { Separator } from "../../tiptap-ui-primitive/separator";
import { Spacer } from "../../tiptap-ui-primitive/spacer";
import NotionLikeEditorThemeToggle from "./NotionLikeEditorThemeToggle.vue";
</script>

<template>
  <div class="notion-like-editor-header">
    <Spacer />
    <div class="notion-like-editor-header-actions">
      <ButtonGroup orientation="horizontal">
        <UndoRedoButton />
        <UndoRedoButton />
      </ButtonGroup>

      <Separator />

      <NotionLikeEditorThemeToggle />

      <Separator />
    </div>
  </div>
</template>

<style lang="scss">
@use "./notion-like-editor-header.scss";
</style>
