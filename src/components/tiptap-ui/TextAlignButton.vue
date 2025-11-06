<template>
  <Button
    v-if="isVisible"
    type="button"
    :disabled="!canAlign"
    data-style="ghost"
    :data-active-state="isActive ? 'on' : 'off'"
    :data-disabled="!canAlign"
    role="button"
    :tabindex="-1"
    :aria-label="label"
    :aria-pressed="isActive"
    :tooltip="label"
    @click="handleClick"
    v-bind="$attrs"
  >
    <slot>
      <component :is="Icon" class="tiptap-button-icon" />
      <span v-if="text" class="tiptap-button-text">{{ text }}</span>
      <Badge v-if="showShortcut">
        <template v-for="(key, index) in parsedShortcut" :key="index">
          {{ key }}
        </template>
      </Badge>
    </slot>
  </Button>
</template>

<script setup lang="ts">
import { computed, type Component } from 'vue'
import type { Editor } from '@tiptap/vue-3'
import { useTiptapEditor } from '@/composables/useTiptapEditor'
import { useTextAlign, type TextAlign } from '@/composables/useTextAlign'
import { parseShortcutKeys } from '@/lib/tiptap-utils'
import Button from '@/components/tiptap-ui-primitive/button/Button.vue'
import Badge from '@/components/tiptap-ui-primitive/badge/Badge.vue'

interface TextAlignButtonProps {
  editor?: Editor | null
  align: TextAlign
  text?: string
  hideWhenUnavailable?: boolean
  showShortcut?: boolean
  icon?: Component
}

const props = withDefaults(defineProps<TextAlignButtonProps>(), {
  hideWhenUnavailable: false,
  showShortcut: false,
})

const emit = defineEmits<{
  aligned: []
}>()

const { editor } = useTiptapEditor(props.editor)

const {
  isVisible,
  handleTextAlign,
  label,
  canAlign,
  isActive,
  Icon: DefaultIcon,
  shortcutKeys,
} = useTextAlign({
  editor: editor.value,
  align: props.align,
  hideWhenUnavailable: props.hideWhenUnavailable,
  onAligned: () => emit('aligned'),
})

const Icon = computed(() => props.icon ?? DefaultIcon)

const parsedShortcut = computed(() => {
  return parseShortcutKeys({ shortcutKeys })
})

const handleClick = (event: MouseEvent) => {
  if (event.defaultPrevented) return
  handleTextAlign()
}
</script>
