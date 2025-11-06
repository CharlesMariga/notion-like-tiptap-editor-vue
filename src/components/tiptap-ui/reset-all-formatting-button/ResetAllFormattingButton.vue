<template>
  <Button
    v-if="isVisible"
    type="button"
    data-style="ghost"
    :disabled="!canReset"
    :data-disabled="!canReset"
    data-active-state="off"
    role="button"
    :tabindex="-1"
    :aria-label="label"
    tooltip="Reset formatting"
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

// --- Lib ---
import { parseShortcutKeys } from '@/lib/tiptap-utils'

// --- Composables ---
import { useResetAllFormatting, type UseResetAllFormattingConfig } from '@/composables/useResetAllFormatting'

// --- UI Primitives ---
import Button from '@/components/tiptap-ui-primitive/button/Button.vue'
import Badge from '@/components/tiptap-ui-primitive/badge/Badge.vue'

export interface ResetAllFormattingButtonProps extends UseResetAllFormattingConfig {
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

const props = withDefaults(defineProps<ResetAllFormattingButtonProps>(), {
  hideWhenUnavailable: false,
  preserveMarks: () => ['inlineThread'],
  showShortcut: false,
})

const emit = defineEmits<{
  click: [event: MouseEvent]
}>()

const {
  isVisible,
  canReset,
  handleResetFormatting,
  label,
  shortcutKeys,
  Icon,
} = useResetAllFormatting({
  editor: props.editor,
  preserveMarks: props.preserveMarks,
  hideWhenUnavailable: props.hideWhenUnavailable,
  onResetAllFormatting: props.onResetAllFormatting,
})

const parsedShortcut = computed(() => parseShortcutKeys({ shortcutKeys: shortcutKeys }))

const handleClick = (event: MouseEvent) => {
  emit('click', event)
  if (event.defaultPrevented) return
  handleResetFormatting()
}
</script>
