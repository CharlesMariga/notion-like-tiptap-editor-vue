<script setup lang="ts">
import { ref, watch, onBeforeUnmount } from 'vue'
import type { Editor } from '@tiptap/vue-3'
import { useTiptapEditor } from '@/composables/useTiptapEditor'
import { canToggleMark } from '@/composables/useMark'
import { canSetTextAlign } from '@/composables/useTextAlign'

// Icons
import MoreVerticalIcon from '@/components/tiptap-icons/MoreVerticalIcon.vue'

// UI Components
import MarkButton from '@/components/tiptap-ui/mark-button/MarkButton.vue'
import TextAlignButton from '@/components/tiptap-ui/TextAlignButton.vue'

// UI Primitives
import Button from '@/components/tiptap-ui-primitive/button/Button.vue'
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from '@/components/tiptap-ui-primitive/popover'
import Toolbar from '@/components/tiptap-ui-primitive/toolbar/Toolbar.vue'
import ToolbarGroup from '@/components/tiptap-ui-primitive/toolbar/ToolbarGroup.vue'
import ToolbarSeparator from '@/components/tiptap-ui-primitive/toolbar/ToolbarSeparator.vue'

interface MoreOptionsProps {
  editor?: Editor | null
  hideWhenUnavailable?: boolean
}

const props = withDefaults(defineProps<MoreOptionsProps>(), {
  hideWhenUnavailable: false,
})

const { editor: localEditor } = useTiptapEditor(props.editor)
const show = ref(false)

function canMoreOptions(editor: Editor | null): boolean {
  if (!editor) {
    return false
  }

  const canTextAlignAny = (['left', 'center', 'right', 'justify'] as const).some((align) =>
    canSetTextAlign(editor, align)
  )

  const canMarkAny = (['superscript', 'subscript'] as const).some((type) =>
    canToggleMark(editor, type)
  )

  return canMarkAny || canTextAlignAny
}

function shouldShowMoreOptions(params: {
  editor: Editor | null
  hideWhenUnavailable: boolean
}): boolean {
  const { editor, hideWhenUnavailable } = params

  if (!editor) {
    return false
  }

  if (hideWhenUnavailable && !editor.isActive('code')) {
    return canMoreOptions(editor)
  }

  return Boolean(editor?.isEditable)
}

const handleSelectionUpdate = () => {
  show.value = shouldShowMoreOptions({
    editor: localEditor.value,
    hideWhenUnavailable: props.hideWhenUnavailable,
  })
}

watch(
  localEditor,
  (newEditor) => {
    if (!newEditor) return

    handleSelectionUpdate()
    newEditor.on('selectionUpdate', handleSelectionUpdate)

    onBeforeUnmount(() => {
      newEditor.off('selectionUpdate', handleSelectionUpdate)
    })
  },
  { immediate: true }
)
</script>

<template>
  <template v-if="show && localEditor && localEditor.isEditable">
    <ToolbarSeparator />
    <ToolbarGroup>
      <Popover>
        <PopoverTrigger as-child>
          <Button
            type="button"
            data-style="ghost"
            role="button"
            :tabindex="-1"
            tooltip="More options"
          >
            <MoreVerticalIcon class="tiptap-button-icon" />
          </Button>
        </PopoverTrigger>

        <PopoverContent
          side="top"
          align="end"
          :align-offset="4"
          :side-offset="4"
          as-child
        >
          <Toolbar variant="floating" :tabindex="0">
            <ToolbarGroup>
              <MarkButton type="superscript" />
              <MarkButton type="subscript" />
            </ToolbarGroup>

            <ToolbarSeparator />

            <ToolbarGroup>
              <TextAlignButton align="left" />
              <TextAlignButton align="center" />
              <TextAlignButton align="right" />
              <TextAlignButton align="justify" />
            </ToolbarGroup>

            <ToolbarSeparator />
          </Toolbar>
        </PopoverContent>
      </Popover>
    </ToolbarGroup>
  </template>
</template>
