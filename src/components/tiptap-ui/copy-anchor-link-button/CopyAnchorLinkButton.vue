<template>
  <Button
    v-if="isVisible"
    type="button"
    data-style="ghost"
    role="button"
    :tabindex="-1"
    :aria-label="label"
    tooltip="Copy anchor link"
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
import { useCopyAnchorLink, type UseCopyAnchorLinkConfig } from '@/composables/useCopyAnchorLink'

// --- UI Primitives ---
import Button from '@/components/tiptap-ui-primitive/button/Button.vue'
import Badge from '@/components/tiptap-ui-primitive/badge/Badge.vue'

export interface CopyAnchorLinkButtonProps extends UseCopyAnchorLinkConfig {
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

const props = withDefaults(defineProps<CopyAnchorLinkButtonProps>(), {
  hideWhenUnavailable: false,
  showShortcut: false,
})

const emit = defineEmits<{
  click: [event: MouseEvent]
}>()

const {
  isVisible,
  handleCopyAnchorLink,
  label,
  shortcutKeys,
  Icon,
} = useCopyAnchorLink({
  editor: props.editor,
  hideWhenUnavailable: props.hideWhenUnavailable,
  onNodeIdNotFound: props.onNodeIdNotFound,
  onExtractedNodeId: props.onExtractedNodeId,
  onCopied: props.onCopied,
})

const parsedShortcut = computed(() => parseShortcutKeys({ shortcutKeys }))

const handleClick = (event: MouseEvent) => {
  emit('click', event)
  if (event.defaultPrevented) return
  handleCopyAnchorLink()
}
</script>
