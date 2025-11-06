import { ref, type Ref } from 'vue'
import type {
  ContextMenuAnchor,
  UseContextMenuReturn,
  UseMenuStoreReturn,
} from './menu-types'

export function useComboboxValueState(): readonly [Ref<string>, (value: string) => void] {
  const searchValue = ref('')

  const setValue = (value: string) => {
    searchValue.value = value
  }

  return [searchValue, setValue] as const
}

export function useMenuPlacement(): Ref<string> {
  // In Vue, we'll use a simple ref. The actual placement will be handled by Radix Vue
  return ref('bottom')
}

export function useContextMenu(anchorRect: ContextMenuAnchor): UseContextMenuReturn {
  const open = ref(false)

  const getAnchorRect = () => anchorRect

  const show = () => {
    open.value = true
  }

  return {
    getAnchorRect,
    show,
    open: open.value,
  }
}

export function useFloatingMenuStore(): UseMenuStoreReturn {
  const open = ref(false)
  const anchorElement = ref<HTMLElement | null>(null)

  const show = (element: HTMLElement) => {
    anchorElement.value = element
    open.value = true
  }

  return {
    show,
    open: open.value,
  }
}

export function useMenuItemClick(preventClose?: boolean) {
  return (event: MouseEvent) => {
    const target = event.currentTarget as HTMLElement
    const expandable = target.hasAttribute('aria-expanded')

    if (expandable || preventClose) {
      return false
    }

    // The menu will be closed by the parent component
    return false
  }
}
