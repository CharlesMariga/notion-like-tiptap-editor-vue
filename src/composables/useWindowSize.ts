import { ref, onMounted, onUnmounted } from 'vue'
import { useThrottledCallback } from './useThrottledCallback'

export interface WindowSizeState {
  /**
   * The width of the window's visual viewport in pixels.
   */
  width: number
  /**
   * The height of the window's visual viewport in pixels.
   */
  height: number
  /**
   * The distance from the top of the visual viewport to the top of the layout viewport.
   * Particularly useful for handling mobile keyboard appearance.
   */
  offsetTop: number
  /**
   * The distance from the left of the visual viewport to the left of the layout viewport.
   */
  offsetLeft: number
  /**
   * The scale factor of the visual viewport.
   * This is useful for scaling elements based on the current zoom level.
   */
  scale: number
}

/**
 * Composable that tracks the window's visual viewport dimensions, position, and provides
 * a CSS transform for positioning elements.
 *
 * Uses the Visual Viewport API to get accurate measurements, especially important
 * for mobile devices where virtual keyboards can change the visible area.
 * Only updates state when values actually change to optimize performance.
 *
 * @returns A reactive object containing viewport properties
 */
export function useWindowSize() {
  const windowSize = ref<WindowSizeState>({
    width: 0,
    height: 0,
    offsetTop: 0,
    offsetLeft: 0,
    scale: 0,
  })

  const handleViewportChange = useThrottledCallback(() => {
    if (typeof window === 'undefined') return

    const vp = window.visualViewport
    if (!vp) return

    const {
      width = 0,
      height = 0,
      offsetTop = 0,
      offsetLeft = 0,
      scale = 0,
    } = vp

    const prevState = windowSize.value

    // Only update if values have changed
    if (
      width === prevState.width &&
      height === prevState.height &&
      offsetTop === prevState.offsetTop &&
      offsetLeft === prevState.offsetLeft &&
      scale === prevState.scale
    ) {
      return
    }

    windowSize.value = { width, height, offsetTop, offsetLeft, scale }
  }, 200)

  onMounted(() => {
    const visualViewport = window.visualViewport
    if (!visualViewport) return

    visualViewport.addEventListener('resize', handleViewportChange)
    handleViewportChange()
  })

  onUnmounted(() => {
    const visualViewport = window.visualViewport
    if (!visualViewport) return

    visualViewport.removeEventListener('resize', handleViewportChange)
    handleViewportChange.cancel()
  })

  return windowSize
}
