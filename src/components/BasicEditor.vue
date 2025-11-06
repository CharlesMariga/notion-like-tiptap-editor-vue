<template>
  <div class="basic-editor">
    <Toolbar v-if="editor" variant="fixed">
      <ToolbarGroup>
        <MarkButton :editor="editor" type="bold" />
        <MarkButton :editor="editor" type="italic" />
        <MarkButton :editor="editor" type="strike" />
        <MarkButton :editor="editor" type="code" />
      </ToolbarGroup>

      <ToolbarSeparator />

      <ToolbarGroup>
        <HeadingButton :editor="editor" :level="1" />
        <HeadingButton :editor="editor" :level="2" />
        <HeadingButton :editor="editor" :level="3" />
        <ListButton :editor="editor" type="bulletList" />
        <ListButton :editor="editor" type="orderedList" />
        <BlockquoteButton :editor="editor" />
        <CodeBlockButton :editor="editor" />
      </ToolbarGroup>

      <ToolbarSeparator />

      <ToolbarGroup>
        <TextAlignButton :editor="editor" align="left" />
        <TextAlignButton :editor="editor" align="center" />
        <TextAlignButton :editor="editor" align="right" />
        <TextAlignButton :editor="editor" align="justify" />
      </ToolbarGroup>

      <ToolbarSeparator />

      <ToolbarGroup>
        <UndoRedoButton :editor="editor" action="undo" />
        <UndoRedoButton :editor="editor" action="redo" />
        <MarkButton :editor="editor" type="underline" />
        <MarkButton :editor="editor" type="subscript" />
        <MarkButton :editor="editor" type="superscript" />
        <ColorPicker :editor="editor" />
        <LinkPopover :editor="editor" />
      </ToolbarGroup>
    </Toolbar>
    <EditorContent :editor="editor" />
    <SlashDropdownMenu :editor="editor" />
  </div>
</template>

<script setup lang="ts">
import { EditorContent, useEditor } from '@tiptap/vue-3'
import StarterKit from '@tiptap/starter-kit'
import Placeholder from '@tiptap/extension-placeholder'
import Subscript from '@tiptap/extension-subscript'
import Superscript from '@tiptap/extension-superscript'
import { TextStyle } from '@tiptap/extension-text-style'
import { Color } from '@tiptap/extension-color'
import Highlight from '@tiptap/extension-highlight'
import TextAlign from '@tiptap/extension-text-align'
import TaskList from '@tiptap/extension-task-list'
import TaskItem from '@tiptap/extension-task-item'
import Image from '@tiptap/extension-image'

import Toolbar from '@/components/tiptap-ui-primitive/toolbar/Toolbar.vue'
import ToolbarGroup from '@/components/tiptap-ui-primitive/toolbar/ToolbarGroup.vue'
import ToolbarSeparator from '@/components/tiptap-ui-primitive/toolbar/ToolbarSeparator.vue'
import MarkButton from '@/components/tiptap-ui/mark-button/MarkButton.vue'
import HeadingButton from '@/components/tiptap-ui/heading-button/HeadingButton.vue'
import ListButton from '@/components/tiptap-ui/list-button/ListButton.vue'
import UndoRedoButton from '@/components/tiptap-ui/undo-redo-button/UndoRedoButton.vue'
import TextAlignButton from '@/components/tiptap-ui/TextAlignButton.vue'
import LinkPopover from '@/components/tiptap-ui/LinkPopover.vue'
import ColorPicker from '@/components/tiptap-ui/ColorPicker.vue'
import BlockquoteButton from '@/components/tiptap-ui/blockquote-button/BlockquoteButton.vue'
import CodeBlockButton from '@/components/tiptap-ui/code-block-button/CodeBlockButton.vue'
import SlashDropdownMenu from '@/components/tiptap-ui/slash-dropdown-menu/SlashDropdownMenu.vue'

const editor = useEditor({
  content: '<p>Start typing here...</p>',
  extensions: [
    StarterKit.configure({
      link: {
        openOnClick: false,
      },
    }),
    Placeholder.configure({
      placeholder: 'Type / for commands...',
      emptyNodeClass: 'is-empty with-slash',
    }),
    Subscript,
    Superscript,
    TextStyle,
    Color,
    Highlight.configure({ multicolor: true }),
    TextAlign.configure({
      types: ['heading', 'paragraph'],
    }),
    TaskList,
    TaskItem.configure({
      nested: true,
    }),
    Image,
  ],
})
</script>

<style scoped>
.basic-editor {
  max-width: 800px;
  margin: 2rem auto;
  border: 1px solid var(--tt-border-color);
  border-radius: var(--tt-radius-lg);
  background: var(--tt-card-bg-color);
}

:deep(.ProseMirror) {
  padding: 1rem;
  min-height: 400px;
  outline: none;
}

:deep(.ProseMirror p) {
  margin: 0.5rem 0;
}

:deep(.ProseMirror h1) {
  font-size: 2rem;
  font-weight: 700;
  margin: 1rem 0 0.5rem;
}

:deep(.ProseMirror h2) {
  font-size: 1.5rem;
  font-weight: 600;
  margin: 0.75rem 0 0.5rem;
}

:deep(.ProseMirror ul),
:deep(.ProseMirror ol) {
  padding-left: 1.5rem;
  margin: 0.5rem 0;
}

:deep(.ProseMirror code) {
  background: var(--tt-gray-light-100);
  padding: 0.125rem 0.25rem;
  border-radius: var(--tt-radius-xs);
  font-family: monospace;
}

:deep(.ProseMirror strong) {
  font-weight: 700;
}

:deep(.ProseMirror em) {
  font-style: italic;
}

:deep(.ProseMirror s) {
  text-decoration: line-through;
}

/* Placeholder styles */
:deep(.ProseMirror p.is-empty:first-child::before) {
  content: attr(data-placeholder);
  float: left;
  color: var(--tt-text-muted-color, #aaa);
  pointer-events: none;
  height: 0;
}

:deep(.ProseMirror p.is-empty.with-slash:first-child::before) {
  content: 'Type / for commands...';
}
</style>
