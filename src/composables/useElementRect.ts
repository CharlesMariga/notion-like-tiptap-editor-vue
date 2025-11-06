import { ref, watch, onBeforeUnmount, type Ref } from 'vue'
import { useThrottledCallback } from './useThrottledCallback'

export type RectState = Omit<DOMRect, 'toJSON'>

export interface ElementRectOptions {
  /**
   * The element to track. Can be an Element, ref, or selector string.
   * Defaults to document.body if not provided.
   */
  element?: Element | Ref<Element | undefined | null> | string | null
  /**
   * Whether to enable rect tracking
   */
  enabled?: boolean
  /**
   * Throttle delay in milliseconds for rect updates
   */
  throttleMs?: number
  /**
   * Whether to use ResizeObserver for more accurate tracking
   */
  useResizeObserver?: boolean
}

const initialRect: RectState = {
  x: 0,
  y: 0,
  width: 0,
  height: 0,
  top: 0,
  right: 0,
  bottom: 0,
  left: 0,
}

const isSSR = typeof window === 'undefined'
const hasResizeObserver = !isSSR && typeof ResizeObserver !== 'undefined'

/**
 * Helper function to check if code is running on client side
 */
const isClientSide = (): boolean => !isSSR

/**
 * Custom composable that tracks an element's bounding rectangle and updates on resize, scroll, etc.
 *
 * @param options Configuration options for element rect tracking
 * @returns The current bounding rectangle of the element
 */
export function useElementRect({
  element,
  enabled = true,
  throttleMs = 100,
  useResizeObserver: useResizeObserverOption = true,
}: ElementRectOptions = {}) {
  const rect = ref<RectState>(initialRect)

  const getTargetElement = (): Element | null => {
    if (!enabled || !isClientSide()) return null

    if (!element) {
      return document.body
    }

    if (typeof element === 'string') {
      return document.querySelector(element)
    }

    // Check if it's a Vue ref
    if (typeof element === 'object' && 'value' in element) {
      return element.value as Element | null
    }

    return element as Element
  }

  const updateRect = useThrottledCallback(
    () => {
      if (!enabled || !isClientSide()) return

      const targetElement = getTargetElement()
      if (!targetElement) {
        rect.value = initialRect
        return
      }

      const newRect = targetElement.getBoundingClientRect()
      rect.value = {
        x: newRect.x,
        y: newRect.y,
        width: newRect.width,
        height: newRect.height,
        top: newRect.top,
        right: newRect.right,
        bottom: newRect.bottom,
        left: newRect.left,
      }
    },
    throttleMs,
    { leading: true, trailing: true }
  )

  const cleanup: (() => void)[] = []

  const setupTracking = () => {
    // Clear previous cleanup
    cleanup.forEach((fn) => fn())
    cleanup.length = 0

    if (!enabled || !isClientSide()) {
      rect.value = initialRect
      return
    }

    const targetElement = getTargetElement()
    if (!targetElement) return

    updateRect()

    if (useResizeObserverOption && hasResizeObserver) {
      const resizeObserver = new ResizeObserver(() => {
        window.requestAnimationFrame(updateRect)
      })
      resizeObserver.observe(targetElement)
      cleanup.push(() => resizeObserver.disconnect())
    }

    const handleUpdate = () => updateRect()

    window.addEventListener('scroll', handleUpdate, { passive: true })
    window.addEventListener('resize', handleUpdate, { passive: true })

    cleanup.push(() => {
      window.removeEventListener('scroll', handleUpdate)
      window.removeEventListener('resize', handleUpdate)
    })
  }

  // Setup tracking when options change
  watch(
    () => [element, enabled, useResizeObserverOption],
    () => {
      setupTracking()
    },
    { immediate: true }
  )

  onBeforeUnmount(() => {
    cleanup.forEach((fn) => fn())
    rect.value = initialRect
  })

  return rect
}

/**
 * Convenience hook for tracking document.body rect
 */
export function useBodyRect(
  options: Omit<ElementRectOptions, 'element'> = {}
): Ref<RectState> {
  return useElementRect({
    ...options,
    element: isClientSide() ? document.body : null,
  })
}

/**
 * Convenience hook for tracking a ref element's rect
 */
export function useRefRect<T extends Element>(
  elementRef: Ref<T | undefined | null>,
  options: Omit<ElementRectOptions, 'element'> = {}
): Ref<RectState> {
  return useElementRect({ ...options, element: elementRef })
}
