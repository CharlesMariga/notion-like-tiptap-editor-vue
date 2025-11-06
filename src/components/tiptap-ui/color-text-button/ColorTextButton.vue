<template>
  <Button
    v-if="isVisible"
    type="button"
    data-style="ghost"
    :data-active-state="isActive ? 'on' : 'off'"
    role="button"
    :tabindex="-1"
    :disabled="!canColorText"
    :data-disabled="!canColorText"
    :aria-label="label"
    :aria-pressed="isActive"
    :tooltip="label"
    @click="handleClick"
    :style="buttonStyle"
    v-bind="$attrs"
  >
    <slot>
      <span
        class="tiptap-button-color-text"
        :style="{ color: textColor }"
      >
        <component
          :is="Icon"
          class="tiptap-button-icon"
          :style="{ color: textColor, flexGrow: 1 }"
        />
      </span>
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
import { useColorTextButton, type UseColorTextConfig } from '@/composables/useColorTextButton'

// --- UI Primitives ---
import Button from '@/components/tiptap-ui-primitive/button/Button.vue'
import Badge from '@/components/tiptap-ui-primitive/badge/Badge.vue'

// --- Styles ---
import './color-text-button.scss'

export interface ColorTextButtonProps extends UseColorTextConfig {
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

const props = withDefaults(defineProps<ColorTextButtonProps>(), {
  hideWhenUnavailable: false,
  showShortcut: false,
})

const emit = defineEmits<{
  click: [event: MouseEvent]
}>()

const {
  isVisible,
  canColorText,
  isActive,
  handleColorText,
  label,
  shortcutKeys,
  Icon,
} = useColorTextButton({
  editor: props.editor,
  textColor: props.textColor,
  label: props.text || `Color text to ${props.textColor}`,
  hideWhenUnavailable: props.hideWhenUnavailable,
  onApplied: props.onApplied,
})

const parsedShortcut = computed(() => parseShortcutKeys({ shortcutKeys }))

const buttonStyle = computed(() => ({
  '--color-text-button-color': props.textColor,
}) as CSSProperties)

const handleClick = (event: MouseEvent) => {
  emit('click', event)
  if (event.defaultPrevented) return
  handleColorText()
}
</script>
