<script setup lang="ts">
import { computed } from 'vue'
import { useTiptapEditor } from '@/composables/useTiptapEditor'
import { useUiEditorState } from '@/composables/useUiEditorState'
import { useMobile } from '@/composables/useMobile'
import { useFloatingToolbarVisibility } from '@/composables/useFloatingToolbarVisibility'
import { isSelectionValid } from '@/lib/tiptap-collab-utils'
import FloatingElement from '@/components/tiptap-ui-utils/FloatingElement.vue'
import Toolbar from '@/components/tiptap-ui-primitive/toolbar/Toolbar.vue'
import ToolbarGroup from '@/components/tiptap-ui-primitive/toolbar/ToolbarGroup.vue'
import ToolbarSeparator from '@/components/tiptap-ui-primitive/toolbar/ToolbarSeparator.vue'
import MarkButton from '@/components/tiptap-ui/mark-button/MarkButton.vue'
import LinkPopover from '@/components/tiptap-ui/LinkPopover.vue'
import ColorTextPopover from '@/components/tiptap-ui/color-text-popover/ColorTextPopover.vue'
import TurnIntoDropdown from '@/components/tiptap-ui/turn-into-dropdown/TurnIntoDropdown.vue'
import ImageNodeFloating from '@/components/tiptap-node/image-node/image-node-floating.vue'
import ImproveDropdown from '@/components/tiptap-ui/improve-dropdown/ImproveDropdown.vue'
import MoreOptions from './NotionEditorFloatingToolbarMoreOptions.vue'

const { editor } = useTiptapEditor()
const isMobile = useMobile(480)
const uiState = useUiEditorState(editor)

const { shouldShow } = useFloatingToolbarVisibility({
  editor: editor.value,
  isSelectionValid,
  extraHideWhen: computed(() => Boolean(uiState.aiGenerationActive.value || uiState.commentInputVisible.value)),
})

const shouldRender = computed(() => !uiState.lockDragHandle.value && !isMobile.value)
</script>

<template>
  <FloatingElement v-if="shouldRender" :should-show="shouldShow">
    <Toolbar variant="floating">
      <ToolbarGroup>
        <ImproveDropdown :hide-when-unavailable="true" />
      </ToolbarGroup>

      <ToolbarSeparator />

      <ToolbarGroup>
        <TurnIntoDropdown :hide-when-unavailable="true" />
      </ToolbarGroup>

      <ToolbarSeparator />

      <ToolbarGroup>
        <MarkButton type="bold" :hide-when-unavailable="true" />
        <MarkButton type="italic" :hide-when-unavailable="true" />
        <MarkButton type="strike" :hide-when-unavailable="true" />
        <MarkButton type="code" :hide-when-unavailable="true" />
      </ToolbarGroup>

      <ToolbarSeparator />

      <ToolbarGroup>
        <ImageNodeFloating />
      </ToolbarGroup>

      <ToolbarGroup>
        <LinkPopover :auto-open-on-link-active="false" :hide-when-unavailable="true" />
        <ColorTextPopover :hide-when-unavailable="true" />
      </ToolbarGroup>

      <MoreOptions :hide-when-unavailable="true" />
    </Toolbar>
  </FloatingElement>
</template>
