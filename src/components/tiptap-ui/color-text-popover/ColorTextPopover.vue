<template>
  <Popover v-if="isVisible" v-model:open="isOpen">
    <PopoverTrigger as-child>
      <Button
        type="button"
        data-style="ghost"
        data-appearance="default"
        role="button"
        :aria-label="label"
        :tooltip="label"
        :disabled="!canToggle"
        :data-disabled="!canToggle"
        v-bind="$attrs"
      >
        <slot>
          <span
            class="tiptap-button-color-text-popover"
            :style="
              activeHighlight.color
                ? { '--active-highlight-color': activeHighlight.color }
                : {}
            "
          >
            <component
              :is="Icon"
              class="tiptap-button-icon"
              :style="{
                color: activeTextStyle.color || undefined,
              }"
            />
          </span>
          <ChevronDownIcon class="tiptap-button-dropdown-small" />
        </slot>
      </Button>
    </PopoverTrigger>

    <PopoverContent aria-label="Text color options" side="bottom" align="start">
      <TextStyleColorPanel :on-color-changed="handleColorChanged" />
    </PopoverContent>
  </Popover>
</template>

<script setup lang="ts">
import { ref } from 'vue'

// --- Composables ---
import { useTiptapEditor } from '@/composables/useTiptapEditor'
import {
  useColorTextPopover,
  type UseColorTextPopoverConfig,
} from '@/composables/useColorTextPopover'

// --- Icons ---
import ChevronDownIcon from '@/components/tiptap-icons/ChevronDownIcon.vue'

// --- UI Primitives ---
import Button from '@/components/tiptap-ui-primitive/button/Button.vue'
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from '@/components/tiptap-ui-primitive/popover'

// --- Components ---
import TextStyleColorPanel from './TextStyleColorPanel.vue'

// --- Styles ---
import './color-text-popover.scss'

export interface ColorTextPopoverProps extends UseColorTextPopoverConfig {}

const props = withDefaults(defineProps<ColorTextPopoverProps>(), {
  hideWhenUnavailable: false,
})

const { editor } = useTiptapEditor(props.editor)
const isOpen = ref(false)
const {
  isVisible,
  canToggle,
  activeTextStyle,
  activeHighlight,
  handleColorChanged,
  label,
  Icon,
} = useColorTextPopover({
  editor: editor.value,
  hideWhenUnavailable: props.hideWhenUnavailable,
  onColorChanged: props.onColorChanged,
})
</script>
