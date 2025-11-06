<script setup lang="ts">
import NotionEditorThemeToggle from './NotionEditorThemeToggle.vue'
import NotionEditorCollaborationUsers from './NotionEditorCollaborationUsers.vue'
import UndoRedoButton from '@/components/tiptap-ui/undo-redo-button/UndoRedoButton.vue'
import Spacer from '@/components/tiptap-ui-primitive/spacer/Spacer.vue'
import Separator from '@/components/tiptap-ui-primitive/separator/Separator.vue'
import ButtonGroup from '@/components/tiptap-ui-primitive/button/ButtonGroup.vue'
import './notion-like-editor-header.scss'
</script>

<template>
  <header class="notion-like-editor-header">
    <Spacer />
    <div class="notion-like-editor-header-actions">
      <ButtonGroup orientation="horizontal">
        <UndoRedoButton action="undo" />
        <UndoRedoButton action="redo" />
      </ButtonGroup>

      <Separator />

      <NotionEditorThemeToggle />

      <Separator />

      <NotionEditorCollaborationUsers />
    </div>
  </header>
</template>
