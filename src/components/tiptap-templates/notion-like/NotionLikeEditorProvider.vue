<script setup lang="ts">
import { EditorContent, useEditor } from "@tiptap/vue-3";

// --- Tiptap Core Extensions ---
import StarterKit from "@tiptap/starter-kit";
import { Placeholder } from "@tiptap/extensions";
import LoadingSpinner from "../../ui/LoadingSpinner.vue";
import NotionLikeEditorHeader from "./NotionLikeEditorHeader.vue";

const props = defineProps<{
  placeholder: string;
}>();

const editor = useEditor({
  extensions: [
    StarterKit.configure({
      undoRedo: false,
      horizontalRule: false,
      dropcursor: {
        width: 2,
      },
      link: { openOnClick: false },
    }),
    Placeholder.configure({
      placeholder: props.placeholder,
      emptyEditorClass: "is-empty with-slash",
    }),
  ],
});
</script>

<template>
  <div v-if="editor" class="notion-like-editor-wrapper">
    <NotionLikeEditorHeader />
    <EditorContent
      :editor="editor"
      role="presentation"
      class="notion-like-editor-content"
    ></EditorContent>
  </div>
  <LoadingSpinner v-else />
</template>
