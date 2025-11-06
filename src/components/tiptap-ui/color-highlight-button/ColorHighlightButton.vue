<template>
  <Button
    v-if="isVisible"
    type="button"
    data-style="ghost"
    :data-active-state="isActive ? 'on' : 'off'"
    role="button"
    :tabindex="-1"
    :disabled="!canColorHighlight"
    :data-disabled="!canColorHighlight"
    :aria-label="label"
    :aria-pressed="isActive"
    :tooltip="label"
    @click="handleClick"
    :style="buttonStyle"
    v-bind="$attrs"
  >
    <slot>
      <span
        class="tiptap-button-highlight"
        :style="{ '--highlight-color': highlightColor }"
      />
      <span v-if="text" class="tiptap-button-text">{{ text }}</span>
      <Badge v-if="showShortcut">{{ parsedShortcut.join('') }}</Badge>
    </slot>
  </Button>
</template>

<script setup lang="ts">
import { computed, type CSSProperties } from 'vue'

// --- Lib ---
import { parseShortcutKeys } from '@/lib/tiptap-utils'

// --- Composables ---
import { useColorHighlight, type UseColorHighlightConfig } from '@/composables/useColorHighlight'

// --- UI Primitives ---
import Button from '@/components/tiptap-ui-primitive/button/Button.vue'
import Badge from '@/components/tiptap-ui-primitive/badge/Badge.vue'

// --- Styles ---
import './color-highlight-button.scss'

export interface ColorHighlightButtonProps extends UseColorHighlightConfig {
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

const props = withDefaults(defineProps<ColorHighlightButtonProps>(), {
  hideWhenUnavailable: false,
  showShortcut: false,
})

const emit = defineEmits<{
  click: [event: MouseEvent]
}>()

const {
  isVisible,
  canColorHighlight,
  isActive,
  handleColorHighlight,
  label,
  shortcutKeys,
} = useColorHighlight({
  editor: props.editor,
  highlightColor: props.highlightColor,
  label: props.text || `Toggle highlight (${props.highlightColor})`,
  hideWhenUnavailable: props.hideWhenUnavailable,
  onApplied: props.onApplied,
})

const parsedShortcut = computed(() => parseShortcutKeys({ shortcutKeys }))

const buttonStyle = computed(() => ({
  '--highlight-color': props.highlightColor,
}) as CSSProperties)

const handleClick = (event: MouseEvent) => {
  emit('click', event)
  if (event.defaultPrevented) return
  handleColorHighlight()
}
</script>
