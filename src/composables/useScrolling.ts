import { ref, onMounted, onBeforeUnmount, type Ref } from 'vue'

type ScrollTarget = Ref<HTMLElement | undefined | null> | Window | null | undefined
type EventTargetWithScroll = Window | HTMLElement | Document

interface UseScrollingOptions {
  debounce?: number
  fallbackToDocument?: boolean
}

export function useScrolling(
  target?: ScrollTarget,
  options: UseScrollingOptions = {}
): Ref<boolean> {
  const { debounce = 150, fallbackToDocument = true } = options
  const isScrolling = ref(false)

  let timeout: ReturnType<typeof setTimeout>
  let eventTarget: EventTargetWithScroll | null = null

  const cleanup = () => {
    if (eventTarget) {
      eventTarget.removeEventListener('scroll', handleScroll)
      if (supportsScrollEnd) {
        eventTarget.removeEventListener('scrollend', handleScrollEnd)
      }
    }
    clearTimeout(timeout)
  }

  const resolveElement = (): EventTargetWithScroll => {
    // Resolve element or window
    const element: EventTargetWithScroll =
      target && typeof Window !== 'undefined' && target instanceof Window
        ? target
        : ((target as Ref<HTMLElement>)?.value ?? window)

    // Mobile: fallback to document when using window
    const resolved: EventTargetWithScroll =
      fallbackToDocument &&
      element === window &&
      typeof document !== 'undefined'
        ? document
        : element

    return resolved
  }

  const supportsScrollEnd = typeof window !== 'undefined' && 'onscrollend' in window

  const handleScroll = () => {
    if (!isScrolling.value) isScrolling.value = true

    if (!supportsScrollEnd) {
      clearTimeout(timeout)
      timeout = setTimeout(() => (isScrolling.value = false), debounce)
    }
  }

  const handleScrollEnd = () => {
    isScrolling.value = false
  }

  onMounted(() => {
    eventTarget = resolveElement()

    eventTarget.addEventListener('scroll', handleScroll, { passive: true })
    if (supportsScrollEnd) {
      eventTarget.addEventListener('scrollend', handleScrollEnd, { passive: true })
    }
  })

  onBeforeUnmount(() => {
    cleanup()
  })

  return isScrolling
}
