<template>
  <Button
    v-if="isVisible"
    type="button"
    data-style="ghost"
    role="button"
    :tabindex="-1"
    :disabled="!canAddTrigger"
    :data-disabled="!canAddTrigger"
    :aria-label="label"
    tooltip="Add emoji"
    @click="handleClick"
    v-bind="$attrs"
  >
    <slot>
      <component :is="Icon" class="tiptap-button-icon" />
      <span v-if="text" class="tiptap-button-text">{{ text }}</span>
      <EmojiTriggerShortcutBadge v-if="showShortcut" :shortcut-keys="shortcutKeys" />
    </slot>
  </Button>
</template>

<script setup lang="ts">
// --- Composables ---
import { useTiptapEditor } from '@/composables/useTiptapEditor'
import {
  useEmojiTrigger,
  type UseEmojiTriggerConfig,
} from '@/composables/useEmojiTrigger'

// --- UI Primitives ---
import Button from '@/components/tiptap-ui-primitive/button/Button.vue'
import EmojiTriggerShortcutBadge from './EmojiTriggerShortcutBadge.vue'

export interface EmojiTriggerButtonProps extends UseEmojiTriggerConfig {
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

const props = withDefaults(defineProps<EmojiTriggerButtonProps>(), {
  trigger: ':',
  hideWhenUnavailable: false,
  showShortcut: false,
})

const emit = defineEmits<{
  click: [event: MouseEvent]
}>()

const { editor } = useTiptapEditor(props.editor)
const {
  isVisible,
  canAddTrigger,
  handleAddTrigger,
  label,
  shortcutKeys,
  Icon,
} = useEmojiTrigger({
  editor: editor.value,
  node: props.node,
  nodePos: props.nodePos,
  trigger: props.trigger,
  hideWhenUnavailable: props.hideWhenUnavailable,
  onTriggerApplied: props.onTriggerApplied,
})

const handleClick = (event: MouseEvent) => {
  emit('click', event)
  if (event.defaultPrevented) return
  handleAddTrigger()
}
</script>
