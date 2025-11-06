<script setup lang="ts">
import type { UseTurnIntoDropdownConfig } from '@/composables/useTurnIntoDropdown'
import { useTurnIntoDropdown } from '@/composables/useTurnIntoDropdown'
import { useTiptapEditor } from '@/composables/useTiptapEditor'
import Button from '@/components/tiptap-ui-primitive/button/Button.vue'
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
} from '@/components/tiptap-ui-primitive/dropdown-menu'
import TurnIntoDropdownContent from './TurnIntoDropdownContent.vue'

export interface TurnIntoDropdownProps extends UseTurnIntoDropdownConfig {
  /**
   * Whether to use card layout for the dropdown content
   * @default true
   */
  useCardLayout?: boolean
}

const props = withDefaults(defineProps<TurnIntoDropdownProps>(), {
  hideWhenUnavailable: false,
  useCardLayout: true,
})

const { editor } = useTiptapEditor(props.editor)

const {
  isVisible,
  canToggle,
  isOpen,
  activeBlockType,
  handleOpenChange,
  label,
  Icon,
} = useTurnIntoDropdown({
  editor: editor.value,
  hideWhenUnavailable: props.hideWhenUnavailable,
  blockTypes: props.blockTypes,
  onOpenChange: props.onOpenChange,
})
</script>

<template>
  <DropdownMenu v-if="isVisible" :open="isOpen" @update:open="handleOpenChange">
    <DropdownMenuTrigger as-child>
      <Button
        type="button"
        data-style="ghost"
        :disabled="!canToggle"
        :data-disabled="!canToggle"
        role="button"
        :tabindex="-1"
        :aria-label="label"
        tooltip="Turn into"
      >
        <slot>
          <span class="tiptap-button-text">
            {{ activeBlockType?.label || 'Text' }}
          </span>
          <Icon class="tiptap-button-dropdown-small" />
        </slot>
      </Button>
    </DropdownMenuTrigger>

    <DropdownMenuContent align="start">
      <TurnIntoDropdownContent
        :block-types="blockTypes"
        :use-card-layout="useCardLayout"
      />
    </DropdownMenuContent>
  </DropdownMenu>
</template>
