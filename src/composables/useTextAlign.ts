import { computed, ref, watch, type Component, markRaw } from 'vue'
import type { ChainedCommands, Editor } from '@tiptap/vue-3'
import { useTiptapEditor } from '@/composables/useTiptapEditor'
import {
  isExtensionAvailable,
  isNodeTypeSelected,
} from '@/lib/tiptap-utils'
import AlignLeftIcon from '@/components/tiptap-icons/AlignLeftIcon.vue'
import AlignCenterIcon from '@/components/tiptap-icons/AlignCenterIcon.vue'
import AlignRightIcon from '@/components/tiptap-icons/AlignRightIcon.vue'
import AlignJustifyIcon from '@/components/tiptap-icons/AlignJustifyIcon.vue'

export type TextAlign = 'left' | 'center' | 'right' | 'justify'

/**
 * Configuration for the text align functionality
 */
export interface UseTextAlignConfig {
  /**
   * The Tiptap editor instance.
   */
  editor?: Editor | null
  /**
   * The text alignment to apply.
   */
  align: TextAlign
  /**
   * Whether the button should hide when alignment is not available.
   * @default false
   */
  hideWhenUnavailable?: boolean
  /**
   * Callback function called after a successful alignment change.
   */
  onAligned?: () => void
}

export const TEXT_ALIGN_SHORTCUT_KEYS: Record<TextAlign, string> = {
  left: 'mod+shift+l',
  center: 'mod+shift+e',
  right: 'mod+shift+r',
  justify: 'mod+shift+j',
}

export const textAlignIcons: Record<TextAlign, Component> = {
  left: markRaw(AlignLeftIcon),
  center: markRaw(AlignCenterIcon),
  right: markRaw(AlignRightIcon),
  justify: markRaw(AlignJustifyIcon),
}

export const textAlignLabels: Record<TextAlign, string> = {
  left: 'Align left',
  center: 'Align center',
  right: 'Align right',
  justify: 'Align justify',
}

/**
 * Checks if text alignment can be performed in the current editor state
 */
export function canSetTextAlign(
  editor: Editor | null,
  align: TextAlign
): boolean {
  if (!editor || !editor.isEditable) return false
  if (
    !isExtensionAvailable(editor, 'textAlign') ||
    isNodeTypeSelected(editor, ['image', 'horizontalRule'])
  )
    return false

  return editor.can().setTextAlign(align)
}

export function hasSetTextAlign(
  commands: ChainedCommands
): commands is ChainedCommands & {
  setTextAlign: (align: TextAlign) => ChainedCommands
} {
  return 'setTextAlign' in commands
}

/**
 * Checks if the text alignment is currently active
 */
export function isTextAlignActive(
  editor: Editor | null,
  align: TextAlign
): boolean {
  if (!editor || !editor.isEditable) return false
  return editor.isActive({ textAlign: align })
}

/**
 * Sets text alignment in the editor
 */
export function setTextAlign(editor: Editor | null, align: TextAlign): boolean {
  if (!editor || !editor.isEditable) return false
  if (!canSetTextAlign(editor, align)) return false

  const chain = editor.chain().focus()
  if (hasSetTextAlign(chain)) {
    return chain.setTextAlign(align).run()
  }

  return false
}

/**
 * Determines if the text align button should be shown
 */
export function shouldShowButton(props: {
  editor: Editor | null
  hideWhenUnavailable: boolean
  align: TextAlign
}): boolean {
  const { editor, hideWhenUnavailable, align } = props

  if (!editor || !editor.isEditable) return false
  if (!isExtensionAvailable(editor, 'textAlign')) return false

  if (hideWhenUnavailable && !editor.isActive('code')) {
    return canSetTextAlign(editor, align)
  }

  return true
}

/**
 * Vue composable that provides text align functionality for Tiptap editor
 */
export function useTextAlign(config: UseTextAlignConfig) {
  const {
    editor: providedEditor,
    align,
    hideWhenUnavailable = false,
    onAligned,
  } = config

  const { editor } = useTiptapEditor(providedEditor)
  const isVisible = ref<boolean>(true)
  const canAlign = computed(() => canSetTextAlign(editor.value, align))
  const isActive = computed(() => isTextAlignActive(editor.value, align))

  watch(
    editor,
    (newEditor) => {
      if (!newEditor) return

      const handleSelectionUpdate = () => {
        isVisible.value = shouldShowButton({
          editor: newEditor,
          align,
          hideWhenUnavailable
        })
      }

      handleSelectionUpdate()

      newEditor.on('selectionUpdate', handleSelectionUpdate)

      return () => {
        newEditor.off('selectionUpdate', handleSelectionUpdate)
      }
    },
    { immediate: true }
  )

  const handleTextAlign = () => {
    if (!editor.value) return false

    const success = setTextAlign(editor.value, align)
    if (success) {
      onAligned?.()
    }
    return success
  }

  return {
    isVisible,
    isActive,
    handleTextAlign,
    canAlign,
    label: textAlignLabels[align],
    shortcutKeys: TEXT_ALIGN_SHORTCUT_KEYS[align],
    Icon: textAlignIcons[align],
  }
}
