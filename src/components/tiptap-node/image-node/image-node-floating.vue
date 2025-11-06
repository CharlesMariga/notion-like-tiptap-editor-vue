<script setup lang="ts">
import type { Editor } from "@tiptap/vue-3"
import { computed } from "vue"

// --- Hooks ---
import { useTiptapEditor } from "@/composables/useTiptapEditor"

// --- Lib ---
import { isNodeTypeSelected } from "@/lib/tiptap-utils"

// --- Tiptap UI ---
import ImageAlignButton from "@/components/tiptap-ui/image-align-button/ImageAlignButton.vue"
import ImageDownloadButton from "@/components/tiptap-ui/image-download-button/ImageDownloadButton.vue"
import DeleteNodeButton from "@/components/tiptap-ui/delete-node-button/DeleteNodeButton.vue"

// --- UI Primitive ---
import Separator from "@/components/tiptap-ui-primitive/separator/Separator.vue"

interface Props {
  editor?: Editor | null
}

const props = defineProps<Props>()

const { editor } = useTiptapEditor(props.editor)

const visible = computed(() => isNodeTypeSelected(editor.value, ["image"]))
</script>

<template>
  <template v-if="editor && visible">
    <ImageAlignButton align="left" />
    <ImageAlignButton align="center" />
    <ImageAlignButton align="right" />
    <Separator />
    <ImageDownloadButton />
    <Separator />
    <DeleteNodeButton />
  </template>
</template>
