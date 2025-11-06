<template>
  <Button
    v-if="isVisible"
    type="button"
    data-style="ghost"
    role="button"
    :tabindex="-1"
    :aria-label="label"
    tooltip="Duplicate"
    @click="handleClick"
  >
    <slot>
      <component :is="Icon" class="tiptap-button-icon" />
      <span v-if="text" class="tiptap-button-text">{{ text }}</span>
      <DuplicateShortcutBadge v-if="showShortcut" :shortcut-keys="shortcutKeys" />
    </slot>
  </Button>
</template>

<script setup lang="ts">
import { useTiptapEditor } from '@/composables/useTiptapEditor'
import {
  useDuplicate,
  type UseDuplicateConfig,
} from '@/composables/useDuplicate'
import Button from '@/components/tiptap-ui-primitive/button/Button.vue'
import DuplicateShortcutBadge from './DuplicateShortcutBadge.vue'

export interface DuplicateButtonProps extends UseDuplicateConfig {
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

const props = withDefaults(defineProps<DuplicateButtonProps>(), {
  hideWhenUnavailable: false,
  showShortcut: false,
})

const emit = defineEmits<{
  click: [event: MouseEvent]
}>()

const { editor } = useTiptapEditor(props.editor)
const { isVisible, handleDuplicate, label, shortcutKeys, Icon } = useDuplicate({
  editor: editor.value,
  hideWhenUnavailable: props.hideWhenUnavailable,
  onDuplicated: props.onDuplicated,
})

const handleClick = (event: MouseEvent) => {
  emit('click', event)
  if (event.defaultPrevented) return
  handleDuplicate()
}
</script>
