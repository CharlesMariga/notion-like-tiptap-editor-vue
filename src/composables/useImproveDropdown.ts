import { ref, computed, watch, type Ref } from 'vue'
import type { Editor } from '@tiptap/vue-3'
import type { TextOptions, Language, Tone } from '@tiptap-pro/extension-ai'
import { NodeSelection } from '@tiptap/pm/state'

const AI_EXCLUDED_BLOCKS = [
  'image',
  'imageUpload',
  'video',
  'audio',
  'table',
  'codeBlock',
  'horizontalRule',
  'hardBreak',
]

export function canUseAi(editor: Editor | null): boolean {
  if (!editor || !editor.isEditable) return false

  const { selection } = editor.state

  if (selection.empty) {
    return false
  }

  if (selection instanceof NodeSelection) {
    if (!selection.node.content.size) {
      return false
    }

    const node = selection.node
    if (AI_EXCLUDED_BLOCKS.includes(node.type.name)) {
      return false
    }
  }

  return true
}

export function shouldShowImproveDropdown(params: {
  editor: Editor | null
  hideWhenUnavailable: boolean
}): boolean {
  const { editor, hideWhenUnavailable } = params

  if (!editor || !editor.isEditable) {
    return false
  }

  if (hideWhenUnavailable && !editor.isActive('code')) {
    return canUseAi(editor)
  }

  return true
}

export function useImproveDropdownState(
  editor: Ref<Editor | null>,
  hideWhenUnavailable: Ref<boolean> = ref(false)
) {
  const isOpen = ref(false)
  const show = ref(false)
  const isDisabled = computed(() => !canUseAi(editor.value))

  const handleOpenChange = (open: boolean, callback?: (isOpen: boolean) => void) => {
    if (!editor.value || isDisabled.value) return
    isOpen.value = open
    callback?.(open)
  }

  // Watch for selection changes
  watch(
    editor,
    (newEditor) => {
      if (!newEditor) return

      const handleSelectionUpdate = () => {
        show.value = shouldShowImproveDropdown({
          editor: newEditor,
          hideWhenUnavailable: hideWhenUnavailable.value,
        })
      }

      handleSelectionUpdate()
      newEditor.on('selectionUpdate', handleSelectionUpdate)

      return () => {
        newEditor.off('selectionUpdate', handleSelectionUpdate)
      }
    },
    { immediate: true }
  )

  return {
    isDisabled,
    isOpen,
    handleOpenChange,
    show,
  }
}

type AICommand =
  | 'fixSpellingAndGrammar'
  | 'extend'
  | 'shorten'
  | 'simplify'
  | 'emojify'
  | 'complete'
  | 'summarize'

export function useAICommands(editor: Ref<Editor | null>, textOptions?: TextOptions) {
  const defaultOptions = computed(() => ({
    stream: true,
    format: 'rich-text' as const,
    ...textOptions,
  }))

  const executeAICommand = (command: AICommand) => {
    if (!editor.value) return

    editor.value.chain().focus().aiGenerationShow().run()

    setTimeout(() => {
      if (!editor.value) return

      switch (command) {
        case 'fixSpellingAndGrammar':
          editor.value.commands.aiFixSpellingAndGrammar(defaultOptions.value)
          break
        case 'extend':
          editor.value.commands.aiExtend(defaultOptions.value)
          break
        case 'shorten':
          editor.value.commands.aiShorten(defaultOptions.value)
          break
        case 'simplify':
          editor.value.commands.aiSimplify(defaultOptions.value)
          break
        case 'emojify':
          editor.value.commands.aiEmojify(defaultOptions.value)
          break
        case 'complete':
          editor.value.commands.aiComplete(defaultOptions.value)
          break
        case 'summarize':
          editor.value.commands.aiSummarize(defaultOptions.value)
          break
      }
    }, 0)
  }

  const adjustTone = (tone: Tone) => {
    if (!editor.value) return
    editor.value.chain().focus().aiGenerationShow().run()

    setTimeout(() => {
      if (!editor.value) return
      editor.value.commands.aiAdjustTone(tone, defaultOptions.value)
    }, 0)
  }

  const translate = (language: Language) => {
    if (!editor.value) return
    editor.value.chain().focus().aiGenerationShow().run()

    setTimeout(() => {
      if (!editor.value) return
      editor.value.commands.aiTranslate(language, defaultOptions.value)
    }, 0)
  }

  return {
    executeAICommand,
    adjustTone,
    translate,
  }
}
