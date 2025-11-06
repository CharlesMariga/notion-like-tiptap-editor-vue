<template>
  <Button
    v-if="isVisible"
    type="button"
    data-style="ghost"
    role="button"
    :tabindex="-1"
    :aria-label="label"
    tooltip="Delete"
    @click="handleClick"
  >
    <slot>
      <component :is="Icon" class="tiptap-button-icon" />
      <span v-if="text" class="tiptap-button-text">{{ text }}</span>
      <DeleteNodeShortcutBadge v-if="showShortcut" :shortcut-keys="shortcutKeys" />
    </slot>
  </Button>
</template>

<script setup lang="ts">
import { useTiptapEditor } from '@/composables/useTiptapEditor'
import {
  useDeleteNode,
  type UseDeleteNodeConfig,
} from '@/composables/useDeleteNode'
import Button from '@/components/tiptap-ui-primitive/button/Button.vue'
import DeleteNodeShortcutBadge from './DeleteNodeShortcutBadge.vue'

export interface DeleteNodeButtonProps extends UseDeleteNodeConfig {
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

const props = withDefaults(defineProps<DeleteNodeButtonProps>(), {
  hideWhenUnavailable: false,
  showShortcut: false,
})

const emit = defineEmits<{
  click: [event: MouseEvent]
}>()

const { editor } = useTiptapEditor(props.editor)
const { isVisible, handleDeleteNode, label, shortcutKeys, Icon } = useDeleteNode({
  editor: editor.value,
  hideWhenUnavailable: props.hideWhenUnavailable,
  onDeleted: props.onDeleted,
})

const handleClick = (event: MouseEvent) => {
  emit('click', event)
  if (event.defaultPrevented) return
  handleDeleteNode()
}
</script>
