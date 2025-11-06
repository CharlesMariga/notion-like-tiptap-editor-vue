<template>
  <Button
    v-if="isVisible"
    type="button"
    :disabled="!canInsert"
    data-style="ghost"
    :data-active-state="isActive ? 'on' : 'off'"
    :data-disabled="!canInsert"
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
      <Badge v-if="showShortcut">{{ formattedShortcut.join('') }}</Badge>
    </slot>
  </Button>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useTiptapEditor } from '@/composables/useTiptapEditor'
import { useImageUpload } from '@/composables/useImageUpload'
import type { UseImageUploadConfig } from '@/composables/useImageUpload'
import Button from '@/components/tiptap-ui-primitive/button/Button.vue'
import Badge from '@/components/tiptap-ui-primitive/badge/Badge.vue'
import { parseShortcutKeys } from '@/lib/tiptap-utils'

interface ImageUploadButtonProps extends UseImageUploadConfig {
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

const props = withDefaults(defineProps<ImageUploadButtonProps>(), {
  hideWhenUnavailable: false,
  showShortcut: false,
})

const emit = defineEmits<{
  click: [event: MouseEvent]
}>()

const { editor } = useTiptapEditor(props.editor)

const {
  isVisible,
  canInsert,
  handleImage,
  label,
  isActive,
  shortcutKeys,
  Icon,
} = useImageUpload({
  editor: editor.value,
  hideWhenUnavailable: props.hideWhenUnavailable,
  onInserted: props.onInserted,
})

const formattedShortcut = computed(() =>
  parseShortcutKeys({ shortcutKeys })
)

const handleClick = (event: MouseEvent) => {
  emit('click', event)
  if (event.defaultPrevented) return
  handleImage()
}
</script>
