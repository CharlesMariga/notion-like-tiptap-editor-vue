import { ref, computed, watch, type MaybeRefOrGetter } from "vue";
import type { Editor } from "@tiptap/vue-3";
import { NodeSelection } from "@tiptap/pm/state";

// --- Composables ---
import { useTiptapEditor } from "@/composables/useTiptapEditor";

// --- Icons ---
import ChevronDownIcon from "@/components/tiptap-icons/ChevronDownIcon.vue";
import TypeIcon from "@/components/tiptap-icons/TypeIcon.vue";
import HeadingOneIcon from "@/components/tiptap-icons/HeadingOneIcon.vue";
import HeadingTwoIcon from "@/components/tiptap-icons/HeadingTwoIcon.vue";
import HeadingThreeIcon from "@/components/tiptap-icons/HeadingThreeIcon.vue";
import ListIcon from "@/components/tiptap-icons/ListIcon.vue";
import ListOrderedIcon from "@/components/tiptap-icons/ListOrderedIcon.vue";
import ListTodoIcon from "@/components/tiptap-icons/ListTodoIcon.vue";
import BlockquoteIcon from "@/components/tiptap-icons/BlockquoteIcon.vue";
import CodeBlockIcon from "@/components/tiptap-icons/CodeBlockIcon.vue";

// --- Tiptap UI ---
import type { Level } from "@/components/tiptap-ui/heading-button";

export const TURN_INTO_BLOCKS = [
  "paragraph",
  "heading",
  "bulletList",
  "orderedList",
  "taskList",
  "blockquote",
  "codeBlock",
];

/**
 * Configuration for the turn into dropdown functionality
 */
export interface UseTurnIntoDropdownConfig {
  /**
   * The Tiptap editor instance.
   */
  editor?: MaybeRefOrGetter<Editor | null | undefined>;
  /**
   * Whether the dropdown should hide when no options are available.
   * @default false
   */
  hideWhenUnavailable?: boolean;
  /**
   * Which block types to show in the dropdown
   * @default ["paragraph", "heading", "bulletList", "orderedList", "taskList", "blockquote", "codeBlock"]
   */
  blockTypes?: string[];
  /**
   * Callback function called when the dropdown state changes.
   */
  onOpenChange?: (isOpen: boolean) => void;
}

export const blockTypeOptions = [
  {
    type: "paragraph",
    label: "Text",
    icon: TypeIcon,
    isActive: (editor: Editor) =>
      editor.isActive("paragraph") &&
      !editor.isActive("heading") &&
      !editor.isActive("bulletList") &&
      !editor.isActive("orderedList") &&
      !editor.isActive("taskList") &&
      !editor.isActive("blockquote") &&
      !editor.isActive("codeBlock"),
  },
  {
    type: "heading",
    label: "Heading 1",
    level: 1 as Level,
    icon: HeadingOneIcon,
    isActive: (editor: Editor) => editor.isActive("heading", { level: 1 }),
  },
  {
    type: "heading",
    label: "Heading 2",
    level: 2 as Level,
    icon: HeadingTwoIcon,
    isActive: (editor: Editor) => editor.isActive("heading", { level: 2 }),
  },
  {
    type: "heading",
    label: "Heading 3",
    level: 3 as Level,
    icon: HeadingThreeIcon,
    isActive: (editor: Editor) => editor.isActive("heading", { level: 3 }),
  },
  {
    type: "bulletList",
    label: "Bulleted list",
    icon: ListIcon,
    isActive: (editor: Editor) => editor.isActive("bulletList"),
  },
  {
    type: "orderedList",
    label: "Numbered list",
    icon: ListOrderedIcon,
    isActive: (editor: Editor) => editor.isActive("orderedList"),
  },
  {
    type: "taskList",
    label: "To-do list",
    icon: ListTodoIcon,
    isActive: (editor: Editor) => editor.isActive("taskList"),
  },
  {
    type: "blockquote",
    label: "Blockquote",
    icon: BlockquoteIcon,
    isActive: (editor: Editor) => editor.isActive("blockquote"),
  },
  {
    type: "codeBlock",
    label: "Code block",
    icon: CodeBlockIcon,
    isActive: (editor: Editor) => editor.isActive("codeBlock"),
  },
];

/**
 * Checks if turn into functionality can be used in the current editor state
 */
export function canTurnInto(
  editor: Editor | null,
  allowedBlockTypes?: string[]
): boolean {
  if (!editor || !editor.isEditable) return false;

  const blockTypes = allowedBlockTypes || TURN_INTO_BLOCKS;
  const { selection } = editor.state;

  if (selection instanceof NodeSelection) {
    const nodeType = selection.node.type.name;
    return blockTypes.includes(nodeType);
  }

  const { $anchor } = selection;
  const nodeType = $anchor.parent.type.name;
  return blockTypes.includes(nodeType);
}

/**
 * Gets filtered block type options based on available types
 */
export function getFilteredBlockTypeOptions(blockTypes?: string[]) {
  if (!blockTypes) return blockTypeOptions;

  return blockTypeOptions.filter((option) => {
    return blockTypes.includes(option.type);
  });
}

/**
 * Gets the currently active block type from the available options
 */
export function getActiveBlockType(
  editor: Editor | null,
  blockTypes?: string[]
) {
  if (!editor) return getFilteredBlockTypeOptions(blockTypes)[0];

  const filteredOptions = getFilteredBlockTypeOptions(blockTypes);
  const activeOption = filteredOptions.find((option) =>
    option.isActive(editor)
  );
  return activeOption || filteredOptions[0];
}

/**
 * Determines if the turn into dropdown should be visible
 */
export function shouldShowTurnInto(params: {
  editor: Editor | null;
  hideWhenUnavailable: boolean;
  blockTypes?: string[];
}): boolean {
  const { editor, hideWhenUnavailable, blockTypes } = params;

  if (!editor) {
    return false;
  }

  if (hideWhenUnavailable && !editor.isActive("code")) {
    return canTurnInto(editor, blockTypes);
  }

  return true;
}

/**
 * Vue composable that provides turn into dropdown functionality for Tiptap editor
 *
 * @example
 * ```ts
 * // Simple usage
 * function MyTurnIntoDropdown() {
 *   const {
 *     isVisible,
 *     canToggle,
 *     activeBlockType,
 *     handleOpenChange,
 *     label,
 *     Icon,
 *   } = useTurnIntoDropdown()
 *
 *   if (!isVisible.value) return null
 *
 *   return (
 *     <DropdownMenu @update:open="handleOpenChange">
 *       // dropdown content
 *     </DropdownMenu>
 *   )
 * }
 *
 * // Advanced usage with configuration
 * function MyAdvancedTurnIntoDropdown() {
 *   const {
 *     isVisible,
 *     activeBlockType,
 *   } = useTurnIntoDropdown({
 *     editor: myEditor,
 *     blockTypes: ["paragraph", "heading", "bulletList"],
 *     hideWhenUnavailable: true,
 *     onOpenChange: (isOpen) => console.log("Dropdown toggled", isOpen),
 *   })
 *
 *   // component implementation
 * }
 * ```
 */
export function useTurnIntoDropdown(config?: UseTurnIntoDropdownConfig) {
  const {
    editor: providedEditor,
    hideWhenUnavailable = false,
    blockTypes,
    onOpenChange,
  } = config || {};

  const { editor } = useTiptapEditor(providedEditor);
  const isOpen = ref(false);
  const isVisible = ref(true);

  const canToggle = computed(() => canTurnInto(editor.value, blockTypes));
  const activeBlockType = computed(() =>
    getActiveBlockType(editor.value, blockTypes)
  );
  const filteredOptions = computed(() =>
    getFilteredBlockTypeOptions(blockTypes)
  );
  const label = computed(
    () => `Turn into (current: ${activeBlockType.value?.label || "Text"})`
  );

  const handleOpenChange = (open: boolean) => {
    if (!editor.value || !canToggle.value) return;
    isOpen.value = open;
    onOpenChange?.(open);
  };

  const setIsOpen = (open: boolean) => {
    isOpen.value = open;
  };

  // Watch for editor selection changes to update visibility
  watch(
    editor,
    (currentEditor) => {
      if (!currentEditor) return;

      const handleSelectionUpdate = () => {
        isVisible.value = shouldShowTurnInto({
          editor: currentEditor,
          hideWhenUnavailable,
          blockTypes,
        });
      };

      handleSelectionUpdate();
      currentEditor.on("selectionUpdate", handleSelectionUpdate);

      return () => {
        currentEditor.off("selectionUpdate", handleSelectionUpdate);
      };
    },
    { immediate: true }
  );

  return {
    isVisible,
    canToggle,
    isOpen,
    setIsOpen,
    activeBlockType,
    handleOpenChange,
    filteredOptions,
    label,
    Icon: ChevronDownIcon,
  };
}
