<template>
  <Button
    v-if="isVisible"
    type="button"
    data-style="ghost"
    role="button"
    :tabindex="-1"
    :disabled="!canInsert"
    :data-disabled="!canInsert"
    :aria-label="label"
    :tooltip="label"
    @click="handleClick"
    v-bind="$attrs"
  >
    <slot>
      <component :is="Icon" class="tiptap-button-icon" />
      <span v-if="text" class="tiptap-button-text">{{ text }}</span>
      <MentionShortcutBadge v-if="showShortcut" :shortcut-keys="shortcutKeys" />
    </slot>
  </Button>
</template>

<script setup lang="ts">
// --- Composables ---
import { useTiptapEditor } from '@/composables/useTiptapEditor'
import {
  useMentionTrigger,
  type UseMentionTriggerConfig,
} from '@/composables/useMentionTrigger'

// --- UI Primitives ---
import Button from '@/components/tiptap-ui-primitive/button/Button.vue'
import MentionShortcutBadge from './MentionShortcutBadge.vue'

export interface MentionTriggerButtonProps extends UseMentionTriggerConfig {
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

const props = withDefaults(defineProps<MentionTriggerButtonProps>(), {
  trigger: '@',
  hideWhenUnavailable: false,
  showShortcut: false,
})

const emit = defineEmits<{
  click: [event: MouseEvent]
}>()

const { editor } = useTiptapEditor(props.editor)
const { isVisible, canInsert, handleMention, label, shortcutKeys, Icon } =
  useMentionTrigger({
    editor: editor.value,
    node: props.node,
    nodePos: props.nodePos,
    trigger: props.trigger,
    hideWhenUnavailable: props.hideWhenUnavailable,
    onTriggered: props.onTriggered,
  })

const handleClick = (event: MouseEvent) => {
  emit('click', event)
  if (event.defaultPrevented) return
  handleMention()
}
</script>
