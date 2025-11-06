<script setup lang="ts">
import { computed } from "vue"
import type { Editor } from "@tiptap/vue-3"
import type { TextOptions } from "@tiptap-pro/extension-ai"

import { Button, ButtonGroup } from "@/components/tiptap-ui-primitive/button"
import RefreshAiIcon from "@/components/tiptap-icons/RefreshAiIcon.vue"
import XIcon from "@/components/tiptap-icons/XIcon.vue"
import CheckIcon from "@/components/tiptap-icons/CheckIcon.vue"

import { useUiEditorState } from "@/composables/useUiEditorState"

import "@/components/tiptap-ui/ai-menu/ai-menu-actions/ai-menu-actions.scss"

export interface AiMenuActionsProps {
  editor: Editor | null
  options: TextOptions
  onRegenerate?: () => void
  onAccept?: () => void
  onReject?: () => void
}

const props = defineProps<AiMenuActionsProps>()

const emit = defineEmits<{
  regenerate: []
  accept: []
  reject: []
}>()

const { aiGenerationIsLoading } = useUiEditorState(computed(() => props.editor))

const handleRegenerate = () => {
  if (!props.editor) return
  props.editor.chain().focus().aiRegenerate(props.options).run()
  emit("regenerate")
}

const handleDiscard = () => {
  if (!props.editor) return
  props.editor.chain().focus().aiReject().run()
  emit("reject")
}

const handleApply = () => {
  if (!props.editor) return
  props.editor.chain().focus().aiAccept().run()
  emit("accept")
}
</script>

<template>
  <div class="tiptap-ai-menu-actions">
    <div class="tiptap-ai-menu-results">
      <ButtonGroup orientation="horizontal">
        <Button
          data-style="ghost"
          class="tiptap-button"
          :disabled="aiGenerationIsLoading"
          @click="handleRegenerate"
        >
          <RefreshAiIcon class="tiptap-button-icon" />
          Try again
        </Button>
      </ButtonGroup>
    </div>

    <div class="tiptap-ai-menu-commit">
      <ButtonGroup orientation="horizontal">
        <Button
          data-style="ghost"
          class="tiptap-button"
          @click="handleDiscard"
        >
          <XIcon class="tiptap-button-icon" />
          Discard
        </Button>
        <Button
          data-style="primary"
          class="tiptap-button"
          @click="handleApply"
        >
          <CheckIcon class="tiptap-button-icon" />
          Apply
        </Button>
      </ButtonGroup>
    </div>
  </div>
</template>
