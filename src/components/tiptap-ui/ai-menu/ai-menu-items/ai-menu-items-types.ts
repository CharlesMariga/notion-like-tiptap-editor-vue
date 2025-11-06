import type { TextOptions } from "@tiptap-pro/extension-ai"
import type { Editor } from "@tiptap/vue-3"
import type { Component } from "vue"

export interface MenuActionBase {
  icon: Component
  label: string
  value: string
}

export interface ExecutableMenuAction extends MenuActionBase {
  type: "executable"
  onSelect: (params: {
    editor: Editor | null
    onDone?: () => void
    options?: TextOptions
  }) => void
}

export interface NestedMenuAction extends MenuActionBase {
  type: "nested"
  component: Component
  filterItems?: boolean
  items?: Array<{ label: string; value: string }>
}

export type EditorMenuAction = ExecutableMenuAction | NestedMenuAction

export type MenuActionIdentifier =
  | "adjustTone"
  | "aiFixSpellingAndGrammar"
  | "aiExtend"
  | "aiShorten"
  | "simplifyLanguage"
  | "improveWriting"
  | "emojify"
  | "continueWriting"
  | "summarize"
  | "translateTo"

export interface MenuActionRendererProps {
  menuItem: {
    label: string
    value?: string
    icon?: Component
    filterItems?: boolean
  }
  availableActions: Record<string, EditorMenuAction>
  editor: Editor | null
}
