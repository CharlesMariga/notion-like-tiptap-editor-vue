<template>
  <MenuGroup>
    <BaseMenuItem
      :icon="Icon"
      :label="label"
      :on-click="handleDeleteNode"
      :disabled="!canDeleteNode"
    >
      <template #shortcut-badge>
        <DeleteNodeShortcutBadge />
      </template>
    </BaseMenuItem>
  </MenuGroup>
</template>

<script setup lang="ts">
import { MenuGroup } from '@/components/tiptap-ui-primitive/menu'
import BaseMenuItem from './BaseMenuItem.vue'
import {
  useDeleteNode,
  DeleteNodeShortcutBadge,
} from '@/components/tiptap-ui/delete-node-button'

const { handleDeleteNode, canDeleteNode, label, Icon } = useDeleteNode()
</script>
