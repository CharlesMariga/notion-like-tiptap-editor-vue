<template>
  <template v-if="canAiAsk">
    <MenuGroup>
      <BaseMenuItem
        :icon="AiAskIcon"
        label="Ask AI"
        :on-click="handleAiAsk"
      >
        <template #shortcut-badge>
          <AiAskShortcutBadge />
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
import { useAiAsk, AiAskShortcutBadge } from '@/components/tiptap-ui/ai-ask-button'

const { handleAiAsk, canAiAsk, Icon: AiAskIcon } = useAiAsk()
</script>
