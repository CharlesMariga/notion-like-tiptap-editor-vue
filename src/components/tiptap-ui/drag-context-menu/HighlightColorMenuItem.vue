<template>
  <DropdownMenuItem as-child>
    <Button
      type="button"
      data-style="ghost"
      :data-active-state="isActive ? 'on' : 'off'"
      @click="handleColorHighlight"
    >
      <span
        class="tiptap-button-highlight"
        :style="{ '--highlight-color': color.value }"
      />
      <span class="tiptap-button-text">{{ label }}</span>
    </Button>
  </DropdownMenuItem>
</template>

<script setup lang="ts">
import { DropdownMenuItem } from 'radix-vue'
import Button from '@/components/tiptap-ui-primitive/button/Button.vue'
import { useRecentColors } from '@/composables/useRecentColors'
import { useColorHighlight } from '@/composables/useColorHighlight'
import type { ColorMenuItemProps } from './drag-context-menu-types'

const props = defineProps<ColorMenuItemProps>()

const { addRecentColor } = useRecentColors()
const { isActive, handleColorHighlight, label } = useColorHighlight({
  label: props.color.label,
  highlightColor: props.color.value,
  onApplied: ({ color, label }) =>
    addRecentColor({ type: 'highlight', label, value: color }),
})
</script>
