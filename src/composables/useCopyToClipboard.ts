import { computed, ref, watch, onMounted, onBeforeUnmount, markRaw } from 'vue'
import type { Editor } from '@tiptap/vue-3'
import type { Transaction } from '@tiptap/pm/state'
import { TextSelection } from '@tiptap/pm/state'
import { Fragment, Slice } from '@tiptap/pm/model'
import { useTiptapEditor } from '@/composables/useTiptapEditor'
import { useIsMobile } from '@/composables/useMobile'
import ClipboardIcon from '@/components/tiptap-icons/ClipboardIcon.vue'

export const COPY_TO_CLIPBOARD_SHORTCUT_KEY = 'mod+c'

/**
 * Configuration for the copy to clipboard functionality
 */
export interface UseCopyToClipboardConfig {
  /**
   * The Tiptap editor instance.
   */
  editor?: Editor | null
  /**
   * Whether to copy the text with formatting (default: true)
   * When true, attempts to copy HTML format to clipboard
   */
  copyWithFormatting?: boolean
  /**
   * Whether the button should hide when copying is not available.
   * @default false
   */
  hideWhenUnavailable?: boolean
  /**
   * Callback function called after a successful copy operation.
   */
  onCopied?: () => void
}

/**
 * Writes text and optional HTML content to the clipboard
 * @param textContent The plain text content to write
 * @param htmlContent Optional HTML content to write
 * @returns Promise that resolves when the content is successfully written
 */
export async function writeToClipboard(
  textContent: string,
  htmlContent?: string
): Promise<void> {
  try {
    if (htmlContent && navigator.clipboard && 'write' in navigator.clipboard) {
      const blob = new Blob([htmlContent], { type: 'text/html' })
      const clipboardItem = new ClipboardItem({ 'text/html': blob })
      await navigator.clipboard.write([clipboardItem])
    }
  } catch {
    await navigator.clipboard.writeText(textContent)
  }
}

/**
 * Checks if content can be copied in the current editor state
 */
export function canCopyContent(tr: Transaction): boolean {
  const { selection } = tr
  const { empty } = selection

  if (empty) return false

  return true
}

/**
 * Checks if formatting can be reset for a node
 */
export function canCopyToClipboard(editor: Editor | null): boolean {
  if (!editor || !editor.isEditable) return false

  const tr = editor.state.tr
  return canCopyContent(tr)
}

/**
 * Helper function to extract content from selection or document
 */
export function extractContent(
  editor: Editor,
  copyWithFormatting: boolean = true
): { textContent: string; htmlContent?: string } {
  const { selection } = editor.state
  const { $anchor } = selection

  let content = selection.content()

  if (selection.empty || selection instanceof TextSelection) {
    const node = $anchor.node(1)

    // We dont want to use node.content here because we dont want tiptap to split the node
    // We want the whole node as a slice
    content = new Slice(Fragment.from(node), 0, 0)
  }

  const textContent = content.content.textBetween(0, content.content.size, '\n')
  const htmlContent = copyWithFormatting
    ? editor.view.serializeForClipboard(content).dom.innerHTML
    : undefined

  return { textContent, htmlContent }
}

/**
 * Copies content to clipboard
 */
export async function copyToClipboard(
  editor: Editor | null,
  copyWithFormatting: boolean = true
): Promise<boolean> {
  if (!editor || !editor.isEditable) return false

  try {
    const { textContent, htmlContent } = extractContent(
      editor,
      copyWithFormatting
    )

    await writeToClipboard(textContent, htmlContent)
    return true
  } catch {
    return false
  }
}

/**
 * Determines if the copy to clipboard button should be shown
 */
export function shouldShowButton(props: {
  editor: Editor | null
  hideWhenUnavailable: boolean
}): boolean {
  const { editor, hideWhenUnavailable } = props

  if (!editor || !editor.isEditable) return false

  if (hideWhenUnavailable && !editor.isActive('code')) {
    return canCopyToClipboard(editor)
  }

  return true
}

/**
 * Vue composable that provides copy to clipboard functionality for Tiptap editor
 *
 * @example
 * ```ts
 * // Simple usage - no params needed
 * function MySimpleCopyButton() {
 *   const { isVisible, handleCopyToClipboard } = useCopyToClipboard()
 *
 *   if (!isVisible) return null
 *
 *   return <button onClick={handleCopyToClipboard}>Copy</button>
 * }
 *
 * // Advanced usage with configuration
 * function MyAdvancedCopyButton() {
 *   const { isVisible, handleCopyToClipboard, label } = useCopyToClipboard({
 *     editor: myEditor,
 *     copyWithFormatting: false,
 *     hideWhenUnavailable: true,
 *     onCopied: () => console.log('Content copied!')
 *   })
 *
 *   if (!isVisible) return null
 *
 *   return (
 *     <MyButton
 *       onClick={handleCopyToClipboard}
 *       aria-label={label}
 *     >
 *       Copy Content
 *     </MyButton>
 *   )
 * }
 * ```
 */
export function useCopyToClipboard(config?: UseCopyToClipboardConfig) {
  const {
    editor: providedEditor,
    copyWithFormatting = true,
    hideWhenUnavailable = false,
    onCopied,
  } = config || {}

  const { editor } = useTiptapEditor(providedEditor)
  const isMobile = useIsMobile()
  const isVisible = ref<boolean>(true)
  const canCopyToClipboardState = computed(() => canCopyToClipboard(editor.value))

  watch(
    editor,
    (newEditor) => {
      if (!newEditor) return

      const handleSelectionUpdate = () => {
        isVisible.value = shouldShowButton({
          editor: newEditor,
          hideWhenUnavailable,
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

  const handleCopyToClipboard = async () => {
    if (!editor.value) return false

    const success = await copyToClipboard(editor.value, copyWithFormatting)

    if (success) {
      onCopied?.()
    }

    return success
  }

  // Keyboard shortcut handler (Cmd/Ctrl+C)
  const handleKeydown = async (event: KeyboardEvent) => {
    const isMod = event.metaKey || event.ctrlKey
    if (
      event.key === 'c' &&
      isMod &&
      isVisible.value &&
      canCopyToClipboardState.value
    ) {
      event.preventDefault() // prevent native copy behavior
      await handleCopyToClipboard()
    }
  }

  let targetElement: HTMLElement | null = null

  onMounted(() => {
    const currentEditor = editor.value
    if (!currentEditor || isMobile.value) return

    if (currentEditor.view) {
      targetElement = currentEditor.view.dom as HTMLElement
      targetElement.addEventListener('keydown', handleKeydown, true)
    }
  })

  onBeforeUnmount(() => {
    if (targetElement) {
      targetElement.removeEventListener('keydown', handleKeydown, true)
    }
  })

  return {
    isVisible,
    handleCopyToClipboard,
    canCopyToClipboard: canCopyToClipboardState,
    label: 'Copy to clipboard',
    shortcutKeys: COPY_TO_CLIPBOARD_SHORTCUT_KEY,
    Icon: markRaw(ClipboardIcon),
  }
}
