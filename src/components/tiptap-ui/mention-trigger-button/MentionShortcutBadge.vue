<template>
  <Badge>{{ parsedShortcut.join('') }}</Badge>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { parseShortcutKeys } from '@/lib/tiptap-utils'
import Badge from '@/components/tiptap-ui-primitive/badge/Badge.vue'
import { MENTION_TRIGGER_SHORTCUT_KEY } from '@/composables/useMentionTrigger'

const props = withDefaults(
  defineProps<{
    shortcutKeys?: string
  }>(),
  {
    shortcutKeys: MENTION_TRIGGER_SHORTCUT_KEY,
  }
)

const parsedShortcut = computed(() =>
  parseShortcutKeys({ shortcutKeys: props.shortcutKeys })
)
</script>
