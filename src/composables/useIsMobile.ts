import { ref, onMounted, onUnmounted } from 'vue'

/**
 * Composable that detects if the current device is mobile based on viewport width
 * @param breakpoint - The breakpoint width in pixels (default: 768)
 * @returns Boolean indicating if the device is mobile
 */
export function useIsMobile(breakpoint = 768) {
  const isMobile = ref<boolean | undefined>(undefined)

  let mediaQueryList: MediaQueryList | null = null
  let cleanup: (() => void) | null = null

  onMounted(() => {
    mediaQueryList = window.matchMedia(`(max-width: ${breakpoint - 1}px)`)

    const onChange = () => {
      isMobile.value = window.innerWidth < breakpoint
    }

    mediaQueryList.addEventListener('change', onChange)
    isMobile.value = window.innerWidth < breakpoint

    cleanup = () => {
      if (mediaQueryList) {
        mediaQueryList.removeEventListener('change', onChange)
      }
    }
  })

  onUnmounted(() => {
    cleanup?.()
  })

  return !!isMobile.value
}
