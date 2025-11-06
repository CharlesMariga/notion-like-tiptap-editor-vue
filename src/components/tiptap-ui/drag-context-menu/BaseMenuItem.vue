<template>
  <MenuItem>
    <Button
      type="button"
      data-style="ghost"
      :data-active-state="isActive ? 'on' : 'off'"
      :disabled="disabled"
      @click="onClick"
    >
      <component :is="icon" class="tiptap-button-icon" />
      <span class="tiptap-button-text">{{ label }}</span>
      <slot name="shortcut-badge">
        <component v-if="shortcutBadge" :is="shortcutBadge" />
      </slot>
    </Button>
  </MenuItem>
</template>

<script setup lang="ts">
import { MenuItem } from '@/components/tiptap-ui-primitive/menu'
import Button from '@/components/tiptap-ui-primitive/button/Button.vue'
import type { MenuItemProps } from './drag-context-menu-types'

const props = withDefaults(defineProps<MenuItemProps>(), {
  disabled: false,
  isActive: false,
  shortcutBadge: undefined,
})

const emit = defineEmits<{
  click: []
}>()

const onClick = () => {
  props.onClick()
  emit('click')
}
</script>
