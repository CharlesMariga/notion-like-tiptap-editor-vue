import type { Node } from '@tiptap/pm/model'
import type { Editor } from '@tiptap/vue-3'
import type { Component } from 'vue'

export interface DragContextMenuProps {
  editor?: Editor | null
  withSlashCommandTrigger?: boolean
  mobileBreakpoint?: number
}

export interface NodeChangeData {
  node: Node | null
  editor: Editor
  pos: number
}

export interface MenuItemProps {
  icon: Component
  label: string
  onClick: () => void
  disabled?: boolean
  isActive?: boolean
  shortcutBadge?: any
}

export interface MenuActionVisibility {
  hasAnyActionGroups: boolean
  hasColorActions: boolean
  hasTransformActions: boolean
  hasResetFormatting: boolean
  hasImage: boolean
}

export interface ColorMenuItemProps {
  color: { value: string; label: string }
}
