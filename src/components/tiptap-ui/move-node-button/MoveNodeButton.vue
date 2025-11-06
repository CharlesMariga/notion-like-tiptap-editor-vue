<template>
  <Button
    v-if="isVisible"
    type="button"
    :disabled="!canMoveNode"
    data-style="ghost"
    role="button"
    :tabindex="-1"
    :aria-label="label"
    :tooltip="tooltip"
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
import { useMoveNode } from '@/composables/useMoveNode'
import type { UseMoveNodeConfig } from '@/composables/useMoveNode'
import Button from '@/components/tiptap-ui-primitive/button/Button.vue'
import Badge from '@/components/tiptap-ui-primitive/badge/Badge.vue'
import { parseShortcutKeys } from '@/lib/tiptap-utils'

interface MoveNodeButtonProps extends UseMoveNodeConfig {
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

const props = withDefaults(defineProps<MoveNodeButtonProps>(), {
  hideWhenUnavailable: false,
  showShortcut: false,
})

const emit = defineEmits<{
  click: [event: MouseEvent]
}>()

const { editor } = useTiptapEditor(props.editor)

const {
  isVisible,
  handleMoveNode,
  canMoveNode,
  label,
  shortcutKeys,
  Icon,
} = useMoveNode({
  editor: editor.value,
  direction: props.direction,
  hideWhenUnavailable: props.hideWhenUnavailable,
  onMoved: props.onMoved,
})

const formattedShortcut = computed(() =>
  parseShortcutKeys({ shortcutKeys })
)

const tooltip = computed(() =>
  props.direction === 'up' ? 'Move Up' : 'Move Down'
)

const handleClick = (event: MouseEvent) => {
  emit('click', event)
  if (event.defaultPrevented) return
  handleMoveNode()
}
</script>
