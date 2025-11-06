<template>
  <DragHandle
    v-if="editor"
    :editor="editor"
    :compute-position-config="dynamicPositions"
    class="tiptap-drag-handle"
    @node-change="(handleNodeChange as any)"
    @element-drag-start="onElementDragStart"
    @element-drag-end="onElementDragEnd"
    v-bind="$attrs"
  >
    <ButtonGroup
      orientation="horizontal"
      :style="{
        ...((aiGenerationActive || isMobile || (editor && isTextSelectionValid(editor)))
          ? { opacity: 0, pointerEvents: 'none' as 'none' }
          : {}),
        ...(isDragging ? { opacity: 0 } : {}),
      }"
    >
      <SlashCommandTriggerButton
        v-if="withSlashCommandTrigger"
        :node="node"
        :node-pos="nodePos"
        data-weight="small"
      />

      <Menu v-model:open="open" placement="left">
        <template #trigger>
          <MenuButton>
            <Button
              data-style="ghost"
              :tabindex="-1"
              data-weight="small"
              :style="{
                cursor: 'grab',
                ...(open ? { pointerEvents: 'none' } : {}),
              }"
              @click.capture="handleButtonMouseDown"
            >
              <template #tooltip>
                <div>Click for options</div>
                <div>Hold for drag</div>
              </template>
              <GripVerticalIcon class="tiptap-button-icon" />
            </Button>
          </MenuButton>
        </template>

        <MenuContent
          :auto-focus-on-hide="false"
          :prevent-body-scroll="true"
          side="left"
          portal
          @close="handleOnMenuClose"
        >
          <Card>
            <CardBody>
              <MenuGroup>
                <MenuGroupLabel>{{ getNodeDisplayName(editor) }}</MenuGroupLabel>
                <ColorActionGroup v-if="hasColorActions" />
                <TransformActionGroup v-if="hasTransformActions" />
                <ResetFormattingAction v-if="hasResetFormatting" />
                <ImageActionGroup v-if="hasImage" />
              </MenuGroup>

              <Separator v-if="hasAnyActionGroups" orientation="horizontal" />

              <CoreActionGroup />

              <AIActionGroup />

              <DeleteActionGroup />
            </CardBody>
          </Card>
        </MenuContent>
      </Menu>
    </ButtonGroup>
  </DragHandle>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import type { Node as TiptapNode } from '@tiptap/pm/model'
import { offset } from '@floating-ui/vue'

// Composables
import { useTiptapEditor } from '@/composables/useTiptapEditor'
import { useIsMobile } from '@/composables/useIsMobile'
import { useUiEditorState } from '@/composables/useUiEditorState'
import { selectNodeAndHideFloating } from '@/composables/useFloatingToolbarVisibility'
import { useMenuActionVisibility } from '@/composables/useDragContextMenu'

// Primitive UI Components
import { Button, ButtonGroup } from '@/components/tiptap-ui-primitive/button'
import {
  Menu,
  MenuContent,
  MenuGroup,
  MenuGroupLabel,
  MenuButton,
} from '@/components/tiptap-ui-primitive/menu'
import { Separator } from '@/components/tiptap-ui-primitive/separator'
import { Card, CardBody } from '@/components/tiptap-ui-primitive/card'

// Tiptap UI Components
import SlashCommandTriggerButton from '@/components/tiptap-ui/slash-command-trigger-button/SlashCommandTriggerButton.vue'

// Sub-components
import ColorActionGroup from './ColorActionGroup.vue'
import TransformActionGroup from './TransformActionGroup.vue'
import ResetFormattingAction from './ResetFormattingAction.vue'
import ImageActionGroup from './ImageActionGroup.vue'
import CoreActionGroup from './CoreActionGroup.vue'
import AIActionGroup from './AIActionGroup.vue'
import DeleteActionGroup from './DeleteActionGroup.vue'

// Drag Handle Extension
import { DragHandle } from '@tiptap/extension-drag-handle-vue-3'

// Utils
import {
  getNodeDisplayName,
  isTextSelectionValid,
} from '@/lib/tiptap-collab-utils'

// Icons
import GripVerticalIcon from '@/components/tiptap-icons/GripVerticalIcon.vue'

// Types
import type {
  DragContextMenuProps,
  NodeChangeData,
} from './drag-context-menu-types'

const props = withDefaults(defineProps<DragContextMenuProps>(), {
  withSlashCommandTrigger: true,
  mobileBreakpoint: 768,
})

const { editor } = useTiptapEditor(props.editor)
const { aiGenerationActive, isDragging } = useUiEditorState(editor)
const isMobile = useIsMobile(props.mobileBreakpoint)

const open = ref(false)
const node = ref<TiptapNode | null>(null)
const nodePos = ref<number>(-1)

watch(open, (newValue) => {
  console.log('DragContextMenu: open changed to', newValue)
})


const handleNodeChange = (data: NodeChangeData) => {
  if (data.node) node.value = data.node
  nodePos.value = data.pos
}

watch(
  () => [editor.value, open.value],
  ([newEditor, newOpen]) => {
    if (!newEditor || typeof newOpen !== 'boolean') return
    (newEditor as any).commands.setLockDragHandle(newOpen)
    ;(newEditor as any).commands.setMeta('lockDragHandle', newOpen)
  }
)

const {
  hasAnyActionGroups,
  hasColorActions,
  hasTransformActions,
  hasResetFormatting,
  hasImage,
} = useMenuActionVisibility(editor)

const dynamicPositions = computed(() => {
  return {
    strategy: 'absolute' as const,
    middleware: [
      offset((props) => {
        const { rects } = props
        const nodeHeight = rects.reference.height
        const dragHandleHeight = rects.floating.height

        const crossAxis = nodeHeight / 2 - dragHandleHeight / 2

        return {
          mainAxis: 16,
          // if height is more than 40px, then it's likely a block node
          crossAxis: nodeHeight > 40 ? 0 : crossAxis,
        }
      }),
    ],
  }
})

const handleOnMenuClose = () => {
  if (editor.value) {
    editor.value.commands.setMeta('hideDragHandle', true)
  }
}

const onElementDragStart = () => {
  if (!editor.value) return
  editor.value.commands.setIsDragging(true)
}

const onElementDragEnd = () => {
  if (!editor.value) return
  editor.value.commands.setIsDragging(false)
}

const handleButtonMouseDown = () => {
  if (editor.value) {
    selectNodeAndHideFloating(editor.value, nodePos.value)
  }
}
</script>
