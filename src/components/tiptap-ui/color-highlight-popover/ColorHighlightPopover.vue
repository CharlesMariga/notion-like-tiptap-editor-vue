<template>
  <Popover v-if="isVisible" v-model:open="isOpen">
    <PopoverTrigger as-child>
      <ColorHighlightPopoverButton
        :disabled="!canColorHighlight"
        :data-active-state="isActive ? 'on' : 'off'"
        :data-disabled="!canColorHighlight"
        :aria-pressed="isActive"
        :aria-label="label"
        :tooltip="label"
        v-bind="$attrs"
      >
        <component :is="Icon" class="tiptap-button-icon" />
      </ColorHighlightPopoverButton>
    </PopoverTrigger>
    <PopoverContent aria-label="Highlight colors">
      <ColorHighlightPopoverContent :editor="editor" :colors="colors" />
    </PopoverContent>
  </Popover>
</template>

<script setup lang="ts">
import { ref } from 'vue'

// --- Composables ---
import { useTiptapEditor } from '@/composables/useTiptapEditor'
import {
  useColorHighlight,
  pickHighlightColorsByValue,
  type UseColorHighlightConfig,
  type HighlightColor,
} from '@/composables/useColorHighlight'

// --- UI Primitives ---
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from '@/components/tiptap-ui-primitive/popover'

// --- Components ---
import ColorHighlightPopoverButton from './ColorHighlightPopoverButton.vue'
import ColorHighlightPopoverContent from './ColorHighlightPopoverContent.vue'

export interface ColorHighlightPopoverProps
  extends Pick<
    UseColorHighlightConfig,
    'editor' | 'hideWhenUnavailable' | 'onApplied'
  > {
  /**
   * Optional colors to use in the highlight popover.
   * If not provided, defaults to a predefined set of colors.
   */
  colors?: HighlightColor[]
}

const props = withDefaults(defineProps<ColorHighlightPopoverProps>(), {
  hideWhenUnavailable: false,
  colors: () =>
    pickHighlightColorsByValue([
      'var(--tt-color-highlight-green)',
      'var(--tt-color-highlight-blue)',
      'var(--tt-color-highlight-red)',
      'var(--tt-color-highlight-purple)',
      'var(--tt-color-highlight-yellow)',
    ]),
})

const { editor } = useTiptapEditor(props.editor)
const isOpen = ref(false)
const { isVisible, canColorHighlight, isActive, label, Icon } = useColorHighlight({
  editor: editor.value,
  hideWhenUnavailable: props.hideWhenUnavailable,
  onApplied: props.onApplied,
})
</script>
