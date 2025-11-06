<script setup lang="ts">
import { computed } from 'vue'
import type { Editor } from '@tiptap/vue-3'
import { useAiAsk } from '@/composables/useAiAsk'
import Button from '@/components/tiptap-ui-primitive/button/Button.vue'
import Tooltip from '@/components/tiptap-ui-primitive/tooltip/Tooltip.vue'
import { isMac } from '@/lib/tiptap-utils'

interface AiAskButtonProps {
  editor?: Editor | null
  hideWhenUnavailable?: boolean
  onAiAsked?: () => void
}

const props = withDefaults(defineProps<AiAskButtonProps>(), {
  editor: null,
  hideWhenUnavailable: false,
})

const { isVisible, handleAiAsk, canAiAsk, Icon, shortcutKeys } = useAiAsk({
  editor: props.editor,
  hideWhenUnavailable: props.hideWhenUnavailable,
  onAiAsked: props.onAiAsked,
})

const formattedShortcut = computed(() => {
  if (!shortcutKeys) return ''
  return isMac() ? '⌘J' : 'Ctrl+J'
})
</script>

<template>
  <Tooltip v-if="isVisible" :content="`Ask AI ${formattedShortcut}`">
    <Button
      :aria-label="`Ask AI Assistant ${formattedShortcut}`"
      :data-active-state="canAiAsk ? 'on' : 'off'"
      @click="handleAiAsk"
    >
      <component :is="Icon" class="tiptap-button-icon" />
    </Button>
  </Tooltip>
</template>
