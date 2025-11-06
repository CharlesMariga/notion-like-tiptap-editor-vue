<template>
  <SubMenuTrigger :icon="Repeat2Icon" label="Turn Into">
    <ButtonGroup>
      <Label>Turn into</Label>
      <DropdownMenuItem
        v-for="action in actions"
        :key="action.label"
        as-child
      >
        <Button
          type="button"
          data-style="ghost"
          :data-active-state="action.isActive ? 'on' : 'off'"
          :disabled="action.disabled"
          @click="action.onClick"
        >
          <component :is="action.icon" class="tiptap-button-icon" />
          <span class="tiptap-button-text">{{ action.label }}</span>
        </Button>
      </DropdownMenuItem>
    </ButtonGroup>
  </SubMenuTrigger>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { DropdownMenuItem } from 'radix-vue'
import { ButtonGroup } from '@/components/tiptap-ui-primitive/button'
import { Label } from '@/components/tiptap-ui-primitive/label'
import Button from '@/components/tiptap-ui-primitive/button/Button.vue'
import SubMenuTrigger from './SubMenuTrigger.vue'
import { useText } from '@/composables/useText'
import { useHeading } from '@/composables/useHeading'
import { useList } from '@/composables/useList'
import { useBlockquote } from '@/composables/useBlockquote'
import { useCodeBlock } from '@/composables/useCodeBlock'
import Repeat2Icon from '@/components/tiptap-icons/Repeat2Icon.vue'

const text = useText()
const heading1 = useHeading({ level: 1 })
const heading2 = useHeading({ level: 2 })
const heading3 = useHeading({ level: 3 })
const bulletList = useList({ type: 'bulletList' })
const orderedList = useList({ type: 'orderedList' })
const taskList = useList({ type: 'taskList' })
const blockquote = useBlockquote()
const codeBlock = useCodeBlock()

const mapper = (action: ReturnType<
  | typeof useText
  | typeof useHeading
  | typeof useList
  | typeof useBlockquote
  | typeof useCodeBlock
>) => ({
  icon: action.Icon,
  label: action.label,
  onClick: action.handleToggle,
  disabled: !action.canToggle,
  isActive: action.isActive.value,
})

const actions = computed(() => [
  mapper(text),
  mapper(heading1),
  mapper(heading2),
  mapper(heading3),
  mapper(bulletList),
  mapper(orderedList),
  mapper(taskList),
  mapper(blockquote),
  mapper(codeBlock),
])
</script>
