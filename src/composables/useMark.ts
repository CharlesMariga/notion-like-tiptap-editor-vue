import { ref, watch, onBeforeUnmount, computed, type Component, markRaw } from 'vue'
import type { Editor } from '@tiptap/vue-3'

// --- Composables ---
import { useTiptapEditor } from './useTiptapEditor'

// --- Lib ---
import { isMarkInSchema, isNodeTypeSelected } from '@/lib/tiptap-utils'

// --- Icons ---
import BoldIcon from '@/components/tiptap-icons/BoldIcon.vue'
import Code2Icon from '@/components/tiptap-icons/Code2Icon.vue'
import ItalicIcon from '@/components/tiptap-icons/ItalicIcon.vue'
import StrikeIcon from '@/components/tiptap-icons/StrikeIcon.vue'
import SubscriptIcon from '@/components/tiptap-icons/SubscriptIcon.vue'
import SuperscriptIcon from '@/components/tiptap-icons/SuperscriptIcon.vue'
import UnderlineIcon from '@/components/tiptap-icons/UnderlineIcon.vue'

export type Mark =
  | 'bold'
  | 'italic'
  | 'strike'
  | 'code'
  | 'underline'
  | 'superscript'
  | 'subscript'

/**
 * Configuration for the mark functionality
 */
export interface UseMarkConfig {
  /**
   * The Tiptap editor instance.
   */
  editor?: Editor | null
  /**
   * The type of mark to toggle
   */
  type: Mark
  /**
   * Whether the button should hide when mark is not available.
   * @default false
   */
  hideWhenUnavailable?: boolean
  /**
   * Callback function called after a successful mark toggle.
   */
  onToggled?: () => void
}

export const markIcons: Record<Mark, Component> = {
  bold: markRaw(BoldIcon),
  italic: markRaw(ItalicIcon),
  underline: markRaw(UnderlineIcon),
  strike: markRaw(StrikeIcon),
  code: markRaw(Code2Icon),
  superscript: markRaw(SuperscriptIcon),
  subscript: markRaw(SubscriptIcon),
}

export const MARK_SHORTCUT_KEYS: Record<Mark, string> = {
  bold: 'mod+b',
  italic: 'mod+i',
  underline: 'mod+u',
  strike: 'mod+shift+s',
  code: 'mod+e',
  superscript: 'mod+.',
  subscript: 'mod+,',
}

/**
 * Checks if a mark can be toggled in the current editor state
 */
export function canToggleMark(editor: Editor | null, type: Mark): boolean {
  if (!editor || !editor.isEditable) return false
  if (!isMarkInSchema(type, editor) || isNodeTypeSelected(editor, ['image']))
    return false

  return editor.can().toggleMark(type)
}

/**
 * Checks if a mark is currently active
 */
export function isMarkActive(editor: Editor | null, type: Mark): boolean {
  if (!editor || !editor.isEditable) return false
  return editor.isActive(type)
}

/**
 * Toggles a mark in the editor
 */
export function toggleMark(editor: Editor | null, type: Mark): boolean {
  if (!editor || !editor.isEditable) return false
  if (!canToggleMark(editor, type)) return false

  return editor.chain().focus().toggleMark(type).run()
}

/**
 * Determines if the mark button should be shown
 */
export function shouldShowButton(props: {
  editor: Editor | null
  type: Mark
  hideWhenUnavailable: boolean
}): boolean {
  const { editor, type, hideWhenUnavailable } = props

  if (!editor || !editor.isEditable) return false
  if (!isMarkInSchema(type, editor)) return false

  if (hideWhenUnavailable && !editor.isActive('code')) {
    return canToggleMark(editor, type)
  }

  return true
}

/**
 * Gets the formatted mark name
 */
export function getFormattedMarkName(type: Mark): string {
  return type.charAt(0).toUpperCase() + type.slice(1)
}

/**
 * Custom composable that provides mark functionality for Tiptap editor
 *
 * @example
 * ```vue
 * <script setup>
 * import { useMark } from '@/composables/useMark'
 *
 * const { isVisible, handleMark, label, isActive } = useMark({
 *   type: 'bold',
 *   hideWhenUnavailable: true,
 *   onToggled: () => console.log('Mark toggled!')
 * })
 * </script>
 *
 * <template>
 *   <button v-if="isVisible" @click="handleMark" :aria-pressed="isActive" :aria-label="label">
 *     Bold
 *   </button>
 * </template>
 * ```
 */
export function useMark(config: UseMarkConfig) {
  const {
    editor: providedEditor,
    type,
    hideWhenUnavailable = false,
    onToggled,
  } = config

  const { editor } = useTiptapEditor(providedEditor)
  const isVisible = ref<boolean>(true)

  const canToggle = computed(() => canToggleMark(editor.value, type))
  const isActive = computed(() => isMarkActive(editor.value, type))

  const cleanup: (() => void)[] = []

  watch(
    editor,
    (newEditor) => {
      // Clear previous listeners
      cleanup.forEach((fn) => fn())
      cleanup.length = 0

      if (!newEditor) return

      const handleSelectionUpdate = () => {
        isVisible.value = shouldShowButton({
          editor: newEditor,
          type,
          hideWhenUnavailable,
        })
      }

      handleSelectionUpdate()

      newEditor.on('selectionUpdate', handleSelectionUpdate)

      cleanup.push(() => {
        newEditor.off('selectionUpdate', handleSelectionUpdate)
      })
    },
    { immediate: true }
  )

  onBeforeUnmount(() => {
    cleanup.forEach((fn) => fn())
  })

  const handleMark = () => {
    if (!editor.value) return false

    const success = toggleMark(editor.value, type)
    if (success) {
      onToggled?.()
    }
    return success
  }

  return {
    isVisible,
    isActive,
    handleMark,
    canToggle,
    label: getFormattedMarkName(type),
    shortcutKeys: MARK_SHORTCUT_KEYS[type],
    Icon: markIcons[type],
  }
}
