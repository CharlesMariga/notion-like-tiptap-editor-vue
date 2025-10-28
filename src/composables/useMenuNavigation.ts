import { ref, watch, onMounted, onUnmounted, computed, type Ref } from "vue";
import type { Editor } from "@tiptap/vue-3";

type Orientation = "horizontal" | "vertical" | "both";

interface MenuNavigationOptions<T> {
  /**
   * The Tiptap editor instance, if using with a Tiptap editor.
   */
  editor?: Editor | null;
  /**
   * Reference to the container element for handling keyboard events.
   */
  containerRef?: Ref<HTMLElement | null>;
  /**
   * Search query that affects the selected item.
   */
  query?: string;
  /**
   * Array of items to navigate through.
   */
  items: T[];
  /**
   * Callback fired when an item is selected.
   */
  onSelect?: (item: T) => void;
  /**
   * Callback fired when the menu should close.
   */
  onClose?: () => void;
  /**
   * The navigation orientation of the menu.
   * @default "vertical"
   */
  orientation?: Orientation;
  /**
   * Whether to automatically select the first item when the menu opens.
   * @default true
   */
  autoSelectFirstItem?: boolean;
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
  editor,
  containerRef,
  query,
  items,
  onSelect,
  onClose,
  orientation = "vertical",
  autoSelectFirstItem = true,
}: MenuNavigationOptions<T>) {
  const selectedIndex = ref<number>(autoSelectFirstItem ? 0 : -1);

  const moveNext = () => {
    if (selectedIndex.value === -1) {
      selectedIndex.value = 0;
    } else {
      selectedIndex.value = (selectedIndex.value + 1) % items.length;
    }
  };

  const movePrev = () => {
    if (selectedIndex.value === -1) {
      selectedIndex.value = items.length - 1;
    } else {
      selectedIndex.value =
        (selectedIndex.value - 1 + items.length) % items.length;
    }
  };

  const handleKeyboardNavigation = (event: KeyboardEvent) => {
    if (!items.length) return false;

    switch (event.key) {
      case "ArrowUp": {
        if (orientation === "horizontal") return false;
        event.preventDefault();
        movePrev();
        return true;
      }

      case "ArrowDown": {
        if (orientation === "horizontal") return false;
        event.preventDefault();
        moveNext();
        return true;
      }

      case "ArrowLeft": {
        if (orientation === "vertical") return false;
        event.preventDefault();
        movePrev();
        return true;
      }

      case "ArrowRight": {
        if (orientation === "vertical") return false;
        event.preventDefault();
        moveNext();
        return true;
      }

      case "Tab": {
        event.preventDefault();
        if (event.shiftKey) {
          movePrev();
        } else {
          moveNext();
        }
        return true;
      }

      case "Home": {
        event.preventDefault();
        selectedIndex.value = 0;
        return true;
      }

      case "End": {
        event.preventDefault();
        selectedIndex.value = items.length - 1;
        return true;
      }

      case "Enter": {
        if ((event as any).isComposing) return false;
        event.preventDefault();
        const selectedItem = items[selectedIndex.value];
        if (selectedIndex.value !== -1 && selectedItem !== undefined) {
          onSelect?.(selectedItem);
        }
        return true;
      }

      case "Escape": {
        event.preventDefault();
        onClose?.();
        return true;
      }

      default:
        return false;
    }
  };

  // Set up event listener
  let targetElement: HTMLElement | null = null;

  onMounted(() => {
    if (editor) {
      targetElement = editor.view.dom;
    } else if (containerRef?.value) {
      targetElement = containerRef.value;
    }

    if (targetElement) {
      targetElement.addEventListener("keydown", handleKeyboardNavigation, true);
    }
  });

  onUnmounted(() => {
    if (targetElement) {
      targetElement.removeEventListener(
        "keydown",
        handleKeyboardNavigation,
        true
      );
    }
  });

  // Reset selected index when query changes
  watch(
    () => query,
    (newQuery) => {
      if (newQuery !== undefined) {
        selectedIndex.value = autoSelectFirstItem ? 0 : -1;
      }
    }
  );

  // Computed value that returns undefined if no items
  const computedSelectedIndex = computed(() =>
    items.length ? selectedIndex.value : undefined
  );

  return {
    selectedIndex: computedSelectedIndex,
    setSelectedIndex: (index: number) => {
      selectedIndex.value = index;
    },
  };
}
