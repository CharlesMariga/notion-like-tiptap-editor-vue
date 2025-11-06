import { ref, watch, onUnmounted, type Ref, inject, provide } from "vue"
import { type Editor } from "@tiptap/vue-3"
import type { Transaction } from "@tiptap/pm/state"
import { getSelectedDOMElement } from "@/lib/tiptap-advanced-utils"
import {
  findPrioritizedAIElement,
  cleanupFallbackAnchors,
} from "@/components/tiptap-ui/ai-menu/ai-menu-utils"
import type {
  AiMenuState,
  AiMenuStateContextValue,
  AiMenuPosition,
} from "@/components/tiptap-ui/ai-menu/ai-menu-types"

export const AI_MENU_STATE_KEY = Symbol("aiMenuState")

export const initialState: AiMenuState = {
  isOpen: false,
  tone: undefined,
  language: "en",
  shouldShowInput: true,
  inputIsFocused: false,
  fallbackAnchor: { element: null, rect: null },
}

export function useAiMenuState() {
  const context = inject<AiMenuStateContextValue>(AI_MENU_STATE_KEY)

  if (!context) {
    throw new Error("useAiMenuState must be used within an AiMenuStateProvider")
  }

  return context
}

export function useAiMenuStateProvider() {
  const state = ref<AiMenuState>({ ...initialState })

  const updateState = (updates: Partial<AiMenuState>) => {
    state.value = { ...state.value, ...updates }
  }

  const setFallbackAnchor = (
    element: HTMLElement | null,
    rect?: DOMRect | null
  ) => {
    const anchorRect = rect || element?.getBoundingClientRect() || null
    updateState({
      fallbackAnchor: { element, rect: anchorRect },
    })
  }

  const reset = () => {
    state.value = { ...initialState }
    cleanupFallbackAnchors()
  }

  const value: AiMenuStateContextValue = {
    state,
    updateState,
    setFallbackAnchor,
    reset,
  }

  provide(AI_MENU_STATE_KEY, value)

  return { value, state, updateState, setFallbackAnchor, reset }
}

export function useAiContentTracker(params: {
  editor: Ref<Editor | null>
  aiGenerationActive: Ref<boolean>
  setAnchorElement: (element: HTMLElement) => void
  fallbackAnchor: Ref<AiMenuPosition>
}) {
  const { editor, aiGenerationActive, setAnchorElement } = params
  const fallbackAnchorRef = ref<HTMLElement | null>(null)

  const handleTransaction = (props: any) => {
    const ed = props.editor as Editor
    const aiStorage = ed.storage.ai || ed.storage.aiAdvanced

    if (aiStorage?.state === "loading") {
      const aiMarkedElement = findPrioritizedAIElement(ed)

      if (aiMarkedElement && aiMarkedElement !== ed.view.dom) {
        if (fallbackAnchorRef.value) {
          fallbackAnchorRef.value.remove()
          fallbackAnchorRef.value = null
        }
        setAnchorElement(aiMarkedElement)
      }
    }
  }

  watch(
    [editor, aiGenerationActive],
    ([editorVal, activeVal]) => {
      if (!editorVal || !activeVal) return

      editorVal.on("transaction", handleTransaction as any)
    },
    { immediate: true }
  )

  onUnmounted(() => {
    if (editor.value) {
      editor.value.off("transaction", handleTransaction as any)
    }
    if (fallbackAnchorRef.value) {
      fallbackAnchorRef.value.remove()
      fallbackAnchorRef.value = null
    }
  })
}

export function useTextSelectionTracker(params: {
  editor: Ref<Editor | null>
  aiGenerationActive: Ref<boolean>
  showMenuAtElement: (element: HTMLElement) => void
  setMenuVisible: (visible: boolean) => void
  onSelectionChange?: (
    element: HTMLElement | null,
    rect: DOMRect | null
  ) => void
  prevent?: Ref<boolean>
}) {
  const {
    editor,
    aiGenerationActive,
    showMenuAtElement,
    setMenuVisible,
    onSelectionChange,
    prevent = ref(false),
  } = params

  const handleTransaction = (props: any) => {
    const { editor: ed, transaction } = props as { editor: Editor; transaction: Transaction }
    if (transaction.selection?.empty) return

    const selectedElement = getSelectedDOMElement(ed)
    const shouldShow = Boolean(selectedElement && aiGenerationActive.value)

    setMenuVisible(shouldShow)

    if (shouldShow && selectedElement) {
      const rect = selectedElement.getBoundingClientRect()
      onSelectionChange?.(selectedElement, rect)
      showMenuAtElement(selectedElement)
    }
  }

  watch(
    [editor, aiGenerationActive, prevent],
    ([editorVal, activeVal, preventVal]) => {
      if (!editorVal || !activeVal || preventVal) return

      editorVal.on("transaction", handleTransaction as any)
    },
    { immediate: true }
  )

  onUnmounted(() => {
    if (editor.value) {
      editor.value.off("transaction", handleTransaction as any)
    }
  })
}
