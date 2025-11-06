<template>
  <Button
    v-if="isVisible"
    type="button"
    data-style="ghost"
    :data-active-state="isActive ? 'on' : 'off'"
    role="button"
    :tabindex="-1"
    :disabled="!canToggle"
    :data-disabled="!canToggle"
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
import { useHeading, type Level } from '@/composables/useHeading'

// --- UI Primitives ---
import Button from '@/components/tiptap-ui-primitive/button/Button.vue'
import Badge from '@/components/tiptap-ui-primitive/badge/Badge.vue'

export interface HeadingButtonProps {
  /**
   * The Tiptap editor instance
   */
  editor?: Editor | null
  /**
   * The heading level
   */
  level: Level
  /**
   * Optional text to display alongside the icon
   */
  text?: string
  /**
   * Whether the button should hide when heading is not available
   * @default false
   */
  hideWhenUnavailable?: boolean
  /**
   * Callback function called after a successful heading toggle
   */
  onToggled?: () => void
  /**
   * Optional show shortcut keys in the button
   * @default false
   */
  showShortcut?: boolean
}

const props = withDefaults(defineProps<HeadingButtonProps>(), {
  hideWhenUnavailable: false,
  showShortcut: false,
})

const emit = defineEmits<{
  click: [event: MouseEvent]
}>()

const {
  isVisible,
  canToggle,
  isActive,
  handleToggle,
  label,
  Icon,
  shortcutKeys,
} = useHeading({
  editor: props.editor,
  level: props.level,
  hideWhenUnavailable: props.hideWhenUnavailable,
  onToggled: props.onToggled,
})

const parsedShortcut = computed(() => parseShortcutKeys({ shortcutKeys: shortcutKeys }))

const handleClick = (event: MouseEvent) => {
  emit('click', event)
  if (event.defaultPrevented) return
  handleToggle()
}
</script>
