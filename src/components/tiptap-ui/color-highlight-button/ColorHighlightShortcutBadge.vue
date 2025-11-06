<template>
  <Badge>{{ parsedShortcut.join('') }}</Badge>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { parseShortcutKeys } from '@/lib/tiptap-utils'
import { COLOR_HIGHLIGHT_SHORTCUT_KEY } from '@/composables/useColorHighlight'
import Badge from '@/components/tiptap-ui-primitive/badge/Badge.vue'

export interface ColorHighlightShortcutBadgeProps {
  shortcutKeys?: string
}

const props = withDefaults(defineProps<ColorHighlightShortcutBadgeProps>(), {
  shortcutKeys: COLOR_HIGHLIGHT_SHORTCUT_KEY,
})

const parsedShortcut = computed(() => parseShortcutKeys({ shortcutKeys: props.shortcutKeys }))
</script>
