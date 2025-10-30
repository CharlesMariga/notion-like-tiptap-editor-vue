<script setup lang="ts">
import { computed } from "vue";
import type { Editor } from "@tiptap/vue-3";

// --- Composables ---
import { useTiptapEditor } from "@/composables/useTiptapEditor";

// --- Lib ---
import { isNodeTypeSelected } from "@/lib/tiptap-utils";

// --- Tiptap UI ---
import DeleteNodeButton from "@/components/tiptap-ui/delete-node-button/DeleteNodeButton.vue";
import ImageDownloadButton from "@/components/tiptap-ui/image-download-button/ImageDownloadButton.vue";
import ImageAlignButton from "@/components/tiptap-ui/image-align-button/ImageAlignButton.vue";

// --- UI Primitive ---
import ToolbarSeparator from "@/components/tiptap-ui-primitive/toolbar/ToolbarSeparator.vue";

interface ImageNodeFloatingProps {
  editor?: Editor | null;
}

const props = defineProps<ImageNodeFloatingProps>();

const { editor } = useTiptapEditor(() => props.editor);

const visible = computed(() => {
  if (!editor.value) return false;
  return isNodeTypeSelected(editor.value, ["image"]);
});
</script>

<template>
  <template v-if="editor && visible">
    <ImageAlignButton
      :editor="editor"
      align="left"
    />
    <ImageAlignButton
      :editor="editor"
      align="center"
    />
    <ImageAlignButton
      :editor="editor"
      align="right"
    />
    <ToolbarSeparator />
    <ImageDownloadButton :editor="editor" />
    <ToolbarSeparator />
    <DeleteNodeButton :editor="editor" />
  </template>
</template>
