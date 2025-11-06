import { ref, onMounted, onUnmounted, computed, markRaw } from 'vue'
import type { Editor } from '@tiptap/vue-3'
import type { Node } from '@tiptap/pm/model'

// --- Composables ---
import { useTiptapEditor } from '@/composables/useTiptapEditor'
import { useIsMobile } from '@/composables/useIsMobile'

// --- Utils ---
import {
  getAnchorNodeAndPos,
  getEditorExtension,
} from '@/lib/tiptap-advanced-utils'

// --- Icons ---
import LinkIcon from '@/components/tiptap-icons/LinkIcon.vue'

export const COPY_ANCHOR_LINK_SHORTCUT_KEY = 'mod+ctrl+l'

/**
 * Configuration for the copy anchor link functionality
 */
export interface UseCopyAnchorLinkConfig {
  /**
   * The Tiptap editor instance.
   */
  editor?: Editor | null
  /**
   * Whether the button should hide when no node ID is available.
   * @default false
   */
  hideWhenUnavailable?: boolean
  /**
   * Called when the copy operation finishes.
   * Provides a boolean indicating whether a node ID was found.
   */
  onNodeIdNotFound?: (found: boolean) => void
  /**
   * Called after the node ID is extracted.
   * Provides the extracted node ID, or null if none found.
   */
  onExtractedNodeId?: (nodeId: string | null) => void
  /**
   * Callback function called after a successful copy operation.
   */
  onCopied?: () => void
}

/**
 * Validates if editor is ready for operations
 */
function isEditorReady(editor: Editor | null): boolean {
  return !!(editor && editor.isEditable)
}

/**
 * Gets the attribute name for unique IDs from the editor extension
 */
function getAttributeName(editor: Editor): string {
  const ext = getEditorExtension(editor, 'uniqueID')
  return ext?.options?.attributeName || 'data-id'
}

/**
 * Comprehensive node info retrieval with validation
 */
function getNodeWithId(editor: Editor | null): {
  node: Node
  nodeId: string | null
  hasNodeId: boolean
} | null {
  if (!isEditorReady(editor)) return null

  const nodeInfo = getAnchorNodeAndPos(editor!)
  if (!nodeInfo) return null

  const attributeName = getAttributeName(editor!)
  const nodeId = extractNodeId(nodeInfo.node, attributeName)

  return {
    node: nodeInfo.node,
    nodeId,
    hasNodeId: nodeId !== null,
  }
}

/**
 * Extracts the data-id from a node
 */
export function extractNodeId(
  node: Node | null,
  attributeName: string
): string | null {
  if (!node?.attrs?.[attributeName]) return null

  try {
    return node.attrs[attributeName]
  } catch {
    return null
  }
}

/**
 * Checks if a node has a data-id that can be copied
 */
export function canCopyAnchorLink(editor: Editor | null): boolean {
  const nodeWithId = getNodeWithId(editor)
  return nodeWithId?.hasNodeId ?? false
}

/**
 * Extracts and copies the node ID to clipboard with full URL like Notion
 */
export async function copyNodeId(
  editor: Editor | null,
  onExtractedNodeId?: (nodeId: string | null) => void,
  onNodeIdNotFound?: (found: boolean) => void
): Promise<boolean> {
  const nodeWithId = getNodeWithId(editor)

  if (!nodeWithId) return false

  const { nodeId, hasNodeId } = nodeWithId

  onExtractedNodeId?.(nodeId)
  onNodeIdNotFound?.(!hasNodeId)

  if (!hasNodeId || !nodeId) return false

  try {
    const currentUrl = new URL(window.location.href)

    currentUrl.searchParams.set('source', 'copy_link')
    currentUrl.hash = nodeId

    await navigator.clipboard.writeText(currentUrl.toString())
    return true
  } catch (err) {
    console.error('Failed to copy node ID to clipboard:', err)
    return false
  }
}

/**
 * Determines if the copy anchor link button should be shown
 */
export function shouldShowButton(props: {
  editor: Editor | null
  hideWhenUnavailable: boolean
}): boolean {
  const { editor, hideWhenUnavailable } = props

  if (!isEditorReady(editor)) return false

  const hasNode = !!getAnchorNodeAndPos(editor!)

  if (!hideWhenUnavailable) return hasNode

  return canCopyAnchorLink(editor)
}

/**
 * Custom composable that provides copy anchor link functionality for Tiptap editor
 *
 * @example
 * ```vue
 * // Simple usage - no params needed
 * <script setup>
 * const { isVisible, handleCopyAnchorLink } = useCopyAnchorLink()
 * </script>
 *
 * <template>
 *   <button v-if="isVisible" @click="handleCopyAnchorLink">Copy Link</button>
 * </template>
 *
 * // Advanced usage with configuration
 * <script setup>
 * const { isVisible, handleCopyAnchorLink, label } = useCopyAnchorLink({
 *   editor: myEditor,
 *   hideWhenUnavailable: true,
 *   onCopied: () => console.log('Link copied!')
 * })
 * </script>
 *
 * <template>
 *   <MyButton
 *     v-if="isVisible"
 *     @click="handleCopyAnchorLink"
 *     :aria-label="label"
 *   >
 *     Copy Anchor Link
 *   </MyButton>
 * </template>
 * ```
 */
export function useCopyAnchorLink(config?: UseCopyAnchorLinkConfig) {
  const {
    editor: providedEditor,
    hideWhenUnavailable = false,
    onNodeIdNotFound,
    onExtractedNodeId,
    onCopied,
  } = config || {}

  const { editor } = useTiptapEditor(providedEditor)
  const isMobile = useIsMobile()
  const isVisible = ref<boolean>(true)
  const canCopyAnchor = computed(() => canCopyAnchorLink(editor.value))

  // Cleanup array
  const cleanup: Array<() => void> = []

  const handleCopyAnchorLink = async () => {
    const success = await copyNodeId(
      editor.value,
      onExtractedNodeId,
      onNodeIdNotFound
    )

    if (success) {
      onCopied?.()
    }

    return success
  }

  const handleKeyboard = (event: KeyboardEvent) => {
    // Check for mod+ctrl+l (Mac: Cmd+Ctrl+L, Windows/Linux: Ctrl+Alt+L)
    const isMod = event.metaKey || event.ctrlKey
    const isCtrl = event.ctrlKey || event.altKey

    if (isMod && isCtrl && event.key.toLowerCase() === 'l') {
      if (isVisible.value && canCopyAnchor.value) {
        event.preventDefault()
        handleCopyAnchorLink()
      }
    }
  }

  onMounted(() => {
    if (!editor.value) return

    const handleSelectionUpdate = () => {
      isVisible.value = shouldShowButton({ editor: editor.value, hideWhenUnavailable })
    }

    handleSelectionUpdate()

    editor.value.on('selectionUpdate', handleSelectionUpdate)
    cleanup.push(() => editor.value?.off('selectionUpdate', handleSelectionUpdate))

    // Register keyboard shortcut
    if (!isMobile) {
      window.addEventListener('keydown', handleKeyboard)
      cleanup.push(() => window.removeEventListener('keydown', handleKeyboard))
    }
  })

  onUnmounted(() => {
    cleanup.forEach(fn => fn())
  })

  return {
    isVisible,
    handleCopyAnchorLink,
    canCopyAnchorLink: canCopyAnchor,
    label: 'Copy anchor link',
    shortcutKeys: COPY_ANCHOR_LINK_SHORTCUT_KEY,
    Icon: markRaw(LinkIcon),
  }
}
