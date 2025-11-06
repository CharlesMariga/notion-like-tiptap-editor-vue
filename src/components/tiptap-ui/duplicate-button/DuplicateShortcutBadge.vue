<template>
  <Badge>{{ parsedShortcut.join('') }}</Badge>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { parseShortcutKeys } from '@/lib/tiptap-utils'
import Badge from '@/components/tiptap-ui-primitive/badge/Badge.vue'
import { DUPLICATE_SHORTCUT_KEY } from '@/composables/useDuplicate'

export interface DuplicateShortcutBadgeProps {
  shortcutKeys?: string
}

const props = withDefaults(defineProps<DuplicateShortcutBadgeProps>(), {
  shortcutKeys: DUPLICATE_SHORTCUT_KEY,
})

const parsedShortcut = computed(() =>
  parseShortcutKeys({ shortcutKeys: props.shortcutKeys })
)
</script>
