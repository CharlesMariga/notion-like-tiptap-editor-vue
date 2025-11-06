<template>
  <Badge>{{ parsedShortcut.join('') }}</Badge>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { parseShortcutKeys } from '@/lib/tiptap-utils'
import Badge from '@/components/tiptap-ui-primitive/badge/Badge.vue'
import { AI_ASK_SHORTCUT_KEY } from '@/composables/useAiAsk'

export interface AiAskShortcutBadgeProps {
  shortcutKeys?: string
}

const props = withDefaults(defineProps<AiAskShortcutBadgeProps>(), {
  shortcutKeys: AI_ASK_SHORTCUT_KEY,
})

const parsedShortcut = computed(() =>
  parseShortcutKeys({ shortcutKeys: props.shortcutKeys })
)
</script>
