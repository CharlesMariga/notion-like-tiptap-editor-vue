<template>
  <Badge>{{ parsedShortcut.join('') }}</Badge>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { parseShortcutKeys } from '@/lib/tiptap-utils'
import Badge from '@/components/tiptap-ui-primitive/badge/Badge.vue'
import { DELETE_NODE_SHORTCUT_KEY } from '@/composables/useDeleteNode'

export interface DeleteNodeShortcutBadgeProps {
  shortcutKeys?: string
}

const props = withDefaults(defineProps<DeleteNodeShortcutBadgeProps>(), {
  shortcutKeys: DELETE_NODE_SHORTCUT_KEY,
})

const parsedShortcut = computed(() =>
  parseShortcutKeys({ shortcutKeys: props.shortcutKeys })
)
</script>
