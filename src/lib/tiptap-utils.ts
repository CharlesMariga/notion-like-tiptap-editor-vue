import type { Editor } from '@tiptap/vue-3'
import type { Node as TiptapNode } from '@tiptap/pm/model'
import { Selection, TextSelection } from '@tiptap/pm/state'
import { uploadImageToSupabase } from './supabase'

export const MAX_FILE_SIZE = 5 * 1024 * 1024 // 5MB

export const MAC_SYMBOLS: Record<string, string> = {
  mod: '⌘',
  command: '⌘',
  meta: '⌘',
  ctrl: '⌃',
  control: '⌃',
  alt: '⌥',
  option: '⌥',
  shift: '⇧',
  backspace: 'Del',
  delete: '⌦',
  enter: '⏎',
  escape: '⎋',
  capslock: '⇪',
} as const

export function cn(
  ...classes: (string | boolean | undefined | null)[]
): string {
  return classes.filter(Boolean).join(' ')
}

/**
 * Determines if the current platform is macOS
 * @returns boolean indicating if the current platform is Mac
 */
export function isMac(): boolean {
  return (
    typeof navigator !== 'undefined' &&
    navigator.platform.toLowerCase().includes('mac')
  )
}

/**
 * Formats a shortcut key based on the platform (Mac or non-Mac)
 * @param key - The key to format (e.g., "ctrl", "alt", "shift")
 * @param isMac - Boolean indicating if the platform is Mac
 * @param capitalize - Whether to capitalize the key (default: true)
 * @returns Formatted shortcut key symbol
 */
export const formatShortcutKey = (
  key: string,
  isMac: boolean,
  capitalize: boolean = true
) => {
  if (isMac) {
    const lowerKey = key.toLowerCase()
    return MAC_SYMBOLS[lowerKey] || (capitalize ? key.toUpperCase() : key)
  }

  return capitalize ? key.charAt(0).toUpperCase() + key.slice(1) : key
}

/**
 * Parses a shortcut key string into an array of formatted key symbols
 * @param shortcutKeys - The string of shortcut keys (e.g., "ctrl-alt-shift")
 * @param delimiter - The delimiter used to split the keys (default: "-")
 * @param capitalize - Whether to capitalize the keys (default: true)
 * @returns Array of formatted shortcut key symbols
 */
export const parseShortcutKeys = (props: {
  shortcutKeys: string | undefined
  delimiter?: string
  capitalize?: boolean
}) => {
  const { shortcutKeys, delimiter = '+', capitalize = true } = props

  if (!shortcutKeys) return []

  return shortcutKeys
    .split(delimiter)
    .map((key) => key.trim())
    .map((key) => formatShortcutKey(key, isMac(), capitalize))
}

/**
 * Checks if a mark exists in the editor schema
 * @param markName - The name of the mark to check
 * @param editor - The editor instance
 * @returns boolean indicating if the mark exists in the schema
 */
export const isMarkInSchema = (
  markName: string,
  editor: Editor | null
): boolean => {
  if (!editor?.schema) return false
  return editor.schema.spec.marks.get(markName) !== undefined
}

/**
 * Checks if an extension is available in the editor
 * @param editor - The editor instance
 * @param extensionName - The name of the extension to check
 * @returns boolean indicating if the extension is available
 */
export const isExtensionAvailable = (
  editor: Editor | null,
  extensionNames: string | string[]
): boolean => {
  if (!editor) return false

  const names = Array.isArray(extensionNames)
    ? extensionNames
    : [extensionNames]

  return names.some((name) =>
    editor.extensionManager.extensions.some((ext) => ext.name === name)
  )
}

/**
 * Moves focus to the next node in the editor
 * @param editor - The editor instance
 * @returns boolean indicating if focus was moved successfully
 */
export function focusNextNode(editor: Editor): boolean {
  const { state, view } = editor
  const { doc, selection } = state

  const nextSel = Selection.findFrom(selection.$to, 1, true)
  if (nextSel) {
    view.dispatch(state.tr.setSelection(nextSel).scrollIntoView())
    return true
  }

  const paragraphType = state.schema.nodes.paragraph
  if (!paragraphType) {
    console.warn('No paragraph node type found in schema.')
    return false
  }

  const end = doc.content.size
  const para = paragraphType.create()
  let tr = state.tr.insert(end, para)

  // Place the selection inside the new paragraph
  const $inside = tr.doc.resolve(end + 1)
  tr = tr.setSelection(TextSelection.near($inside)).scrollIntoView()
  view.dispatch(tr)
  return true
}

/**
 * Checks if a specific node type is currently selected
 * @param editor - The editor instance
 * @param nodeTypes - Array of node type names to check
 * @returns boolean indicating if any of the specified node types is selected
 */
export const isNodeTypeSelected = (
  editor: Editor | null,
  nodeTypes: string[]
): boolean => {
  if (!editor) return false
  const { selection } = editor.state
  const { $from } = selection

  return nodeTypes.some((nodeType) => {
    return $from.parent.type.name === nodeType
  })
}

type ProtocolOptions = {
  scheme: string
  optionalSlashes?: boolean
}

type ProtocolConfig = Array<ProtocolOptions | string>

const ATTR_WHITESPACE =
  // eslint-disable-next-line no-control-regex
  /[\u0000-\u0020\u00A0\u1680\u180E\u2000-\u2029\u205F\u3000]/g

export function isAllowedUri(
  uri: string | undefined,
  protocols?: ProtocolConfig
) {
  const allowedProtocols: string[] = [
    'http',
    'https',
    'ftp',
    'ftps',
    'mailto',
    'tel',
    'callto',
    'sms',
    'cid',
    'xmpp',
  ]

  if (protocols) {
    protocols.forEach((protocol) => {
      const nextProtocol =
        typeof protocol === 'string' ? protocol : protocol.scheme

      if (nextProtocol) {
        allowedProtocols.push(nextProtocol)
      }
    })
  }

  return (
    !uri ||
    uri.replace(ATTR_WHITESPACE, '').match(
      new RegExp(
        // eslint-disable-next-line no-useless-escape
        `^(?:(?:${allowedProtocols.join(
          '|'
        )}):|[^a-z]|[a-z0-9+.\\-]+(?:[^a-z+.\\-:]|$))`,
        'i'
      )
    )
  )
}

export function sanitizeUrl(
  inputUrl: string,
  baseUrl: string,
  protocols?: ProtocolConfig
): string {
  try {
    const url = new URL(inputUrl, baseUrl)

    if (isAllowedUri(url.href, protocols)) {
      return url.href
    }
  } catch {
    // If URL creation fails, it's considered invalid
  }
  return '#'
}

/**
 * Checks if a node exists in the editor schema
 * @param nodeName - The name of the node to check
 * @param editor - The editor instance
 * @returns boolean indicating if the node exists in the schema
 */
export const isNodeInSchema = (
  nodeName: string,
  editor: Editor | null
): boolean => {
  if (!editor?.schema) return false
  return editor.schema.spec.nodes.get(nodeName) !== undefined
}

/**
 * Validates if a position is a valid number
 * @param pos - The position to validate
 * @returns Type predicate indicating if pos is a valid number
 */
export function isValidPosition(pos: number | null | undefined): pos is number {
  return typeof pos === 'number' && pos >= 0
}

/**
 * Finds a node at a specific position in the document
 * @param editor - The editor instance
 * @param position - The position to search for
 * @returns The node at the position or null
 */
export function findNodeAtPosition(editor: Editor, position: number) {
  try {
    const node = editor.state.doc.nodeAt(position)
    if (!node) {
      console.warn(`No node found at position ${position}`)
      return null
    }
    return node
  } catch (error) {
    console.error(`Error getting node at position ${position}:`, error)
    return null
  }
}

/**
 * Finds the position and instance of a node in the document
 * @param props Object containing editor, node (optional), and nodePos (optional)
 * @param props.editor The Tiptap editor instance
 * @param props.node The node to find (optional if nodePos is provided)
 * @param props.nodePos The position of the node to find (optional if node is provided)
 * @returns Object with pos and node, or null if not found
 */
export function findNodePosition(props: {
  editor: Editor | null
  node?: TiptapNode | null
  nodePos?: number | null
}): { pos: number; node: TiptapNode } | null {
  const { editor, node, nodePos } = props

  if (!editor || !editor.state?.doc) return null

  // Zero is valid position
  const hasValidNode = node !== undefined && node !== null
  const hasValidPos = isValidPosition(nodePos)

  if (!hasValidNode && !hasValidPos) {
    return null
  }

  // First search for the node in the document if we have a node
  if (hasValidNode) {
    let foundPos = -1
    let foundNode: TiptapNode | null = null

    editor.state.doc.descendants((currentNode, pos) => {
      if (currentNode === node) {
        foundPos = pos
        foundNode = currentNode
        return false
      }
      return true
    })

    if (foundPos !== -1 && foundNode !== null) {
      return { pos: foundPos, node: foundNode }
    }
  }

  // If we have a valid position, use findNodeAtPosition
  if (hasValidPos) {
    const nodeAtPos = findNodeAtPosition(editor, nodePos!)
    if (nodeAtPos) {
      return { pos: nodePos!, node: nodeAtPos }
    }
  }

  return null
}

/**
 * Handles image file upload to Supabase storage
 * @param file The image file to upload
 * @returns Promise resolving to the URL of the uploaded image
 */
export const handleImageUpload = async (file: File): Promise<string> => {
  // Validate file
  if (!file) {
    throw new Error('No file provided')
  }

  if (file.size > MAX_FILE_SIZE) {
    throw new Error(
      `File size exceeds maximum allowed (${MAX_FILE_SIZE / (1024 * 1024)}MB)`
    )
  }

  try {
    const url = await uploadImageToSupabase(file)
    return url
  } catch (error) {
    console.error('Image upload failed:', error)
    throw new Error('Failed to upload image')
  }
}
