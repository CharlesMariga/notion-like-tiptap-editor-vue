<script setup lang="ts">
import { ref, computed, watch } from "vue";
import type { Editor } from "@tiptap/vue-3";
import {
  flip,
  offset,
  shift,
  type UseFloatingOptions,
} from "@floating-ui/vue";
import { Selection } from "@tiptap/pm/state";

// --- Composables ---
import { useFloatingElement } from "@/composables/useFloatingElement";
import { useTiptapEditor } from "@/composables/useTiptapEditor";

// --- Lib ---
import {
  getSelectionBoundingRect,
  isSelectionValid,
} from "@/lib/tiptap-collab-utils";

import { isElementWithinEditor } from "./floating-element-utils";
import { isValidPosition } from "@/lib/tiptap-utils";

export interface FloatingElementProps {
  /**
   * The Tiptap editor instance to attach to.
   */
  editor?: Editor | null;
  /**
   * Controls whether the floating element should be visible.
   * @default undefined
   */
  shouldShow?: boolean;
  /**
   * Additional options to pass to the floating UI.
   */
  floatingOptions?: Partial<UseFloatingOptions>;
  /**
   * Z-index for the floating element.
   * @default 50
   */
  zIndex?: number;
  /**
   * Callback fired when the visibility state changes.
   */
  onOpenChange?: (open: boolean) => void;
  /**
   * Callback fired when the selection rectangle changes.
   * Provides access to the current position information.
   */
  onRectChange?: (rect: DOMRect | null) => void;
  /**
   * Custom function to determine the position of the floating element.
   * @default getSelectionBoundingRect
   */
  getBoundingClientRect?: (editor: Editor) => DOMRect | null;
  /**
   * Whether to update position on scroll events.
   * @default true
   */
  updateOnScroll?: boolean;
  /**
   * Whether to close the floating element when Escape key is pressed.
   * @default true
   */
  closeOnEscape?: boolean;
}

/**
 * A floating UI element that positions itself relative to the current selection in a Tiptap editor.
 * Used for floating toolbars, menus, and other UI elements that need to appear near the text cursor.
 */
const props = withDefaults(defineProps<FloatingElementProps>(), {
  shouldShow: undefined,
  zIndex: 50,
  getBoundingClientRect: getSelectionBoundingRect,
  updateOnScroll: true,
  closeOnEscape: true,
});

const open = ref<boolean>(
  props.shouldShow !== undefined ? props.shouldShow : false
);
const selectionRect = ref<DOMRect | null>(null);

const preventHideRef = ref(false);
const preventShowRef = ref(false);

const { editor } = useTiptapEditor(() => props.editor);

const handleOpenChange = (newOpen: boolean) => {
  props.onOpenChange?.(newOpen);
  open.value = newOpen;
};

const handleFloatingOpenChange = (newOpen: boolean) => {
  if (!newOpen && editor.value) {
    // When the floating element closes, reset the selection.
    // This lets the user place the cursor again and ensures the drag handle reappears,
    // as it's intentionally hidden during valid text selections.
    const tr = editor.value.state.tr.setSelection(
      Selection.near(editor.value.state.doc.resolve(0))
    );
    editor.value.view.dispatch(tr);
  }

  handleOpenChange(newOpen);
};

const floatingOptionsValue = computed(() => ({
  placement: "top" as const,
  middleware: [shift(), flip(), offset(4)],
  onOpenChange: handleFloatingOpenChange,
  ...props.floatingOptions,
}));

const { floatingRef, style } = useFloatingElement(
  open,
  selectionRect,
  props.zIndex,
  floatingOptionsValue
);

const updateSelectionState = () => {
  if (!editor.value) {
    return;
  }

  const newRect = props.getBoundingClientRect(editor.value);

  if (newRect && props.shouldShow !== undefined && !preventShowRef.value) {
    selectionRect.value = newRect;
    handleOpenChange(props.shouldShow);
    return;
  }

  const shouldShowResult = isSelectionValid(editor.value);

  if (
    newRect &&
    !preventShowRef.value &&
    (shouldShowResult || preventHideRef.value)
  ) {
    selectionRect.value = newRect;
    handleOpenChange(true);
  } else if (
    !preventHideRef.value &&
    (!shouldShowResult || preventShowRef.value || !editor.value.isEditable)
  ) {
    handleOpenChange(false);
  }
};

// Watch for rect changes
watch(selectionRect, (newRect) => {
  props.onRectChange?.(newRect);
});

// Watch for shouldShow prop changes
watch(() => props.shouldShow, (newShouldShow) => {
  if (newShouldShow !== undefined) {
    if (newShouldShow) {
      // Only open if we have a valid rect
      if (editor.value) {
        const rect = props.getBoundingClientRect(editor.value);
        if (rect) {
          selectionRect.value = rect;
          handleOpenChange(true);
        }
      }
    } else {
      handleOpenChange(false);
    }
  }
});

// Handle Escape key
watch(editor, (currentEditor, oldEditor, onCleanup) => {
  if (!currentEditor || !props.closeOnEscape) return;

  const handleKeyDown = (event: KeyboardEvent) => {
    if (event.key === "Escape" && open.value) {
      handleOpenChange(false);
      return true;
    }
    return false;
  };

  currentEditor.view.dom.addEventListener("keydown", handleKeyDown);

  onCleanup(() => {
    if (currentEditor) {
      currentEditor.view.dom.removeEventListener("keydown", handleKeyDown);
    }
  });
});

// Handle blur events
watch(editor, (currentEditor, oldEditor, onCleanup) => {
  if (!currentEditor) return;

  const handleBlur = (event: FocusEvent) => {
    if (preventHideRef.value) {
      preventHideRef.value = false;
      return;
    }

    const relatedTarget = event.relatedTarget as Node;
    if (!relatedTarget) return;

    const isWithinEditor = isElementWithinEditor(currentEditor, relatedTarget);

    const floatingElement = floatingRef.value;
    const isWithinFloatingElement =
      floatingElement &&
      (floatingElement === relatedTarget ||
        floatingElement.contains(relatedTarget));

    if (!isWithinEditor && !isWithinFloatingElement && open.value) {
      handleOpenChange(false);
    }
  };

  currentEditor.view.dom.addEventListener("blur", handleBlur);

  onCleanup(() => {
    currentEditor.view.dom.removeEventListener("blur", handleBlur);
  });
});

// Handle drag events
watch([editor, open], ([currentEditor, isOpen], oldValue, onCleanup) => {
  if (!currentEditor) return;

  const handleDrag = () => {
    if (isOpen) {
      handleOpenChange(false);
    }
  };

  currentEditor.view.dom.addEventListener("dragstart", handleDrag);
  currentEditor.view.dom.addEventListener("dragover", handleDrag);

  onCleanup(() => {
    if (currentEditor) {
      currentEditor.view.dom.removeEventListener("dragstart", handleDrag);
      currentEditor.view.dom.removeEventListener("dragover", handleDrag);
    }
  });
});

// Handle mouse events
watch(editor, (currentEditor, oldEditor, onCleanup) => {
  if (!currentEditor) return;

  const handleMouseDown = (event: MouseEvent) => {
    if (event.button !== 0) return;

    preventShowRef.value = true;

    const { state, view } = currentEditor;
    const posCoords = view.posAtCoords({
      left: event.clientX,
      top: event.clientY,
    });

    if (!posCoords || !isValidPosition(posCoords.pos)) return;

    const $pos = state.doc.resolve(posCoords.pos);
    const nodeBefore = $pos.nodeBefore;

    if (!nodeBefore || nodeBefore.isBlock) return;

    const tr = state.tr.setSelection(
      Selection.near(state.doc.resolve(posCoords.pos))
    );
    view.dispatch(tr);
  };

  const handleMouseUp = () => {
    if (preventShowRef.value) {
      preventShowRef.value = false;
      updateSelectionState();
    }
  };

  currentEditor.view.dom.addEventListener("mousedown", handleMouseDown);
  currentEditor.view.root.addEventListener("mouseup", handleMouseUp);

  onCleanup(() => {
    if (currentEditor) {
      currentEditor.view.dom.removeEventListener("mousedown", handleMouseDown);
      currentEditor.view.root.removeEventListener("mouseup", handleMouseUp);
    }
  });
});

// Handle selection updates and scroll
watch([editor, open], ([currentEditor, isOpen], oldValue, onCleanup) => {
  if (!currentEditor) return;

  const updateIfOpen = () => {
    if (isOpen) updateSelectionState();
  };

  currentEditor.on("selectionUpdate", updateSelectionState);
  window.addEventListener("resize", updateIfOpen);

  if (props.updateOnScroll) {
    currentEditor.view.root.addEventListener("scroll", updateIfOpen, true);
  }

  onCleanup(() => {
    if (currentEditor) {
      currentEditor.off("selectionUpdate", updateSelectionState);
      window.removeEventListener("resize", updateIfOpen);

      if (props.updateOnScroll) {
        currentEditor.view.root.removeEventListener("scroll", updateIfOpen, true);
      }
    }
  });
}, { immediate: true });

// Initial update
watch(editor, (currentEditor) => {
  if (currentEditor) {
    updateSelectionState();
  }
}, { immediate: true });

const isMounted = ref(true);
const isVisible = computed(() => open.value && editor.value && isMounted.value);

// Expose the floatingRef for parent components
defineExpose({
  floatingRef,
});
</script>

<template>
  <Teleport to="body">
    <div
      v-if="isVisible"
      ref="floatingRef"
      :style="style"
      role="dialog"
      aria-label="Floating element"
    >
      <slot />
    </div>
  </Teleport>
</template>
