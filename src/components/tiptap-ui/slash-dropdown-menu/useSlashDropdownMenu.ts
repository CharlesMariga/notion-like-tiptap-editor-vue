// --- Icons ---
import { markRaw } from "vue";
import type { Editor } from "@tiptap/vue-3";
import AiSparklesIcon from "../../tiptap-icons/AiSparklesIcon.vue";
import AtSignIcon from "../../tiptap-icons/AtSignIcon.vue";
import BlockquoteIcon from "../../tiptap-icons/BlockquoteIcon.vue";
import CodeBlockIcon from "../../tiptap-icons/CodeBlockIcon.vue";
import HeadingOneIcon from "../../tiptap-icons/HeadingOneIcon.vue";
import HeadingThreeIcon from "../../tiptap-icons/HeadingThreeIcon.vue";
import HeadingTwoIcon from "../../tiptap-icons/HeadingTwoIcon.vue";
import ImageIcon from "../../tiptap-icons/ImageIcon.vue";
import ListIcon from "../../tiptap-icons/ListIcon.vue";
import ListOrderedIcon from "../../tiptap-icons/ListOrderedIcon.vue";
import ListTodoIcon from "../../tiptap-icons/ListTodoIcon.vue";
import MinusIcon from "../../tiptap-icons/MinusIcon.vue";
import SmilePlusIcon from "../../tiptap-icons/SmilePlusIcon.vue";
import TypeIcon from "../../tiptap-icons/TypeIcon.vue";

// --- Lib ---
import {
  findSelectionPosition,
  hasContentAbove,
} from "../../../lib/tiptap-advanced-utils";

// --- Tiptap UI ---
import type { SuggestionItem } from "../../tiptap-ui-utils/suggestion-menu/suggestion-menu-types";
import {
  isExtensionAvailable,
  isNodeInSchema,
} from "../../../lib/tiptap-utils";
import { addMentionTrigger } from "../mention-trigger-button/use-mention-trigger";
import { addEmojiTrigger } from "../emoji-trigger-button/use-emoji-trigger";

const texts = {
  // AI
  continue_writing: {
    title: "Continue Writing",
    subtext: "Continue writing from the current position",
    keywords: ["continue", "write", "continue writing", "ai"],
    badge: markRaw(AiSparklesIcon),
    group: "AI",
  },
  ai_ask_button: {
    title: "Ask AI",
    subtext: "Ask AI to generate content",
    keywords: ["ai", "ask", "generate"],
    badge: markRaw(AiSparklesIcon),
    group: "AI",
  },

  // Style
  text: {
    title: "Text",
    subtext: "Regular text paragraph",
    keywords: ["p", "paragraph", "text"],
    badge: markRaw(TypeIcon),
    group: "Style",
  },
  heading_1: {
    title: "Heading 1",
    subtext: "Top-level heading",
    keywords: ["h", "heading1", "h1"],
    badge: markRaw(HeadingOneIcon),
    group: "Style",
  },
  heading_2: {
    title: "Heading 2",
    subtext: "Key section heading",
    keywords: ["h2", "heading2", "subheading"],
    badge: markRaw(HeadingTwoIcon),
    group: "Style",
  },
  heading_3: {
    title: "Heading 3",
    subtext: "Subsection and group heading",
    keywords: ["h3", "heading3", "subheading"],
    badge: markRaw(HeadingThreeIcon),
    group: "Style",
  },
  bullet_list: {
    title: "Bullet List",
    subtext: "List with unordered items",
    keywords: ["ul", "li", "list", "bulletlist", "bullet list"],
    badge: markRaw(ListIcon),
    group: "Style",
  },
  ordered_list: {
    title: "Numbered List",
    subtext: "List with ordered items",
    keywords: ["ol", "li", "list", "numberedlist", "numbered list"],
    badge: markRaw(ListOrderedIcon),
    group: "Style",
  },
  task_list: {
    title: "To-do list",
    subtext: "List with tasks",
    keywords: ["tasklist", "task list", "todo", "checklist"],
    badge: markRaw(ListTodoIcon),
    group: "Style",
  },
  quote: {
    title: "Blockquote",
    subtext: "Blockquote block",
    keywords: ["quote", "blockquote"],
    badge: markRaw(BlockquoteIcon),
    group: "Style",
  },
  code_block: {
    title: "Code Block",
    subtext: "Code block with syntax highlighting",
    keywords: ["code", "pre"],
    badge: markRaw(CodeBlockIcon),
    group: "Style",
  },

  // Insert
  mention: {
    title: "Mention",
    subtext: "Mention a user or item",
    keywords: ["mention", "user", "item", "tag"],
    badge: markRaw(AtSignIcon),
    group: "Insert",
  },
  emoji: {
    title: "Emoji",
    subtext: "Insert an emoji",
    keywords: ["emoji", "emoticon", "smiley"],
    badge: markRaw(SmilePlusIcon),
    group: "Insert",
  },
  divider: {
    title: "Separator",
    subtext: "Horizontal line to separate content",
    keywords: ["hr", "horizontalRule", "line", "separator"],
    badge: markRaw(MinusIcon),
    group: "Insert",
  },

  // Upload
  image: {
    title: "Image",
    subtext: "Resizable image with caption",
    keywords: [
      "image",
      "imageUpload",
      "upload",
      "img",
      "picture",
      "media",
      "url",
    ],
    badge: markRaw(ImageIcon),
    group: "Upload",
  },
};

export type SlashMenuItemType = keyof typeof texts;

export interface SlashMenuConfig {
  enabledItems?: SlashMenuItemType[];
  customItems?: SuggestionItem[];
  itemGroups?: {
    [key in SlashMenuItemType]?: string;
  };
  showGroups?: boolean;
}

function getItemImplementations() {
  return {
    // AI
    continue_writing: {
      check: (editor: Editor) => {
        const { hasContent } = hasContentAbove(editor);
        const extensionsReady = isExtensionAvailable(editor, [
          "ai",
          "aiAdvanced",
        ]);
        return extensionsReady && hasContent;
      },
      action: ({ editor }: { editor: Editor }) => {
        const editorChain = editor.chain().focus();

        const nodeSelectionPosition = findSelectionPosition({ editor });

        if (nodeSelectionPosition !== null) {
          editorChain.setNodeSelection(nodeSelectionPosition);
        }

        editorChain.run();

        // TODO: Add aiGenerationShow
        // editor.chain().focus().aiGenerationShow().run();

        requestAnimationFrame(() => {
          const { hasContent, content } = hasContentAbove(editor);

          const snippet =
            content.length > 500 ? `...${content.slice(-500)}` : content;

          // TODO: Add aiTextPrompt
          // const prompt = hasContent
          //   ? `Context: ${snippet}\n\nContinue writing from where the text above ends. Write ONLY ONE SENTENCE. DONT REPEAT THE TEXT.`
          //   : "Start writing a new paragraph. Write ONLY ONE SENTENCE.";
          // editor
          //   .chain()
          //   .focus()
          //   .aiTextPrompt({
          //     stream: true,
          //     format: "rich-text",
          //     text: prompt,
          //   })
          //   .run();

          // Placeholder until aiTextPrompt is implemented
          console.log("AI prompt would use:", hasContent ? snippet : "new content");
        });
      },
    },
    ai_ask_button: {
      check: (editor: Editor) =>
        isExtensionAvailable(editor, ["ai", "aiAdvanced"]),
      action: ({ editor }: { editor: Editor }) => {
        const editorChain = editor.chain().focus();

        const nodeSelectionPosition = findSelectionPosition({ editor });

        if (nodeSelectionPosition !== null) {
          editorChain.setNodeSelection(nodeSelectionPosition);
        }

        editorChain.run();

        // TODO: Add aiGenerationShow
        // editor.chain().focus().aiGenerationShow().run();
      },
    },

    // Style
    text: {
      check: (editor: Editor) => isNodeInSchema("paragraph", editor),
      action: ({ editor }: { editor: Editor }) => {
        editor.chain().focus().setParagraph().run();
      },
    },
    heading_1: {
      check: (editor: Editor) => isNodeInSchema("heading", editor),
      action: ({ editor }: { editor: Editor }) => {
        editor.chain().focus().toggleHeading({ level: 1 }).run();
      },
    },
    heading_2: {
      check: (editor: Editor) => isNodeInSchema("heading", editor),
      action: ({ editor }: { editor: Editor }) => {
        editor.chain().focus().toggleHeading({ level: 2 }).run();
      },
    },
    heading_3: {
      check: (editor: Editor) => isNodeInSchema("heading", editor),
      action: ({ editor }: { editor: Editor }) => {
        editor.chain().focus().toggleHeading({ level: 3 }).run();
      },
    },
    bullet_list: {
      check: (editor: Editor) => isNodeInSchema("bulletList", editor),
      action: ({ editor }: { editor: Editor }) => {
        editor.chain().focus().toggleBulletList().run();
      },
    },
    ordered_list: {
      check: (editor: Editor) => isNodeInSchema("orderedList", editor),
      action: ({ editor }: { editor: Editor }) => {
        editor.chain().focus().toggleOrderedList().run();
      },
    },
    task_list: {
      check: (editor: Editor) => isNodeInSchema("taskList", editor),
      action: ({ editor }: { editor: Editor }) => {
        editor.chain().focus().toggleTaskList().run();
      },
    },
    quote: {
      check: (editor: Editor) => isNodeInSchema("blockquote", editor),
      action: ({ editor }: { editor: Editor }) => {
        editor.chain().focus().toggleBlockquote().run();
      },
    },
    code_block: {
      check: (editor: Editor) => isNodeInSchema("codeBlock", editor),
      action: ({ editor }: { editor: Editor }) => {
        editor.chain().focus().toggleNode("codeBlock", "paragraph").run();
      },
    },

    // Insert
    mention: {
      check: (editor: Editor) =>
        isExtensionAvailable(editor, ["mention", "mentionAdvanced"]),
      action: ({ editor }: { editor: Editor }) => addMentionTrigger(editor),
    },
    emoji: {
      check: (editor: Editor) =>
        isExtensionAvailable(editor, ["emoji", "emojiPicker"]),
      action: ({ editor }: { editor: Editor }) => addEmojiTrigger(editor),
    },
    divider: {
      check: (editor: Editor) => isNodeInSchema("horizontalRule", editor),
      action: ({ editor }: { editor: Editor }) => {
        editor.chain().focus().setHorizontalRule().run();
      },
    },

    // Upload
    image: {
      check: (editor: Editor) => isNodeInSchema("image", editor),
      action: ({ editor }: { editor: Editor }) => {
        editor
          .chain()
          .focus()
          .insertContent({
            type: "imageUpload",
          })
          .run();
      },
    },
  };
}

function organizeItemsByGroups(
  items: SuggestionItem[],
  showGroups: boolean
): SuggestionItem[] {
  if (!showGroups) {
    return items.map((item) => ({ ...item, group: "" }));
  }

  const groups: { [groupLabel: string]: SuggestionItem[] } = {};

  // Group items
  items.forEach((item) => {
    const groupLabel = item.group || "";
    if (!groups[groupLabel]) {
      groups[groupLabel] = [];
    }
    groups[groupLabel].push(item);
  });

  // Flatten groups in order (this maintains the visual order for keyboard navigation)
  const organizedItems: SuggestionItem[] = [];
  Object.entries(groups).forEach(([, groupItems]) => {
    organizedItems.push(...groupItems);
  });

  return organizedItems;
}

export function useSlashDropdownMenu(config?: SlashMenuConfig) {
  function getSlashMenuItems(editor: Editor) {
    const items: SuggestionItem[] = [];

    const enabledItems =
      config?.enabledItems || (Object.keys(texts) as SlashMenuItemType[]);
    const showGroups = config?.showGroups !== false;

    const itemImplementations = getItemImplementations();

    enabledItems.forEach((itemType) => {
      const itemImpl = itemImplementations[itemType];
      const itemText = texts[itemType];

      if (itemImpl && itemText && itemImpl.check(editor)) {
        const item: SuggestionItem = {
          onSelect: ({ editor }) => itemImpl.action({ editor }),
          ...itemText,
        };

        if (config?.itemGroups?.[itemType]) {
          item.group = config.itemGroups[itemType];
        } else if (!showGroups) {
          item.group = "";
        }

        items.push(item);
      }
    });

    if (config?.customItems) {
      items.push(...config.customItems);
    }

    // Reorganize items by groups to ensure keyboard navigation works correctly
    return organizeItemsByGroups(items, showGroups);
  }

  return { getSlashMenuItems, config };
}
