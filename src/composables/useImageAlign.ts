import { ref, watch, onMounted, onUnmounted, computed, markRaw } from 'vue'
import type { Editor } from '@tiptap/vue-3'
import { useTiptapEditor } from './useTiptapEditor'
import { useIsMobile } from './useIsMobile'
import { isExtensionAvailable } from '@/lib/tiptap-utils'
import AlignCenterVerticalIcon from '@/components/tiptap-icons/AlignCenterVerticalIcon.vue'
import AlignEndVerticalIcon from '@/components/tiptap-icons/AlignEndVerticalIcon.vue'
import AlignStartVerticalIcon from '@/components/tiptap-icons/AlignStartVerticalIcon.vue'

export type ImageAlign = 'left' | 'center' | 'right'

/**
 * Configuration for the image align functionality
 */
export interface UseImageAlignConfig {
  /**
   * The Tiptap editor instance.
   */
  editor?: Editor | null
  /**
   * The image alignment to apply.
   */
  align: ImageAlign
  /**
   * The name of the image extension to target.
   * @default "image"
   */
  extensionName?: string
  /**
   * The attribute name used for alignment.
   * @default "data-align"
   */
  attributeName?: string
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

export const IMAGE_ALIGN_SHORTCUT_KEYS: Record<ImageAlign, string> = {
  left: 'alt+shift+l',
  center: 'alt+shift+e',
  right: 'alt+shift+r',
}

export const imageAlignIcons = {
  left: markRaw(AlignStartVerticalIcon),
  center: markRaw(AlignCenterVerticalIcon),
  right: markRaw(AlignEndVerticalIcon),
}

export const imageAlignLabels: Record<ImageAlign, string> = {
  left: 'Image align left',
  center: 'Image align center',
  right: 'Image align right',
}

/**
 * Checks if image alignment can be performed in the current editor state
 */
export function canSetImageAlign(
  editor: Editor | null,
  align: ImageAlign,
  extensionName: string = 'image',
  attributeName: string = 'data-align'
): boolean {
  if (!editor || !editor.isEditable) return false
  if (!isExtensionAvailable(editor, extensionName)) return false

  return editor
    .can()
    .updateAttributes(extensionName, { [attributeName]: align })
}

/**
 * Checks if the image alignment is currently active
 */
export function isImageAlignActive(
  editor: Editor | null,
  align: ImageAlign,
  extensionName: string = 'image',
  attributeName: string = 'data-align'
): boolean {
  if (!editor || !editor.isEditable) return false
  if (!isExtensionAvailable(editor, extensionName)) return false

  const attributes = editor.getAttributes(extensionName)
  const currentAlign = attributes[attributeName] || 'left'
  return currentAlign === align
}

/**
 * Sets image alignment in the editor
 */
export function setImageAlign(
  editor: Editor | null,
  align: ImageAlign,
  extensionName: string = 'image',
  attributeName: string = 'data-align'
): boolean {
  if (!editor || !editor.isEditable) return false
  if (!isExtensionAvailable(editor, extensionName)) return false
  if (!canSetImageAlign(editor, align, extensionName, attributeName))
    return false

  try {
    return editor
      .chain()
      .focus()
      .updateAttributes(extensionName, { [attributeName]: align })
      .run()
  } catch {
    return false
  }
}

/**
 * Determines if the image align button should be shown
 */
export function shouldShowButton(props: {
  editor: Editor | null
  hideWhenUnavailable: boolean
  align: ImageAlign
  extensionName?: string
  attributeName?: string
}): boolean {
  const {
    editor,
    hideWhenUnavailable,
    align,
    extensionName = 'image',
    attributeName = 'data-align',
  } = props

  if (!editor || !editor.isEditable) return false
  if (!isExtensionAvailable(editor, extensionName)) return false

  if (hideWhenUnavailable) {
    return canSetImageAlign(editor, align, extensionName, attributeName)
  }

  return true
}

/**
 * Custom composable that provides image align functionality for Tiptap editor
 *
 * @example
 * ```ts
 * // Simple usage with default "image" extension
 * const { isVisible, handleImageAlign } = useImageAlign({ align: 'center' })
 *
 * // Advanced usage with custom extension name
 * const { isVisible, handleImageAlign, label, isActive } = useImageAlign({
 *   editor: myEditor,
 *   align: 'right',
 *   extensionName: 'myCustomImage',
 *   hideWhenUnavailable: true,
 *   onAligned: () => console.log('Image aligned!')
 * })
 * ```
 */
export function useImageAlign(config: UseImageAlignConfig) {
  const {
    editor: providedEditor,
    align,
    extensionName = 'image',
    attributeName = 'data-align',
    hideWhenUnavailable = false,
    onAligned,
  } = config

  const { editor } = useTiptapEditor(providedEditor)
  const isMobile = useIsMobile()
  const isVisible = ref<boolean>(true)
  const canAlign = computed(() =>
    canSetImageAlign(editor.value, align, extensionName, attributeName)
  )
  const isActive = computed(() =>
    isImageAlignActive(editor.value, align, extensionName, attributeName)
  )

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
          align,
          hideWhenUnavailable,
          extensionName,
          attributeName,
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

  const handleImageAlign = () => {
    if (!editor.value) return false

    const success = setImageAlign(
      editor.value,
      align,
      extensionName,
      attributeName
    )
    if (success) {
      onAligned?.()
    }
    return success
  }

  // Hotkey support
  onMounted(() => {
    if (typeof window === 'undefined') return

    const handleKeyDown = (event: KeyboardEvent) => {
      const shortcutKey = IMAGE_ALIGN_SHORTCUT_KEYS[align]
      // Parse shortcut: alt+shift+l/e/r
      if (event.altKey && event.shiftKey) {
        const key = event.key.toLowerCase()
        const expectedKey = shortcutKey.split('+').pop()?.toLowerCase()
        if (key === expectedKey) {
          if (!isVisible.value || !canAlign.value || isMobile) return
          event.preventDefault()
          handleImageAlign()
        }
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
    handleImageAlign,
    canAlign,
    label: imageAlignLabels[align],
    shortcutKeys: IMAGE_ALIGN_SHORTCUT_KEYS[align],
    Icon: imageAlignIcons[align],
  }
}
