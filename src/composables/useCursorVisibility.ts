import { watch, type Ref } from 'vue'
import type { Editor } from '@tiptap/vue-3'
import { useWindowSize } from './useWindowSize'
import { useBodyRect } from './useElementRect'
import type { RectState } from './useElementRect'

export interface CursorVisibilityOptions {
  /**
   * The Tiptap editor instance
   */
  editor?: Editor | null
  /**
   * Reference to the toolbar element that may obscure the cursor
   */
  overlayHeight?: number
}

/**
 * Custom composable that ensures the cursor remains visible when typing in a Tiptap editor.
 * Automatically scrolls the window when the cursor would be hidden by the toolbar.
 *
 * @param options.editor The Tiptap editor instance
 * @param options.overlayHeight Toolbar height to account for
 * @returns The bounding rect of the body
 */
export function useCursorVisibility({
  editor,
  overlayHeight = 0,
}: CursorVisibilityOptions): Ref<RectState> {
  const windowSize = useWindowSize()
  const rect = useBodyRect({
    enabled: true,
    throttleMs: 100,
    useResizeObserver: true,
  })

  watch(
    () => [editor, overlayHeight, windowSize.value.height, rect.value.height],
    () => {
      const ensureCursorVisibility = () => {
        if (!editor || !editor.state) return

        const { state, view } = editor
        if (!view || !view.hasFocus()) return

        // Get current cursor position coordinates
        const { from } = state.selection
        const cursorCoords = view.coordsAtPos(from)

        if (windowSize.value.height < rect.value.height && cursorCoords) {
          const availableSpace = windowSize.value.height - cursorCoords.top

          // If the cursor is hidden behind the overlay or offscreen, scroll it into view
          if (availableSpace < overlayHeight) {
            const targetCursorY = Math.max(windowSize.value.height / 2, overlayHeight)
            const currentScrollY = window.scrollY
            const cursorAbsoluteY = cursorCoords.top + currentScrollY
            const newScrollY = cursorAbsoluteY - targetCursorY

            window.scrollTo({
              top: Math.max(0, newScrollY),
              behavior: 'smooth',
            })
          }
        }
      }

      ensureCursorVisibility()
    },
    { immediate: true }
  )

  return rect
}
