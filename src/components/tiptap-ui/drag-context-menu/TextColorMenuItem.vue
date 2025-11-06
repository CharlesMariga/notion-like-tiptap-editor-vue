<template>
  <DropdownMenuItem as-child>
    <Button
      type="button"
      data-style="ghost"
      :data-active-state="isActive ? 'on' : 'off'"
      @click="handleColorText"
    >
      <span class="tiptap-button-color-text" :style="{ color: color.value }">
        <TextColorSmallIcon
          class="tiptap-button-icon"
          :style="{ color: color.value, flexGrow: 1 }"
        />
      </span>
      <span class="tiptap-button-text">{{ label }}</span>
    </Button>
  </DropdownMenuItem>
</template>

<script setup lang="ts">
import { DropdownMenuItem } from 'radix-vue'
import Button from '@/components/tiptap-ui-primitive/button/Button.vue'
import TextColorSmallIcon from '@/components/tiptap-icons/TextColorSmallIcon.vue'
import { useRecentColors } from '@/composables/useRecentColors'
import { useColorTextButton } from '@/composables/useColorTextButton'
import type { ColorMenuItemProps } from './drag-context-menu-types'

const props = defineProps<ColorMenuItemProps>()

const { addRecentColor } = useRecentColors()
const { isActive, handleColorText, label } = useColorTextButton({
  label: props.color.label,
  textColor: props.color.value,
  onApplied: ({ color, label }) =>
    addRecentColor({ type: 'text', label, value: color }),
})
</script>
