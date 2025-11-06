import type { Component } from 'vue'

export interface Action {
  filterItems?: boolean
  group?: string
  icon?: Component
  items?: Action[]
  keywords?: string[]
  label?: string
  value?: string
}

export interface MenuItemProps {
  group?: string
  name?: string
  parentGroup?: string
  preventClose?: boolean
}

export interface MenuContextValue {
  isRootMenu: boolean
  open: boolean
}

export interface MenuProps {
  trigger?: Component
  value?: string
  open?: boolean
  onOpenChange?: (open: boolean) => void
  onValueChange?: (value: string) => void
  onValuesChange?: (values: Record<string, string>) => void
  placement?: 'top' | 'bottom' | 'left' | 'right'
}

export interface MenuContentProps {
  onClickOutside?: (event: MouseEvent | TouchEvent | FocusEvent) => void
  portal?: boolean
  autoFocusOnHide?: boolean
  preventBodyScroll?: boolean
  side?: 'top' | 'bottom' | 'left' | 'right'
  align?: 'start' | 'center' | 'end'
}

export interface ContextMenuAnchor {
  x: number
  y: number
}

export interface UseContextMenuReturn {
  getAnchorRect: () => ContextMenuAnchor
  show: () => void
  open: boolean
}

export interface UseMenuStoreReturn {
  show: (anchorElement: HTMLElement) => void
  open: boolean
}
