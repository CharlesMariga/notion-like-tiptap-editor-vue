<template>
  <Badge>{{ parsedShortcut.join('') }}</Badge>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { parseShortcutKeys } from '@/lib/tiptap-utils'
import { SLASH_COMMAND_TRIGGER_SHORTCUT_KEY } from '@/composables/useSlashCommandTrigger'
import Badge from '@/components/tiptap-ui-primitive/badge/Badge.vue'

export interface SlashCommandShortcutBadgeProps {
  shortcutKeys?: string
}

const props = withDefaults(defineProps<SlashCommandShortcutBadgeProps>(), {
  shortcutKeys: SLASH_COMMAND_TRIGGER_SHORTCUT_KEY,
})

const parsedShortcut = computed(() => parseShortcutKeys({ shortcutKeys: props.shortcutKeys }))
</script>
