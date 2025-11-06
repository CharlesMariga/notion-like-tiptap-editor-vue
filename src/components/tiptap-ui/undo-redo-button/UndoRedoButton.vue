<template>
  <Button
    v-if="isVisible"
    type="button"
    :disabled="!canExecute"
    data-style="ghost"
    :data-disabled="!canExecute"
    role="button"
    :tabindex="-1"
    :aria-label="label"
    :tooltip="label"
    @click="handleClick"
    v-bind="$attrs"
  >
    <slot>
      <component :is="Icon" class="tiptap-button-icon" />
      <span v-if="text" class="tiptap-button-text">{{ text }}</span>
      <Badge v-if="showShortcut">{{ parsedShortcut.join('') }}</Badge>
    </slot>
  </Button>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { Editor } from '@tiptap/vue-3'

// --- Lib ---
import { parseShortcutKeys } from '@/lib/tiptap-utils'

// --- Composables ---
import { useUndoRedo, type UndoRedoAction } from '@/composables/useUndoRedo'

// --- UI Primitives ---
import Button from '@/components/tiptap-ui-primitive/button/Button.vue'
import Badge from '@/components/tiptap-ui-primitive/badge/Badge.vue'

export interface UndoRedoButtonProps {
  /**
   * The Tiptap editor instance
   */
  editor?: Editor | null
  /**
   * The history action to perform (undo or redo)
   */
  action: UndoRedoAction
  /**
   * Optional text to display alongside the icon
   */
  text?: string
  /**
   * Whether the button should hide when action is not available
   * @default false
   */
  hideWhenUnavailable?: boolean
  /**
   * Callback function called after a successful action execution
   */
  onExecuted?: () => void
  /**
   * Optional show shortcut keys in the button
   * @default false
   */
  showShortcut?: boolean
}

const props = withDefaults(defineProps<UndoRedoButtonProps>(), {
  hideWhenUnavailable: false,
  showShortcut: false,
})

const emit = defineEmits<{
  click: [event: MouseEvent]
}>()

const {
  isVisible,
  handleAction,
  label,
  canExecute,
  Icon,
  shortcutKeys,
} = useUndoRedo({
  editor: props.editor,
  action: props.action,
  hideWhenUnavailable: props.hideWhenUnavailable,
  onExecuted: props.onExecuted,
})

const parsedShortcut = computed(() => parseShortcutKeys({ shortcutKeys: shortcutKeys }))

const handleClick = (event: MouseEvent) => {
  emit('click', event)
  if (event.defaultPrevented) return
  handleAction()
}
</script>
