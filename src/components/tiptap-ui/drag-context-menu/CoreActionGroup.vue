<template>
  <template v-if="canDuplicate || canCopyToClipboard || canCopyAnchorLink">
    <MenuGroup>
      <BaseMenuItem
        :icon="DuplicateIcon"
        :label="duplicateLabel"
        :on-click="handleDuplicate"
        :disabled="!canDuplicate"
      >
        <template #shortcut-badge>
          <DuplicateShortcutBadge />
        </template>
      </BaseMenuItem>
      <BaseMenuItem
        :icon="CopyIcon"
        :label="copyLabel"
        :on-click="handleCopyToClipboard"
        :disabled="!canCopyToClipboard"
      >
        <template #shortcut-badge>
          <CopyToClipboardShortcutBadge />
        </template>
      </BaseMenuItem>
      <BaseMenuItem
        :icon="CopyAnchorLinkIcon"
        :label="copyAnchorLinkLabel"
        :on-click="handleCopyAnchorLink"
        :disabled="!canCopyAnchorLink"
      >
        <template #shortcut-badge>
          <CopyAnchorLinkShortcutBadge />
        </template>
      </BaseMenuItem>
    </MenuGroup>

    <Separator orientation="horizontal" />
  </template>
</template>

<script setup lang="ts">
import { MenuGroup } from '@/components/tiptap-ui-primitive/menu'
import { Separator } from '@/components/tiptap-ui-primitive/separator'
import BaseMenuItem from './BaseMenuItem.vue'
import { useDuplicate, DuplicateShortcutBadge } from '@/components/tiptap-ui/duplicate-button'
import {
  useCopyToClipboard,
  CopyToClipboardShortcutBadge,
} from '@/components/tiptap-ui/copy-to-clipboard-button'
import {
  useCopyAnchorLink,
  CopyAnchorLinkShortcutBadge,
} from '@/components/tiptap-ui/copy-anchor-link-button'

const {
  handleDuplicate,
  canDuplicate,
  label: duplicateLabel,
  Icon: DuplicateIcon,
} = useDuplicate()

const {
  handleCopyToClipboard,
  canCopyToClipboard,
  label: copyLabel,
  Icon: CopyIcon,
} = useCopyToClipboard()

const {
  handleCopyAnchorLink,
  canCopyAnchorLink,
  label: copyAnchorLinkLabel,
  Icon: CopyAnchorLinkIcon,
} = useCopyAnchorLink()
</script>
