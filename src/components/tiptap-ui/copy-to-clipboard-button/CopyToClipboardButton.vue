<template>
  <Button
    v-if="isVisible"
    type="button"
    data-style="ghost"
    role="button"
    :tabindex="-1"
    :aria-label="label"
    tooltip="Copy to clipboard"
    @click="handleClick"
  >
    <slot>
      <component :is="Icon" class="tiptap-button-icon" />
      <span v-if="text" class="tiptap-button-text">{{ text }}</span>
      <CopyToClipboardShortcutBadge v-if="showShortcut" :shortcut-keys="shortcutKeys" />
    </slot>
  </Button>
</template>

<script setup lang="ts">
import { useTiptapEditor } from '@/composables/useTiptapEditor'
import {
  useCopyToClipboard,
  type UseCopyToClipboardConfig,
} from '@/composables/useCopyToClipboard'
import Button from '@/components/tiptap-ui-primitive/button/Button.vue'
import CopyToClipboardShortcutBadge from './CopyToClipboardShortcutBadge.vue'

export interface CopyToClipboardButtonProps extends UseCopyToClipboardConfig {
  /**
   * Optional text to display alongside the icon.
   */
  text?: string
  /**
   * Optional show shortcut keys in the button.
   * @default false
   */
  showShortcut?: boolean
}

const props = withDefaults(defineProps<CopyToClipboardButtonProps>(), {
  copyWithFormatting: true,
  hideWhenUnavailable: false,
  showShortcut: false,
})

const emit = defineEmits<{
  click: [event: MouseEvent]
}>()

const { editor } = useTiptapEditor(props.editor)
const { isVisible, handleCopyToClipboard, label, shortcutKeys, Icon } =
  useCopyToClipboard({
    editor: editor.value,
    copyWithFormatting: props.copyWithFormatting,
    hideWhenUnavailable: props.hideWhenUnavailable,
    onCopied: props.onCopied,
  })

const handleClick = async (event: MouseEvent) => {
  emit('click', event)
  if (event.defaultPrevented) return
  await handleCopyToClipboard()
}
</script>
