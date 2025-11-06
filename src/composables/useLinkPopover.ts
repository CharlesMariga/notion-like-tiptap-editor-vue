import { ref, watch, computed, markRaw } from 'vue'
import type { Editor } from '@tiptap/vue-3'
import { useTiptapEditor } from '@/composables/useTiptapEditor'
import { isMarkInSchema, sanitizeUrl } from '@/lib/tiptap-utils'
import LinkIcon from '@/components/tiptap-icons/LinkIcon.vue'

/**
 * Configuration for the link popover functionality
 */
export interface UseLinkPopoverConfig {
  /**
   * The Tiptap editor instance.
   */
  editor?: Editor | null
  /**
   * Whether to hide the link popover when not available.
   * @default false
   */
  hideWhenUnavailable?: boolean
  /**
   * Callback function called when the link is set.
   */
  onSetLink?: () => void
}

/**
 * Configuration for the link handler functionality
 */
export interface LinkHandlerProps {
  /**
   * The Tiptap editor instance.
   */
  editor: Editor | null
  /**
   * Callback function called when the link is set.
   */
  onSetLink?: () => void
}

/**
 * Checks if a link can be set in the current editor state
 */
export function canSetLink(editor: Editor | null): boolean {
  if (!editor || !editor.isEditable) return false
  return editor.can().setMark('link')
}

/**
 * Checks if a link is currently active in the editor
 */
export function isLinkActive(editor: Editor | null): boolean {
  if (!editor || !editor.isEditable) return false
  return editor.isActive('link')
}

/**
 * Determines if the link button should be shown
 */
export function shouldShowLinkButton(props: {
  editor: Editor | null
  hideWhenUnavailable: boolean
}): boolean {
  const { editor, hideWhenUnavailable } = props

  const linkInSchema = isMarkInSchema('link', editor)

  if (!linkInSchema || !editor) {
    return false
  }

  if (hideWhenUnavailable && !editor.isActive('code')) {
    return canSetLink(editor)
  }

  return true
}

/**
 * Vue composable for handling link operations in a Tiptap editor
 */
export function useLinkHandler(props: LinkHandlerProps) {
  const { editor, onSetLink } = props
  const url = ref<string | null>(null)

  // Get URL immediately when editor changes
  watch(
    () => editor,
    (newEditor) => {
      if (!newEditor) return

      const { href } = newEditor.getAttributes('link')

      if (isLinkActive(newEditor) && url.value === null) {
        url.value = href || ''
      }
    },
    { immediate: true }
  )

  // Update link state on selection changes
  watch(
    () => editor,
    (newEditor) => {
      if (!newEditor) return

      const updateLinkState = () => {
        const { href } = newEditor.getAttributes('link')
        url.value = href || ''
      }

      newEditor.on('selectionUpdate', updateLinkState)
      return () => {
        newEditor.off('selectionUpdate', updateLinkState)
      }
    },
    { immediate: true }
  )

  const setLink = () => {
    if (!url.value || !editor) return

    const { selection } = editor.state
    const isEmpty = selection.empty

    let chain = editor.chain().focus()

    chain = chain.extendMarkRange('link').setLink({ href: url.value })

    if (isEmpty) {
      chain = chain.insertContent({ type: 'text', text: url.value })
    }

    chain.run()

    url.value = null

    onSetLink?.()
  }

  const removeLink = () => {
    if (!editor) return
    editor
      .chain()
      .focus()
      .extendMarkRange('link')
      .unsetLink()
      .setMeta('preventAutolink', true)
      .run()
    url.value = ''
  }

  const openLink = (
    target: string = '_blank',
    features: string = 'noopener,noreferrer'
  ) => {
    if (!url.value) return

    const safeUrl = sanitizeUrl(url.value, window.location.href)
    if (safeUrl !== '#') {
      window.open(safeUrl, target, features)
    }
  }

  return {
    url: computed(() => url.value || ''),
    setUrl: (newUrl: string) => {
      url.value = newUrl
    },
    setLink,
    removeLink,
    openLink,
  }
}

/**
 * Vue composable for link popover state management
 */
export function useLinkState(props: {
  editor: Editor | null
  hideWhenUnavailable: boolean
}) {
  const { editor, hideWhenUnavailable = false } = props

  const canSet = computed(() => canSetLink(editor))
  const isActive = computed(() => isLinkActive(editor))

  const isVisible = ref(false)

  watch(
    () => editor,
    (newEditor) => {
      if (!newEditor) return

      const handleSelectionUpdate = () => {
        isVisible.value = shouldShowLinkButton({
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

  return {
    isVisible,
    canSet,
    isActive,
  }
}

/**
 * Main composable that provides link popover functionality for Tiptap editor
 */
export function useLinkPopover(config?: UseLinkPopoverConfig) {
  const {
    editor: providedEditor,
    hideWhenUnavailable = false,
    onSetLink,
  } = config || {}

  const { editor } = useTiptapEditor(providedEditor)

  const { isVisible, canSet, isActive } = useLinkState({
    editor: editor.value,
    hideWhenUnavailable,
  })

  const linkHandler = useLinkHandler({
    editor: editor.value,
    onSetLink,
  })

  return {
    isVisible,
    canSet,
    isActive,
    label: 'Link',
    Icon: markRaw(LinkIcon),
    ...linkHandler,
  }
}
