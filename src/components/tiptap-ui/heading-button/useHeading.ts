import { ref, computed, watch, type MaybeRefOrGetter } from "vue";
import { onKeyStroke } from "@vueuse/core";
import type { Editor } from "@tiptap/vue-3";
import { NodeSelection, TextSelection } from "@tiptap/pm/state";

// --- Composables ---
import { useTiptapEditor } from "@/composables/useTiptapEditor";
import { useIsMobile } from "@/composables/useIsMobile";

// --- Lib ---
import {
  findNodePosition,
  isNodeInSchema,
  isNodeTypeSelected,
  isValidPosition,
} from "@/lib/tiptap-utils";

// --- Icons ---
import HeadingOneIcon from "@/components/tiptap-icons/HeadingOneIcon.vue";
import HeadingTwoIcon from "@/components/tiptap-icons/HeadingTwoIcon.vue";
import HeadingThreeIcon from "@/components/tiptap-icons/HeadingThreeIcon.vue";
import HeadingFourIcon from "@/components/tiptap-icons/HeadingFourIcon.vue";
import HeadingFiveIcon from "@/components/tiptap-icons/HeadingFiveIcon.vue";
import HeadingSixIcon from "@/components/tiptap-icons/HeadingSixIcon.vue";

export type Level = 1 | 2 | 3 | 4 | 5 | 6;

/**
 * Configuration for the heading functionality
 */
export interface UseHeadingConfig {
  /**
   * The Tiptap editor instance.
   */
  editor?: MaybeRefOrGetter<Editor | null | undefined>;
  /**
   * The heading level.
   */
  level: Level;
  /**
   * Whether the button should hide when heading is not available.
   * @default false
   */
  hideWhenUnavailable?: boolean;
  /**
   * Callback function called after a successful heading toggle.
   */
  onToggled?: () => void;
}

export const headingIcons = {
  1: HeadingOneIcon,
  2: HeadingTwoIcon,
  3: HeadingThreeIcon,
  4: HeadingFourIcon,
  5: HeadingFiveIcon,
  6: HeadingSixIcon,
};

export const HEADING_SHORTCUT_KEYS: Record<Level, string> = {
  1: "ctrl+alt+1",
  2: "ctrl+alt+2",
  3: "ctrl+alt+3",
  4: "ctrl+alt+4",
  5: "ctrl+alt+5",
  6: "ctrl+alt+6",
};

/**
 * Checks if heading can be toggled in the current editor state
 */
export function canToggle(
  editor: Editor | null,
  level?: Level,
  turnInto: boolean = true
): boolean {
  if (!editor || !editor.isEditable) return false;
  if (
    !isNodeInSchema("heading", editor) ||
    isNodeTypeSelected(editor, ["image"])
  )
    return false;

  if (!turnInto) {
    return level
      ? editor.can().setNode("heading", { level })
      : editor.can().setNode("heading");
  }

  try {
    const view = editor.view;
    const state = view.state;
    const selection = state.selection;

    if (selection.empty || selection instanceof TextSelection) {
      const pos = findNodePosition({
        editor,
        node: state.selection.$anchor.node(1),
      })?.pos;
      if (!isValidPosition(pos)) return false;
    }

    return true;
  } catch {
    return false;
  }
}

/**
 * Checks if heading is currently active
 */
export function isHeadingActive(
  editor: Editor | null,
  level?: Level | Level[]
): boolean {
  if (!editor || !editor.isEditable) return false;

  if (Array.isArray(level)) {
    return level.some((l) => editor.isActive("heading", { level: l }));
  }

  return level
    ? editor.isActive("heading", { level })
    : editor.isActive("heading");
}

/**
 * Toggles heading in the editor
 */
export function toggleHeading(
  editor: Editor | null,
  level: Level | Level[]
): boolean {
  if (!editor || !editor.isEditable) return false;

  const levels = Array.isArray(level) ? level : [level];
  const toggleLevel = levels.find((l) => canToggle(editor, l));

  if (!toggleLevel) return false;

  try {
    const view = editor.view;
    let state = view.state;
    let tr = state.tr;

    // No selection, find the cursor position
    if (state.selection.empty || state.selection instanceof TextSelection) {
      const pos = findNodePosition({
        editor,
        node: state.selection.$anchor.node(1),
      })?.pos;
      if (!isValidPosition(pos)) return false;

      tr = tr.setSelection(NodeSelection.create(state.doc, pos));
      view.dispatch(tr);
      state = view.state;
    }

    const selection = state.selection;
    let chain = editor.chain().focus();

    // Handle NodeSelection
    if (selection instanceof NodeSelection) {
      const firstChild = selection.node.firstChild?.firstChild;
      const lastChild = selection.node.lastChild?.lastChild;

      const from = firstChild
        ? selection.from + firstChild.nodeSize
        : selection.from + 1;

      const to = lastChild
        ? selection.to - lastChild.nodeSize
        : selection.to - 1;

      chain = chain.setTextSelection({ from, to }).clearNodes();
    }

    const isActive = levels.some((l) =>
      editor.isActive("heading", { level: l })
    );

    const toggle = isActive
      ? chain.setNode("paragraph")
      : chain.setNode("heading", { level: toggleLevel });

    toggle.run();

    editor.chain().focus().selectTextblockEnd().run();

    return true;
  } catch {
    return false;
  }
}

/**
 * Determines if the heading button should be shown
 */
export function shouldShowButton(props: {
  editor: Editor | null;
  level?: Level | Level[];
  hideWhenUnavailable: boolean;
}): boolean {
  const { editor, level, hideWhenUnavailable } = props;

  if (!editor || !editor.isEditable) return false;
  if (!isNodeInSchema("heading", editor)) return false;

  if (hideWhenUnavailable && !editor.isActive("code")) {
    if (Array.isArray(level)) {
      return level.some((l) => canToggle(editor, l));
    }
    return canToggle(editor, level);
  }

  return true;
}

/**
 * Helper function to parse shortcut string for keyboard event matching
 */
function parseShortcut(shortcut: string) {
  const parts = shortcut.toLowerCase().split("+");
  const key = parts[parts.length - 1] || "";

  return {
    key: key.toUpperCase(),
    alt: parts.includes("alt"),
    shift: parts.includes("shift"),
    ctrl: parts.includes("ctrl") || parts.includes("control"),
    meta: parts.includes("meta") || parts.includes("mod"),
  };
}

/**
 * Vue composable that provides heading functionality for Tiptap editor
 *
 * @example
 * ```ts
 * // Simple usage
 * function MySimpleHeadingButton() {
 *   const { isVisible, isActive, handleToggle, Icon } = useHeading({ level: 1 })
 *
 *   if (!isVisible.value) return null
 *
 *   return (
 *     <button
 *       @click="handleToggle"
 *       :aria-pressed="isActive"
 *     >
 *       <Icon />
 *       Heading 1
 *     </button>
 *   )
 * }
 *
 * // Advanced usage with configuration
 * function MyAdvancedHeadingButton() {
 *   const { isVisible, isActive, handleToggle, label, Icon } = useHeading({
 *     level: 2,
 *     editor: myEditor,
 *     hideWhenUnavailable: true,
 *     onToggled: (isActive) => console.log('Heading toggled:', isActive)
 *   })
 *
 *   if (!isVisible.value) return null
 *
 *   return (
 *     <MyButton
 *       @click="handleToggle"
 *       :aria-label="label"
 *       :aria-pressed="isActive"
 *     >
 *       <Icon />
 *       Toggle Heading 2
 *     </MyButton>
 *   )
 * }
 * ```
 */
export function useHeading(config: UseHeadingConfig) {
  const {
    editor: providedEditor,
    level,
    hideWhenUnavailable = false,
    onToggled,
  } = config;

  const { editor } = useTiptapEditor(providedEditor);
  const isMobile = useIsMobile();
  const isVisible = ref(true);

  const canToggleState = computed(() => canToggle(editor.value ?? null, level));
  const isActive = computed(() => isHeadingActive(editor.value ?? null, level));

  const handleToggle = () => {
    if (!editor.value) return false;

    const success = toggleHeading(editor.value, level);
    if (success) {
      onToggled?.();
    }
    return success;
  };

  // Watch for editor selection changes to update visibility
  watch(
    editor,
    (currentEditor, _, onCleanup) => {
      if (!currentEditor) return;

      const handleSelectionUpdate = () => {
        isVisible.value = shouldShowButton({
          editor: currentEditor,
          level,
          hideWhenUnavailable,
        });
      };

      handleSelectionUpdate();

      currentEditor.on("selectionUpdate", handleSelectionUpdate);
      onCleanup(() => {
        currentEditor.off("selectionUpdate", handleSelectionUpdate);
      });
    },
    { immediate: true }
  );

  // Keyboard shortcut handling
  const shortcut = parseShortcut(HEADING_SHORTCUT_KEYS[level]);
  onKeyStroke(shortcut.key, (event) => {
    const modifierPressed = shortcut.meta
      ? event.metaKey || event.ctrlKey
      : shortcut.ctrl
      ? event.ctrlKey
      : false;

    if (
      shortcut.alt === event.altKey &&
      shortcut.shift === event.shiftKey &&
      modifierPressed
    ) {
      if (isVisible.value && canToggleState.value && !isMobile.value) {
        event.preventDefault();
        handleToggle();
      }
    }
  });

  return {
    isVisible,
    isActive,
    handleToggle,
    canToggle: canToggleState,
    label: `Heading ${level}`,
    shortcutKeys: HEADING_SHORTCUT_KEYS[level],
    Icon: headingIcons[level],
  };
}
