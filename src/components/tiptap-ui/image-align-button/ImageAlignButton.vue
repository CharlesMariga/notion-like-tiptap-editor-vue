<template>
  <Button
    v-if="isVisible"
    type="button"
    :disabled="!canAlign"
    data-style="ghost"
    :data-active-state="isActive ? 'on' : 'off'"
    :data-disabled="!canAlign"
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
      <span v-if="text">{{ text }}</span>
      <Badge v-if="showShortcut">{{ formattedShortcut.join('') }}</Badge>
    </slot>
  </Button>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useTiptapEditor } from '@/composables/useTiptapEditor'
import { useImageAlign } from '@/composables/useImageAlign'
import type { UseImageAlignConfig } from '@/composables/useImageAlign'
import Button from '@/components/tiptap-ui-primitive/button/Button.vue'
import Badge from '@/components/tiptap-ui-primitive/badge/Badge.vue'
import { parseShortcutKeys } from '@/lib/tiptap-utils'

interface ImageAlignButtonProps extends UseImageAlignConfig {
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

const props = withDefaults(defineProps<ImageAlignButtonProps>(), {
  hideWhenUnavailable: false,
  showShortcut: false,
  extensionName: 'image',
  attributeName: 'data-align',
})

const emit = defineEmits<{
  click: [event: MouseEvent]
}>()

const { editor } = useTiptapEditor(props.editor)

const {
  isVisible,
  handleImageAlign,
  label,
  canAlign,
  isActive,
  Icon,
  shortcutKeys,
} = useImageAlign({
  editor: editor.value,
  align: props.align,
  extensionName: props.extensionName,
  attributeName: props.attributeName,
  hideWhenUnavailable: props.hideWhenUnavailable,
  onAligned: props.onAligned,
})

const formattedShortcut = computed(() =>
  parseShortcutKeys({ shortcutKeys })
)

const handleClick = (event: MouseEvent) => {
  emit('click', event)
  if (event.defaultPrevented) return
  handleImageAlign()
}
</script>
