import { ref, computed, watch, onMounted, onBeforeUnmount, markRaw } from 'vue'
import { isNodeSelection, type Editor } from '@tiptap/vue-3'

// Lib
import {
  isExtensionAvailable,
  isNodeTypeSelected,
} from '@/lib/tiptap-utils'

// Composables
import { useTiptapEditor } from '@/composables/useTiptapEditor'
import { useMobile } from '@/composables/useMobile'

// Icons
import AiSparklesIcon from '@/components/tiptap-icons/AiSparklesIcon.vue'

export interface UseAiAskConfig {
  /**
   * The Tiptap editor instance.
   */
  editor?: Editor | null
  /**
   * Whether the button should hide when AI is not available.
   * @default false
   */
  hideWhenUnavailable?: boolean
  /**
   * Callback function called after AI ask is successfully triggered
   */
  onAiAsked?: () => void
}

export const AI_ASK_SHORTCUT_KEY = 'mod+j'
export const AI_EXTENSIONS = ['aiGeneration', 'ai']
export const EXCLUDED_SELECTION_TYPES = ['codeBlock', 'image', 'imageUpload']

export const canPerformAiAsk = (editor: Editor | null): boolean => {
  if (!editor || !editor.isEditable) return false
  // TODO: Wait until AI extensions support for image
  if (
    !isExtensionAvailable(editor, AI_EXTENSIONS) ||
    isNodeTypeSelected(editor, ['image', 'horizontalRule'])
  )
    return false

  const { selection } = editor.state
  if (!selection || selection.empty) return false

  if (isNodeSelection(selection)) {
    const selectedNode = selection.node
    if (EXCLUDED_SELECTION_TYPES.includes(selectedNode.type.name)) {
      return false
    }
  }

  return true
}

export function shouldShowButton(props: {
  editor: Editor | null
  hideWhenUnavailable: boolean
}): boolean {
  const { editor, hideWhenUnavailable } = props

  if (!editor || !editor.isEditable) return false
  if (!isExtensionAvailable(editor, AI_EXTENSIONS)) return false

  if (hideWhenUnavailable && !editor.isActive('code')) {
    return canPerformAiAsk(editor)
  }

  return true
}

/**
 * Custom composable that provides AI ask functionality for Tiptap editor
 */
export function useAiAsk(config: UseAiAskConfig = {}) {
  const {
    editor: providedEditor,
    hideWhenUnavailable = false,
    onAiAsked,
  } = config

  const { editor } = useTiptapEditor(providedEditor)
  const isMobile = useMobile()
  const isVisible = ref<boolean>(true)
  const canAiAsk = computed(() => canPerformAiAsk(editor.value))

  const handleAiAsk = (): boolean => {
    if (!editor.value || !canAiAsk.value) return false

    const success = editor.value.chain().focus().aiGenerationShow().run()
    if (success) {
      onAiAsked?.()
    }
    return success
  }

  // Handle keyboard shortcut
  const handleKeydown = (event: KeyboardEvent) => {
    const isMod = event.metaKey || event.ctrlKey
    if (isMod && event.key.toLowerCase() === 'j' && isVisible.value && canAiAsk.value) {
      event.preventDefault()
      handleAiAsk()
    }
  }

  watch(
    editor,
    (newEditor) => {
      if (!newEditor) {
        isVisible.value = false
        return
      }

      const updateVisibility = () => {
        isVisible.value = shouldShowButton({ editor: newEditor, hideWhenUnavailable })
      }

      updateVisibility()

      newEditor.on('selectionUpdate', updateVisibility)

      return () => {
        newEditor.off('selectionUpdate', updateVisibility)
      }
    },
    { immediate: true }
  )

  onMounted(() => {
    if (!isMobile.value && editor.value) {
      editor.value.view.dom.addEventListener('keydown', handleKeydown)
    }
  })

  onBeforeUnmount(() => {
    if (editor.value) {
      editor.value.view.dom.removeEventListener('keydown', handleKeydown)
    }
  })

  return {
    isVisible,
    handleAiAsk,
    canAiAsk,
    label: 'Ask AI Assistant',
    shortcutKeys: AI_ASK_SHORTCUT_KEY,
    Icon: markRaw(AiSparklesIcon),
  }
}
