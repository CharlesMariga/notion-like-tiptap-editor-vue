import { onMounted, onUnmounted } from 'vue'
import type { Editor } from '@tiptap/vue-3'
import { useTiptapEditor } from '@/composables/useTiptapEditor'
import { getEditorExtension } from '@/lib/tiptap-advanced-utils'
import { selectNodeAndHideFloating } from '@/composables/useFloatingToolbarVisibility'

export interface UseScrollToHashConfig {
  /**
   * The Tiptap editor instance.
   */
  editor?: Editor | null
  /**
   * Callback called when the target node is found.
   * @param nodeId The ID of the found node
   */
  onTargetFound?: (nodeId: string) => void
  /**
   * Callback called when the target node is not found.
   * @param hash The hash that was attempted to be scrolled to
   */
  onTargetNotFound?: (hash: string) => void
}

/**
 * Composable to scroll to a specific hash in the Tiptap editor.
 * It finds the node with the given ID and scrolls it into view.
 *
 * @param config Configuration for the scroll behavior
 * @returns Function to scroll to a specific hash
 */
export function useScrollToHash(config: UseScrollToHashConfig = {}) {
  const {
    editor: providedEditor,
    onTargetFound = () => {},
    onTargetNotFound = () => {},
  } = config

  const { editor } = useTiptapEditor(providedEditor)

  // Cleanup array
  const cleanup: Array<() => void> = []

  const scrollToNode = (id: string): boolean => {
    if (!editor.value) return false

    const attributeName =
      getEditorExtension(editor.value, 'uniqueID')?.options?.attributeName ??
      'data-id'
    let position: number | null = null

    editor.value.state.doc.descendants((node, pos) => {
      if (node.attrs?.[attributeName] === id) {
        position = pos
        return false
      }
      return true
    })

    if (position === null) return false

    selectNodeAndHideFloating(editor.value, position)

    setTimeout(() => {
      if (!editor.value) return
      const dom = editor.value.view.nodeDOM(position!) as HTMLElement | null

      if (dom) {
        dom.scrollIntoView({ behavior: 'smooth', block: 'center' })
      }
    }, 0)

    return true
  }

  const handleScroll = (delay = 0) => {
    const hash = window.location.hash?.substring(1)
    if (!hash) return

    setTimeout(() => {
      if (scrollToNode(hash)) {
        onTargetFound(hash)
      } else {
        onTargetNotFound(hash)
      }
    }, delay)
  }

  onMounted(() => {
    if (!editor.value) return

    // Handle collaboration sync or immediate scroll
    const provider = editor.value.extensionManager.extensions.find(
      (ext) => ext.name === 'collaborationCaret'
    )?.options?.provider

    if (provider?.on) {
      const syncHandler = () => handleScroll(500)
      provider.on('synced', syncHandler)

      cleanup.push(() => {
        provider.off?.('synced', syncHandler)
      })
    } else {
      handleScroll(500)
    }

    // Window event listeners
    const immediateScroll = () => handleScroll()
    const delayedScroll = () => handleScroll(500)

    window.addEventListener('hashchange', immediateScroll)
    window.addEventListener('pageshow', delayedScroll)
    window.addEventListener('popstate', immediateScroll)

    cleanup.push(() => {
      window.removeEventListener('hashchange', immediateScroll)
      window.removeEventListener('pageshow', delayedScroll)
      window.removeEventListener('popstate', immediateScroll)
    })
  })

  onUnmounted(() => {
    cleanup.forEach(fn => fn())
  })

  return { scrollToHash: scrollToNode }
}
