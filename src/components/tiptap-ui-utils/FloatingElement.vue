<script setup lang="ts">
import { ref, computed, watch, onMounted, onUnmounted } from 'vue'
import type { Editor } from '@tiptap/vue-3'
import { flip, offset, shift } from '@floating-ui/vue'
import { Selection } from '@tiptap/pm/state'
import { useTiptapEditor } from '@/composables/useTiptapEditor'
import { useFloatingElement } from '@/composables/useFloatingElement'
import { getSelectionBoundingRect, isSelectionValid } from '@/lib/tiptap-collab-utils'
import { isValidPosition } from '@/lib/tiptap-utils'

interface FloatingElementProps {
  editor?: Editor | null
  shouldShow?: boolean
  floatingOptions?: Record<string, any>
  zIndex?: number
  updateOnScroll?: boolean
  closeOnEscape?: boolean
  getBoundingClientRect?: (editor: Editor) => DOMRect | null
}

const props = withDefaults(defineProps<FloatingElementProps>(), {
  editor: null,
  shouldShow: undefined,
  floatingOptions: () => ({}),
  zIndex: 50,
  updateOnScroll: true,
  closeOnEscape: true,
  getBoundingClientRect: getSelectionBoundingRect,
})

const emit = defineEmits<{
  openChange: [open: boolean]
  rectChange: [rect: DOMRect | null]
}>()

const { editor } = useTiptapEditor(props.editor)
const open = ref(props.shouldShow !== undefined ? props.shouldShow : false)
const selectionRect = ref<DOMRect | null>(null)
const floatingElementRef = ref<HTMLElement | null>(null)
const preventHideRef = ref(false)
const preventShowRef = ref(false)

const handleOpenChange = (newOpen: boolean) => {
  emit('openChange', newOpen)
  open.value = newOpen
}

const handleFloatingOpenChange = (openVal: boolean) => {
  if (!openVal && editor.value) {
    // Reset selection when closing
    const tr = editor.value.state.tr.setSelection(
      Selection.near(editor.value.state.doc.resolve(0))
    )
    editor.value.view.dispatch(tr)
  }
  handleOpenChange(openVal)
}

// Watch for selection rect changes
watch(selectionRect, (newRect) => {
  emit('rectChange', newRect)
})

// Watch for shouldShow prop changes
watch(() => props.shouldShow, () => {
  updateSelectionState()
})

const { isMounted, refs, style, getFloatingProps } = useFloatingElement(
  open,
  selectionRect,
  props.zIndex,
  computed(() => ({
    placement: 'top',
    middleware: [shift(), flip(), offset(4)],
    onOpenChange: handleFloatingOpenChange,
    dismissOptions: {
      enabled: true,
      escapeKey: true,
      outsidePress(event: Event) {
        const relatedTarget = event.target as Node
        if (!relatedTarget || !editor.value) return false

        const editorDOM = editor.value.view.dom
        return !(editorDOM === relatedTarget || editorDOM.contains(relatedTarget))
      },
    },
    ...props.floatingOptions,
  }))
)

const updateSelectionState = () => {
  if (!editor.value) return

  const newRect = props.getBoundingClientRect(editor.value)

  // When shouldShow prop is provided, respect it directly
  if (props.shouldShow !== undefined) {
    if (newRect && props.shouldShow && !preventShowRef.value) {
      selectionRect.value = newRect
      handleOpenChange(true)
      return
    }
    if (!props.shouldShow) {
      handleOpenChange(false)
      return
    }
    // If preventShowRef is true but shouldShow is true, wait for mouseup
    return
  }

  // Fallback to manual validation when shouldShow is not provided
  const shouldShowResult = isSelectionValid(editor.value)

  if (
    newRect &&
    !preventShowRef.value &&
    (shouldShowResult || preventHideRef.value)
  ) {
    selectionRect.value = newRect
    handleOpenChange(true)
  } else if (
    !preventHideRef.value &&
    (!shouldShowResult || preventShowRef.value || !editor.value.isEditable)
  ) {
    handleOpenChange(false)
  }
}

// Keyboard handling
const handleKeyDown = (event: KeyboardEvent) => {
  if (event.key === 'Escape' && open.value && props.closeOnEscape) {
    handleOpenChange(false)
    return true
  }
  return false
}

// Blur handling
const handleBlur = (event: FocusEvent) => {
  if (!editor.value) return

  if (preventHideRef.value) {
    preventHideRef.value = false
    return
  }

  const relatedTarget = event.relatedTarget as Node
  if (!relatedTarget) return

  const editorDOM = editor.value.view.dom
  const isWithinEditor = editorDOM === relatedTarget || editorDOM.contains(relatedTarget)

  const floatingElement = floatingElementRef.value
  const isWithinFloatingElement =
    floatingElement &&
    (floatingElement === relatedTarget || floatingElement.contains(relatedTarget))

  if (!isWithinEditor && !isWithinFloatingElement && open.value) {
    handleOpenChange(false)
  }
}

// Drag handling
const handleDrag = () => {
  if (open.value) {
    handleOpenChange(false)
  }
}

// Mouse handling
const handleMouseDown = (event: MouseEvent) => {
  if (!editor.value || event.button !== 0) return

  preventShowRef.value = true

  const { state, view } = editor.value
  const posCoords = view.posAtCoords({
    left: event.clientX,
    top: event.clientY,
  })

  if (!posCoords || !isValidPosition(posCoords.pos)) return

  const $pos = state.doc.resolve(posCoords.pos)
  const nodeBefore = $pos.nodeBefore

  if (!nodeBefore || nodeBefore.isBlock) return

  const tr = state.tr.setSelection(Selection.near(state.doc.resolve(posCoords.pos)))
  view.dispatch(tr)
}

const handleMouseUp = () => {
  if (preventShowRef.value) {
    preventShowRef.value = false
    updateSelectionState()
  }
}

const updateIfOpen = () => {
  if (open.value) updateSelectionState()
}

onMounted(() => {
  if (!editor.value) return

  // Keyboard events
  editor.value.view.dom.addEventListener('keydown', handleKeyDown as any)

  // Blur events
  editor.value.view.dom.addEventListener('blur', handleBlur as any)

  // Drag events
  editor.value.view.dom.addEventListener('dragstart', handleDrag)
  editor.value.view.dom.addEventListener('dragover', handleDrag)

  // Mouse events
  editor.value.view.dom.addEventListener('mousedown', handleMouseDown as any)
  editor.value.view.root.addEventListener('mouseup', handleMouseUp as any)

  // Selection updates
  editor.value.on('selectionUpdate', updateSelectionState)

  // Window resize
  window.addEventListener('resize', updateIfOpen)

  // Scroll updates
  if (props.updateOnScroll) {
    editor.value.view.root.addEventListener('scroll', updateIfOpen, true)
  }

  // Initial update
  updateSelectionState()
})

onUnmounted(() => {
  if (!editor.value) return

  editor.value.view.dom.removeEventListener('keydown', handleKeyDown as any)
  editor.value.view.dom.removeEventListener('blur', handleBlur as any)
  editor.value.view.dom.removeEventListener('dragstart', handleDrag)
  editor.value.view.dom.removeEventListener('dragover', handleDrag)
  editor.value.view.dom.removeEventListener('mousedown', handleMouseDown as any)
  editor.value.view.root.removeEventListener('mouseup', handleMouseUp as any)
  editor.value.off('selectionUpdate', updateSelectionState)
  window.removeEventListener('resize', updateIfOpen)

  if (props.updateOnScroll) {
    editor.value.view.root.removeEventListener('scroll', updateIfOpen, true)
  }
})

const shouldRender = computed(() => {
  return editor.value && isMounted.value && open.value
})

// Sync the floating ref from the composable with our local ref for event handlers
watch(refs.floating, (newFloating) => {
  floatingElementRef.value = newFloating
})
</script>

<template>
  <div
    v-if="shouldRender"
    :ref="(el) => refs.floating.value = el as HTMLElement"
    :style="style"
    v-bind="getFloatingProps()"
  >
    <slot />
  </div>
</template>
