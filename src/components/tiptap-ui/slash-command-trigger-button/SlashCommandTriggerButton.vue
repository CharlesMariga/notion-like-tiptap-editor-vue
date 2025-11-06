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
      <Badge v-if="showShortcut">{{ parsedShortcut.join('') }}</Badge>
    </slot>
  </Button>
</template>

<script setup lang="ts">
import { computed } from 'vue'

// --- Lib ---
import { parseShortcutKeys } from '@/lib/tiptap-utils'

// --- Composables ---
import { useSlashCommandTrigger, type UseSlashCommandTriggerConfig } from '@/composables/useSlashCommandTrigger'

// --- UI Primitives ---
import Button from '@/components/tiptap-ui-primitive/button/Button.vue'
import Badge from '@/components/tiptap-ui-primitive/badge/Badge.vue'

export interface SlashCommandTriggerButtonProps extends UseSlashCommandTriggerConfig {
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

const props = withDefaults(defineProps<SlashCommandTriggerButtonProps>(), {
  trigger: '/',
  hideWhenUnavailable: false,
  showShortcut: false,
})

const emit = defineEmits<{
  click: [event: MouseEvent]
}>()

const {
  isVisible,
  canInsert,
  handleSlashCommand,
  label,
  shortcutKeys,
  Icon,
} = useSlashCommandTrigger({
  editor: props.editor,
  node: props.node,
  nodePos: props.nodePos,
  trigger: props.trigger,
  hideWhenUnavailable: props.hideWhenUnavailable,
  onTriggered: props.onTriggered,
})

const parsedShortcut = computed(() => parseShortcutKeys({ shortcutKeys }))

const handleClick = (event: MouseEvent) => {
  emit('click', event)
  if (event.defaultPrevented) return
  handleSlashCommand()
}
</script>
