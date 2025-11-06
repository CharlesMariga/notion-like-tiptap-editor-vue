<template>
  <Button
    v-if="isVisible"
    type="button"
    :disabled="!canToggle"
    data-style="ghost"
    :data-active-state="isActive ? 'on' : 'off'"
    :data-disabled="!canToggle"
    role="button"
    :tabindex="-1"
    :aria-label="label"
    :aria-pressed="isActive"
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
import { useMark, type Mark } from '@/composables/useMark'

// --- UI Primitives ---
import Button from '@/components/tiptap-ui-primitive/button/Button.vue'
import Badge from '@/components/tiptap-ui-primitive/badge/Badge.vue'

export interface MarkButtonProps {
  /**
   * The Tiptap editor instance
   */
  editor?: Editor | null
  /**
   * The type of mark to toggle
   */
  type: Mark
  /**
   * Optional text to display alongside the icon
   */
  text?: string
  /**
   * Whether the button should hide when mark is not available
   * @default false
   */
  hideWhenUnavailable?: boolean
  /**
   * Callback function called after a successful mark toggle
   */
  onToggled?: () => void
  /**
   * Optional show shortcut keys in the button
   * @default false
   */
  showShortcut?: boolean
}

const props = withDefaults(defineProps<MarkButtonProps>(), {
  hideWhenUnavailable: false,
  showShortcut: false,
})

const emit = defineEmits<{
  click: [event: MouseEvent]
}>()

const {
  isVisible,
  handleMark,
  label,
  canToggle,
  isActive,
  Icon,
  shortcutKeys,
} = useMark({
  editor: props.editor,
  type: props.type,
  hideWhenUnavailable: props.hideWhenUnavailable,
  onToggled: props.onToggled,
})

const parsedShortcut = computed(() => parseShortcutKeys({ shortcutKeys: shortcutKeys }))

const handleClick = (event: MouseEvent) => {
  emit('click', event)
  if (event.defaultPrevented) return
  handleMark()
}
</script>
