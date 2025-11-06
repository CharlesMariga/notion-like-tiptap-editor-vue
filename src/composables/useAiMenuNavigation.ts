import { ref, onMounted, onBeforeUnmount, type Ref } from 'vue'

interface UseAiMenuNavigationOptions {
  isOpen: Ref<boolean>
  onSelect: (index: number) => void
  itemCount: Ref<number>
}

export function useAiMenuNavigation({
  isOpen,
  onSelect,
  itemCount,
}: UseAiMenuNavigationOptions) {
  const activeIndex = ref<number>(-1)

  const handleKeyDown = (event: KeyboardEvent) => {
    if (!isOpen.value) return

    switch (event.key) {
      case 'ArrowDown':
        event.preventDefault()
        activeIndex.value = activeIndex.value < itemCount.value - 1
          ? activeIndex.value + 1
          : 0
        break

      case 'ArrowUp':
        event.preventDefault()
        activeIndex.value = activeIndex.value > 0
          ? activeIndex.value - 1
          : itemCount.value - 1
        break

      case 'Enter':
        event.preventDefault()
        if (activeIndex.value >= 0 && activeIndex.value < itemCount.value) {
          onSelect(activeIndex.value)
        }
        break

      case 'Escape':
        event.preventDefault()
        activeIndex.value = -1
        break
    }
  }

  onMounted(() => {
    document.addEventListener('keydown', handleKeyDown)
  })

  onBeforeUnmount(() => {
    document.removeEventListener('keydown', handleKeyDown)
  })

  // Reset active index when menu closes
  const resetActiveIndex = () => {
    activeIndex.value = -1
  }

  return {
    activeIndex,
    resetActiveIndex,
  }
}
