import { ref, watch, onMounted, onUnmounted, computed, markRaw } from 'vue'
import type { Editor } from '@tiptap/vue-3'
import { useTiptapEditor } from './useTiptapEditor'
import { useIsMobile } from './useIsMobile'
import { isExtensionAvailable, isNodeTypeSelected } from '@/lib/tiptap-utils'
import ImagePlusIcon from '@/components/tiptap-icons/ImagePlusIcon.vue'

export const IMAGE_UPLOAD_SHORTCUT_KEY = 'mod+shift+i'

/**
 * Configuration for the image upload functionality
 */
export interface UseImageUploadConfig {
  /**
   * The Tiptap editor instance.
   */
  editor?: Editor | null
  /**
   * Whether the button should hide when insertion is not available.
   * @default false
   */
  hideWhenUnavailable?: boolean
  /**
   * Callback function called after a successful image insertion.
   */
  onInserted?: () => void
}

/**
 * Checks if image can be inserted in the current editor state
 */
export function canInsertImage(editor: Editor | null): boolean {
  if (!editor || !editor.isEditable) return false
  if (
    !isExtensionAvailable(editor, 'imageUpload') ||
    isNodeTypeSelected(editor, ['image'])
  )
    return false

  return editor.can().insertContent({ type: 'imageUpload' })
}

/**
 * Checks if image is currently active
 */
export function isImageActive(editor: Editor | null): boolean {
  if (!editor || !editor.isEditable) return false
  return editor.isActive('imageUpload')
}

/**
 * Inserts an image in the editor
 */
export function insertImage(editor: Editor | null): boolean {
  if (!editor || !editor.isEditable) return false
  if (!canInsertImage(editor)) return false

  try {
    return editor
      .chain()
      .focus()
      .insertContent({
        type: 'imageUpload',
      })
      .run()
  } catch {
    return false
  }
}

/**
 * Determines if the image button should be shown
 */
export function shouldShowButton(props: {
  editor: Editor | null
  hideWhenUnavailable: boolean
}): boolean {
  const { editor, hideWhenUnavailable } = props

  if (!editor || !editor.isEditable) return false
  if (!isExtensionAvailable(editor, 'imageUpload')) return false

  if (hideWhenUnavailable && !editor.isActive('code')) {
    return canInsertImage(editor)
  }

  return true
}

/**
 * Custom composable that provides image functionality for Tiptap editor
 *
 * @example
 * ```ts
 * // Simple usage - no params needed
 * const { isVisible, handleImage } = useImageUpload()
 *
 * // Advanced usage with configuration
 * const { isVisible, handleImage, label, isActive } = useImageUpload({
 *   editor: myEditor,
 *   hideWhenUnavailable: true,
 *   onInserted: () => console.log('Image inserted!')
 * })
 * ```
 */
export function useImageUpload(config?: UseImageUploadConfig) {
  const {
    editor: providedEditor,
    hideWhenUnavailable = false,
    onInserted,
  } = config || {}

  const { editor } = useTiptapEditor(providedEditor)
  const isMobile = useIsMobile()
  const isVisible = ref<boolean>(true)
  const canInsert = computed(() => canInsertImage(editor.value))
  const isActive = computed(() => isImageActive(editor.value))

  const cleanup: (() => void)[] = []

  watch(
    editor,
    (newEditor) => {
      // Clean up previous listeners
      cleanup.forEach((fn) => fn())
      cleanup.length = 0

      if (!newEditor) return

      const handleSelectionUpdate = () => {
        isVisible.value = shouldShowButton({
          editor: newEditor,
          hideWhenUnavailable,
        })
      }

      handleSelectionUpdate()

      newEditor.on('selectionUpdate', handleSelectionUpdate)
      cleanup.push(() => {
        newEditor.off('selectionUpdate', handleSelectionUpdate)
      })
    },
    { immediate: true }
  )

  const handleImage = () => {
    if (!editor.value) return false

    const success = insertImage(editor.value)
    if (success) {
      onInserted?.()
    }
    return success
  }

  // Hotkey support
  onMounted(() => {
    if (typeof window === 'undefined') return

    const handleKeyDown = (event: KeyboardEvent) => {
      // Check for mod+shift+i
      const isMod = event.metaKey || event.ctrlKey
      if (isMod && event.shiftKey && event.key.toLowerCase() === 'i') {
        if (!isVisible.value || !canInsert.value || isMobile) return
        event.preventDefault()
        handleImage()
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    cleanup.push(() => {
      window.removeEventListener('keydown', handleKeyDown)
    })
  })

  onUnmounted(() => {
    cleanup.forEach((fn) => fn())
  })

  return {
    isVisible,
    isActive,
    handleImage,
    canInsert,
    label: 'Add image',
    shortcutKeys: IMAGE_UPLOAD_SHORTCUT_KEY,
    Icon: markRaw(ImagePlusIcon),
  }
}
