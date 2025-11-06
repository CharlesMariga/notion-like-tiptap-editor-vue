import { computed, type Ref } from 'vue'
import { isNodeSelection } from '@tiptap/core'
import { canResetMarks } from '@/composables/useResetAllFormatting'
import { TURN_INTO_BLOCKS } from '@/composables/useTurnIntoDropdown'
import type { Editor } from '@tiptap/vue-3'
import { NodeSelection } from '@tiptap/pm/state'

export const useMenuActionVisibility = (
  editor: Ref<Editor | null>
) => {
  const hasColorActions = computed((): boolean => {
    if (!editor.value || !editor.value.state) return false

    return (
      !!editor.value.can().setMark('textStyle') ||
      !!editor.value.can().setMark('highlight') ||
      false
    )
  })

  const hasTransformActions = computed((): boolean => {
    if (!editor.value || !editor.value.state) return false

    const { selection } = editor.value.state
    let node = selection.$anchor.node(1)

    if (selection instanceof NodeSelection) {
      node = selection.node
    }

    return !!(
      node &&
      node.type &&
      node.type.name &&
      TURN_INTO_BLOCKS.includes(node.type.name)
    )
  })

  const hasImage = computed((): boolean => {
    if (!editor.value || !editor.value.state) return false

    const { selection } = editor.value.state
    let node = selection.$anchor.node(1)

    if (selection instanceof NodeSelection) {
      node = selection.node
    }

    return isNodeSelection(selection) && node.type.name === 'image'
  })

  const hasResetFormatting = computed((): boolean => {
    if (!editor.value || !editor.value.state) return false
    return canResetMarks(editor.value.state.tr, ['inlineThread'])
  })

  const hasAnyActionGroups = computed((): boolean => {
    return (
      hasColorActions.value ||
      hasTransformActions.value ||
      hasResetFormatting.value
    )
  })

  return {
    hasAnyActionGroups,
    hasColorActions,
    hasTransformActions,
    hasResetFormatting,
    hasImage,
  }
}
