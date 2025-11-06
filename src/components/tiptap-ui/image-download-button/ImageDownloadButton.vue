<template>
  <Button
    v-if="isVisible"
    type="button"
    :disabled="!canDownload"
    data-style="ghost"
    data-active-state="off"
    :data-disabled="!canDownload"
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
      <Badge v-if="showShortcut">{{ formattedShortcut.join('') }}</Badge>
    </slot>
  </Button>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useTiptapEditor } from '@/composables/useTiptapEditor'
import { useImageDownload } from '@/composables/useImageDownload'
import type { UseImageDownloadConfig } from '@/composables/useImageDownload'
import Button from '@/components/tiptap-ui-primitive/button/Button.vue'
import Badge from '@/components/tiptap-ui-primitive/badge/Badge.vue'
import { parseShortcutKeys } from '@/lib/tiptap-utils'

interface ImageDownloadButtonProps extends UseImageDownloadConfig {
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

const props = withDefaults(defineProps<ImageDownloadButtonProps>(), {
  hideWhenUnavailable: false,
  showShortcut: false,
  downloadMethod: 'auto',
})

const emit = defineEmits<{
  click: [event: MouseEvent]
}>()

const { editor } = useTiptapEditor(props.editor)

const {
  isVisible,
  canDownload,
  handleDownload,
  label,
  shortcutKeys,
  Icon,
} = useImageDownload({
  editor: editor.value,
  hideWhenUnavailable: props.hideWhenUnavailable,
  onDownloaded: props.onDownloaded,
  resolveFileUrl: props.resolveFileUrl,
  downloadMethod: props.downloadMethod,
})

const formattedShortcut = computed(() =>
  parseShortcutKeys({ shortcutKeys })
)

const handleClick = async (event: MouseEvent) => {
  emit('click', event)
  if (event.defaultPrevented) return
  await handleDownload()
}
</script>
