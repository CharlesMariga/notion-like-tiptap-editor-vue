<template>
  <Badge>{{ parsedShortcut.join('') }}</Badge>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { parseShortcutKeys } from '@/lib/tiptap-utils'
import { COPY_ANCHOR_LINK_SHORTCUT_KEY } from '@/composables/useCopyAnchorLink'
import Badge from '@/components/tiptap-ui-primitive/badge/Badge.vue'

export interface CopyAnchorLinkShortcutBadgeProps {
  shortcutKeys?: string
}

const props = withDefaults(defineProps<CopyAnchorLinkShortcutBadgeProps>(), {
  shortcutKeys: COPY_ANCHOR_LINK_SHORTCUT_KEY,
})

const parsedShortcut = computed(() => parseShortcutKeys({ shortcutKeys: props.shortcutKeys }))
</script>
