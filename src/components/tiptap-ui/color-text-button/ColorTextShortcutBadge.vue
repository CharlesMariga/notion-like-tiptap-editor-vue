<template>
  <Badge>{{ parsedShortcut.join('') }}</Badge>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { parseShortcutKeys } from '@/lib/tiptap-utils'
import { COLOR_TEXT_SHORTCUT_KEY } from '@/composables/useColorTextButton'
import Badge from '@/components/tiptap-ui-primitive/badge/Badge.vue'

export interface ColorTextShortcutBadgeProps {
  shortcutKeys?: string
}

const props = withDefaults(defineProps<ColorTextShortcutBadgeProps>(), {
  shortcutKeys: COLOR_TEXT_SHORTCUT_KEY,
})

const parsedShortcut = computed(() => parseShortcutKeys({ shortcutKeys: props.shortcutKeys }))
</script>
