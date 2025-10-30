import { ref, watch, onMounted, type MaybeRefOrGetter } from "vue";
import type { Editor } from "@tiptap/vue-3";

// --- Composables ---
import { useTiptapEditor } from "@/composables/useTiptapEditor";

// TODO: Create this icon component
// --- Icons ---
// import TextColorSmallIcon from "@/components/tiptap-icons/TextColorSmallIcon.vue";

// --- Lib ---
import { isMarkInSchema } from "@/lib/tiptap-utils";

export type ColorType = "text" | "highlight";

export interface ColorItem {
  value: string;
  label: string;
}

export interface RecentColor {
  type: ColorType;
  label: string;
  value: string;
}

/**
 * Configuration for the color text popover functionality
 */
export interface UseColorTextPopoverConfig {
  /**
   * The Tiptap editor instance.
   */
  editor?: MaybeRefOrGetter<Editor | null | undefined>;
  /**
   * Whether the popover should hide when color text is not available.
   * @default false
   */
  hideWhenUnavailable?: boolean;
  /**
   * Callback function called after a color is applied.
   */
  onColorChanged?: ({
    type,
    label,
    value,
  }: {
    type: ColorType;
    label: string;
    value: string;
  }) => void;
}

/**
 * Get active mark attributes helper
 */
export function getActiveMarkAttrs(
  editor: Editor | null,
  markName: string
): Record<string, any> | null {
  if (!editor) return null;

  const { state } = editor;
  const markType = state.schema.marks[markName];

  // Check if the mark exists in the schema
  if (!markType) return null;

  const { from, to } = state.selection;
  const marks = state.doc.rangeHasMark(from, to, markType)
    ? state.doc.nodeAt(from)?.marks || []
    : [];

  const mark = marks.find((m) => m.type.name === markName);
  return mark?.attrs || null;
}

/**
 * Check if text color can be applied
 */
export function canColorText(editor: Editor | null): boolean {
  if (!editor || !editor.isEditable) return false;
  if (!isMarkInSchema("textStyle", editor)) return false;
  return editor.can().setMark("textStyle");
}

/**
 * Check if highlight color can be applied
 */
export function canColorHighlight(editor: Editor | null): boolean {
  if (!editor || !editor.isEditable) return false;
  if (!isMarkInSchema("highlight", editor)) return false;
  return editor.can().setMark("highlight");
}

/**
 * Get a color object by its value
 */
export function getColorByValue(
  value: string,
  colorArray: ColorItem[]
): ColorItem {
  return (
    colorArray.find((color) => color.value === value) ?? {
      value,
      label: value,
    }
  );
}

/**
 * Checks if color text popover should be shown
 */
export function shouldShowColorTextPopover(params: {
  editor: Editor | null;
  hideWhenUnavailable: boolean;
}): boolean {
  const { editor, hideWhenUnavailable } = params;

  if (!editor || !editor.isEditable) return false;

  if (hideWhenUnavailable && !editor.isActive("code")) {
    return canColorText(editor) || canColorHighlight(editor);
  }

  return true;
}

/**
 * Vue composable to manage recently used colors
 */
export function useRecentColors(maxColors: number = 3) {
  const recentColors = ref<RecentColor[]>([]);
  const isInitialized = ref(false);

  onMounted(() => {
    try {
      const storedColors = localStorage.getItem("tiptapRecentlyUsedColors");
      if (storedColors) {
        const colors = JSON.parse(storedColors) as RecentColor[];
        recentColors.value = colors.slice(0, maxColors);
      }
    } catch (e) {
      console.error("Failed to load stored colors:", e);
    } finally {
      isInitialized.value = true;
    }
  });

  const addRecentColor = ({
    type,
    label,
    value,
  }: {
    type: ColorType;
    label: string;
    value: string;
  }) => {
    const filtered = recentColors.value.filter(
      (c) => !(c.type === type && c.value === value)
    );
    const updated = [{ type, label, value }, ...filtered].slice(0, maxColors);

    try {
      localStorage.setItem("tiptapRecentlyUsedColors", JSON.stringify(updated));
    } catch (e) {
      console.error("Failed to store colors:", e);
    }

    recentColors.value = updated;
  };

  return { recentColors, addRecentColor, isInitialized };
}

/**
 * Vue composable that provides color text popover functionality for Tiptap editor
 *
 * @example
 * ```ts
 * // Simple usage - no params needed
 * function MySimpleColorTextPopover() {
 *   const { isVisible, handleColorChanged } = useColorTextPopover()
 *
 *   if (!isVisible.value) return null
 *
 *   return (
 *     <Popover>
 *       <PopoverTrigger as-child>
 *         <button>Color Text</button>
 *       </PopoverTrigger>
 *       <PopoverContent>
 *         <TextStyleColorPanel :on-color-changed="handleColorChanged" />
 *       </PopoverContent>
 *     </Popover>
 *   )
 * }
 *
 * // Advanced usage with configuration
 * function MyAdvancedColorTextPopover() {
 *   const {
 *     isVisible,
 *     activeTextStyle,
 *     activeHighlight,
 *     handleColorChanged,
 *     label,
 *     Icon,
 *   } = useColorTextPopover({
 *     editor: myEditor,
 *     hideWhenUnavailable: true,
 *     onColorChanged: ({ type, label, value }) => console.log('Color changed!', { type, label, value })
 *   })
 *
 *   if (!isVisible.value) return null
 *
 *   return (
 *     <Popover>
 *       <PopoverTrigger as-child>
 *         <Button
 *           :disabled="isDisabled"
 *           :aria-label="label"
 *         >
 *           <component :is="Icon" :style="{ color: activeTextStyle.color }" />
 *         </Button>
 *       </PopoverTrigger>
 *       <PopoverContent>
 *         <TextStyleColorPanel :on-color-changed="handleColorChanged" />
 *       </PopoverContent>
 *     </Popover>
 *   )
 * }
 * ```
 */
export function useColorTextPopover(config?: UseColorTextPopoverConfig) {
  const {
    editor: providedEditor,
    hideWhenUnavailable = false,
    onColorChanged,
  } = config || {};

  const { editor } = useTiptapEditor(providedEditor);
  const isVisible = ref(true);

  const activeTextStyle = ref<Record<string, any>>(
    getActiveMarkAttrs(editor.value, "textStyle") || {}
  );
  const activeHighlight = ref<Record<string, any>>(
    getActiveMarkAttrs(editor.value, "highlight") || {}
  );

  const canToggle =
    canColorText(editor.value) || canColorHighlight(editor.value);

  watch(
    editor,
    (currentEditor) => {
      if (!currentEditor) return;

      const updateVisibility = () => {
        isVisible.value = shouldShowColorTextPopover({
          editor: currentEditor,
          hideWhenUnavailable,
        });

        // Update active styles
        activeTextStyle.value =
          getActiveMarkAttrs(currentEditor, "textStyle") || {};
        activeHighlight.value =
          getActiveMarkAttrs(currentEditor, "highlight") || {};
      };

      updateVisibility();

      currentEditor.on("selectionUpdate", updateVisibility);

      return () => {
        currentEditor.off("selectionUpdate", updateVisibility);
      };
    },
    { immediate: true }
  );

  const handleColorChanged = ({
    type,
    label,
    value,
  }: {
    type: ColorType;
    label: string;
    value: string;
  }) => {
    onColorChanged?.({ type, label, value });
  };

  return {
    isVisible,
    canToggle,
    activeTextStyle,
    activeHighlight,
    handleColorChanged,
    label: "Text color",
    Icon: "div", // TextColorSmallIcon placeholder
  };
}
