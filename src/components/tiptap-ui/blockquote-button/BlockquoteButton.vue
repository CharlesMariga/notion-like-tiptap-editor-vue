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
    tooltip="Blockquote"
    @click="handleClick"
    v-bind="$attrs"
  >
    <slot>
      <component :is="Icon" class="tiptap-button-icon" />
      <span v-if="text" class="tiptap-button-text">{{ text }}</span>
      <Badge v-if="showShortcut">{{ formattedShortcut.join('') }}</Badge>
    </slot>
  </Button>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useTiptapEditor } from '@/composables/useTiptapEditor'
import { useBlockquote } from '@/composables/useBlockquote'
import type { UseBlockquoteConfig } from '@/composables/useBlockquote'
import Button from '@/components/tiptap-ui-primitive/button/Button.vue'
import Badge from '@/components/tiptap-ui-primitive/badge/Badge.vue'
import { parseShortcutKeys } from '@/lib/tiptap-utils'

interface BlockquoteButtonProps extends UseBlockquoteConfig {
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

const props = withDefaults(defineProps<BlockquoteButtonProps>(), {
  hideWhenUnavailable: false,
  showShortcut: false,
})

const emit = defineEmits<{
  click: [event: MouseEvent]
}>()

const { editor } = useTiptapEditor(props.editor)

const {
  isVisible,
  canToggle,
  isActive,
  handleToggle,
  label,
  shortcutKeys,
  Icon,
} = useBlockquote({
  editor: editor.value,
  hideWhenUnavailable: props.hideWhenUnavailable,
  onToggled: props.onToggled,
})

const formattedShortcut = computed(() =>
  parseShortcutKeys({ shortcutKeys })
)

const handleClick = (event: MouseEvent) => {
  emit('click', event)
  if (event.defaultPrevented) return
  handleToggle()
}
</script>
