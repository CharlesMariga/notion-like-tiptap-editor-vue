import { ref, onMounted, onUnmounted } from 'vue'

export function useIsMobile(breakpoint = 768) {
  const isMobile = ref<boolean>(false)

  let mql: MediaQueryList | null = null

  const onChange = () => {
    isMobile.value = window.innerWidth < breakpoint
  }

  onMounted(() => {
    mql = window.matchMedia(`(max-width: ${breakpoint - 1}px)`)
    mql.addEventListener('change', onChange)
    onChange()
  })

  onUnmounted(() => {
    if (mql) {
      mql.removeEventListener('change', onChange)
    }
  })

  return isMobile
}

// Alias export for compatibility
export const useMobile = useIsMobile
