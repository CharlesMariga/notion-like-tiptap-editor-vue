<template>
  <Badge>{{ parsedShortcut.join('') }}</Badge>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { parseShortcutKeys } from '@/lib/tiptap-utils'
import Badge from '@/components/tiptap-ui-primitive/badge/Badge.vue'
import { COPY_TO_CLIPBOARD_SHORTCUT_KEY } from '@/composables/useCopyToClipboard'

export interface CopyToClipboardShortcutBadgeProps {
  shortcutKeys?: string
}

const props = withDefaults(defineProps<CopyToClipboardShortcutBadgeProps>(), {
  shortcutKeys: COPY_TO_CLIPBOARD_SHORTCUT_KEY,
})

const parsedShortcut = computed(() =>
  parseShortcutKeys({ shortcutKeys: props.shortcutKeys })
)
</script>
