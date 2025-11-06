import { ref, onMounted, onBeforeUnmount, watch, unref, type Ref, type MaybeRef } from 'vue'
import type { Editor } from '@tiptap/vue-3'

type Orientation = 'horizontal' | 'vertical' | 'both'

interface MenuNavigationOptions<T> {
  /**
   * The Tiptap editor instance, if using with a Tiptap editor.
   */
  editor?: MaybeRef<Editor | null>
  /**
   * Reference to the container element for handling keyboard events.
   */
  containerRef?: Ref<HTMLElement | null>
  /**
   * Search query that affects the selected item.
   */
  query?: MaybeRef<string>
  /**
   * Array of items to navigate through.
   */
  items: MaybeRef<T[]>
  /**
   * Callback fired when an item is selected.
   */
  onSelect?: (item: T) => void
  /**
   * Callback fired when the menu should close.
   */
  onClose?: () => void
  /**
   * The navigation orientation of the menu.
   * @default "vertical"
   */
  orientation?: Orientation
  /**
   * Whether to automatically select the first item when the menu opens.
   * @default true
   */
  autoSelectFirstItem?: boolean
}

/**
 * Composable that implements keyboard navigation for dropdown menus and command palettes.
 *
 * Handles arrow keys, tab, home/end, enter for selection, and escape to close.
 * Works with both Tiptap editors and regular DOM elements.
 *
 * @param options - Configuration options for the menu navigation
 * @returns Object containing the selected index and a setter function
 */
export function useMenuNavigation<T>({
  editor: editorOption,
  containerRef,
  query: queryOption,
  items: itemsOption,
  onSelect,
  onClose,
  orientation = 'vertical',
  autoSelectFirstItem = true,
}: MenuNavigationOptions<T>) {
  const selectedIndex = ref<number>(autoSelectFirstItem ? 0 : -1)

  // Normalize editor to a ref
  const editorRef = (editorOption && typeof editorOption === 'object' && 'value' in editorOption)
    ? editorOption as Ref<Editor | null>
    : ref(editorOption || null)

  // Normalize query to a ref
  const queryRef = (queryOption && typeof queryOption === 'object' && 'value' in queryOption)
    ? queryOption as Ref<string>
    : ref(queryOption || '')

  // Normalize items to a ref
  const itemsRef = (itemsOption && typeof itemsOption === 'object' && 'value' in itemsOption)
    ? itemsOption as Ref<T[]>
    : ref(itemsOption || [])

  const handleKeyboardNavigation = (event: KeyboardEvent) => {
    const items = unref(itemsRef)
    if (!items.length) return false

    const moveNext = () => {
      if (selectedIndex.value === -1) {
        selectedIndex.value = 0
      } else {
        selectedIndex.value = (selectedIndex.value + 1) % items.length
      }
    }

    const movePrev = () => {
      if (selectedIndex.value === -1) {
        selectedIndex.value = items.length - 1
      } else {
        selectedIndex.value =
          (selectedIndex.value - 1 + items.length) % items.length
      }
    }

    switch (event.key) {
      case 'ArrowUp': {
        if (orientation === 'horizontal') return false
        event.preventDefault()
        movePrev()
        return true
      }

      case 'ArrowDown': {
        if (orientation === 'horizontal') return false
        event.preventDefault()
        moveNext()
        return true
      }

      case 'ArrowLeft': {
        if (orientation === 'vertical') return false
        event.preventDefault()
        movePrev()
        return true
      }

      case 'ArrowRight': {
        if (orientation === 'vertical') return false
        event.preventDefault()
        moveNext()
        return true
      }

      case 'Tab': {
        event.preventDefault()
        if (event.shiftKey) {
          movePrev()
        } else {
          moveNext()
        }
        return true
      }

      case 'Home': {
        event.preventDefault()
        selectedIndex.value = 0
        return true
      }

      case 'End': {
        event.preventDefault()
        selectedIndex.value = items.length - 1
        return true
      }

      case 'Enter': {
        if (event.isComposing) return false
        event.preventDefault()
        if (selectedIndex.value !== -1 && items[selectedIndex.value]) {
          const item = items[selectedIndex.value] as T
          onSelect?.(item)
        }
        return true
      }

      case 'Escape': {
        event.preventDefault()
        onClose?.()
        return true
      }

      default:
        return false
    }
  }

  let targetElement: HTMLElement | null = null

  const attachListener = () => {
    // Remove old listener if exists
    if (targetElement) {
      targetElement.removeEventListener('keydown', handleKeyboardNavigation, true)
      targetElement = null
    }

    // Attach new listener
    const editor = editorRef.value
    if (editor && editor.view) {
      targetElement = editor.view.dom as HTMLElement
    } else if (containerRef?.value) {
      // Ensure we get the actual DOM element, not a component instance
      const container = containerRef.value
      targetElement = (container instanceof HTMLElement) ? container : (container as any)?.$el
    }

    if (targetElement && targetElement instanceof HTMLElement) {
      targetElement.addEventListener('keydown', handleKeyboardNavigation, true)
    }
  }

  onMounted(() => {
    attachListener()
  })

  // Watch for editor changes and reattach listener
  watch(editorRef, () => {
    attachListener()
  })

  onBeforeUnmount(() => {
    if (targetElement) {
      targetElement.removeEventListener(
        'keydown',
        handleKeyboardNavigation,
        true
      )
    }
  })

  watch(
    queryRef,
    () => {
      if (unref(queryRef)) {
        selectedIndex.value = autoSelectFirstItem ? 0 : -1
      }
    }
  )

  return {
    selectedIndex,
    setSelectedIndex: (index: number) => {
      selectedIndex.value = index
    },
  }
}
