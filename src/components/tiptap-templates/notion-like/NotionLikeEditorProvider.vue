<script setup lang="ts">
import { EditorContent, useEditor } from "@tiptap/vue-3";
import { Extension } from "@tiptap/core";
import LoadingSpinner from "../../ui/LoadingSpinner.vue";

// --- Tiptap Core Extensions ---
import StarterKit from "@tiptap/starter-kit";
import { Placeholder } from "@tiptap/extensions";
import { TextAlign } from "@tiptap/extension-text-align";
import { Ai } from "@tiptap-pro/extension-ai";
import type { Editor } from "@tiptap/core";

// --- Tiptap UI ---
import SlashDropdownMenu from "../../tiptap-ui/slash-dropdown-menu/SlashDropdownMenu.vue";
import EmojiDropdown from "@/components/tiptap-ui/emoji-dropdown/EmojiDropdown.vue";
import Emoji, { gitHubEmojis } from "@tiptap/extension-emoji";

// --- Lib ---

// --- Content ---
import NotionLikeEditorHeader from "./NotionLikeEditorHeader.vue";
import NotionLikeEditorToolbarFloating from "./NotionLikeEditorToolbarFloating.vue";
import { TIPTAP_AI_APP_ID, TIPTAP_AI_TOKEN } from "@/lib/tiptap-collab-utils";

const props = defineProps<{
  placeholder: string;
}>();

// Create an extension that handles Enter for suggestion menus
const SuggestionEnterFix = Extension.create({
  name: "suggestionEnterFix",
  priority: 2000, // Very high priority to run before default handlers

  addKeyboardShortcuts() {
    return {
      Enter: () => {
        // Check all registered handlers from all SuggestionMenu instances
        const handlers = (this.editor as any).__suggestionMenuEnterHandlers;

        if (handlers instanceof Map) {
          // Try each handler until one handles the Enter key
          for (const handler of handlers.values()) {
            const handled = handler();
            if (handled) {
              // Suggestion menu handled the Enter key, prevent default behavior
              return true;
            }
          }
        }

        // No active suggestion menu, allow default Enter behavior
        return false;
      },
    };
  },
});

// Declare custom commands and storage for TypeScript
declare module "@tiptap/core" {
  interface Commands<ReturnType> {
    aiGenerationState: {
      aiGenerationSetIsLoading: (isLoading: boolean) => ReturnType;
      aiGenerationHasMessage: (hasMessage: boolean) => ReturnType;
    };
  }

  interface Storage {
    aiGenerationState: {
      isLoading: boolean;
      hasMessage: boolean;
    };
  }
}

// Create an extension to track AI generation state
const AiGenerationState = Extension.create({
  name: "aiGenerationState",

  addCommands() {
    return {
      aiGenerationSetIsLoading:
        (isLoading: boolean) =>
        ({ editor }: { editor: Editor }) => {
          editor.storage.aiGenerationState = {
            ...editor.storage.aiGenerationState,
            isLoading,
          };
          return true;
        },
      aiGenerationHasMessage:
        (hasMessage: boolean) =>
        ({ editor }: { editor: Editor }) => {
          editor.storage.aiGenerationState = {
            ...editor.storage.aiGenerationState,
            hasMessage,
          };
          return true;
        },
    };
  },

  addStorage() {
    return {
      isLoading: false,
      hasMessage: false,
    };
  },
});

const editor = useEditor({
  editorProps: {
    attributes: {
      class: "notion-like-editor",
    },
  },
  extensions: [
    SuggestionEnterFix,
    AiGenerationState,
    Ai.configure({
      appId: TIPTAP_AI_APP_ID,
      token: TIPTAP_AI_TOKEN,
      autocompletion: false,
      showDecorations: true,
      hideDecorationsOnStreamEnd: false,
      onLoading: (context) => {
        context.editor.commands.aiGenerationSetIsLoading(true);
        context.editor.commands.aiGenerationHasMessage(false);
      },
      onChunk: (context) => {
        context.editor.commands.aiGenerationSetIsLoading(true);
        context.editor.commands.aiGenerationHasMessage(true);
      },
      onSuccess: (context) => {
        const hasMessage = !!context.response;
        context.editor.commands.aiGenerationSetIsLoading(false);
        context.editor.commands.aiGenerationHasMessage(hasMessage);
      },
    }),
    Emoji.configure({
      emojis: gitHubEmojis.filter((emoji) => !emoji.name.includes("regional")),
      forceFallbackImages: true,
      suggestion: {
        // Use a different char to avoid conflict with our custom EmojiDropdown
        char: "§", // Using a character that won't be typed normally
        render: () => {
          return {
            onStart: () => {},
            onUpdate: () => {},
            onKeyDown: () => false,
            onExit: () => {},
          };
        },
      },
    }),
    Placeholder.configure({
      placeholder: props.placeholder,
      emptyEditorClass: "is-empty with-slash",
    }),
    StarterKit.configure({
      undoRedo: false,
      dropcursor: {
        width: 2,
      },
      link: { openOnClick: false },
    }),
    TextAlign.configure({
      types: ["heading", "paragraph"],
    }),
  ],
});
</script>

<template>
  <div v-if="editor" class="notion-like-editor-wrapper">
    <NotionLikeEditorHeader />
    <EditorContent
      :editor="editor"
      role="presentation"
      class="notion-like-editor-content"
    />
    <EmojiDropdown :editor="editor" />
    <SlashDropdownMenu :editor="editor" />
    <NotionLikeEditorToolbarFloating :editor="editor" />
  </div>
  <LoadingSpinner v-else />
</template>
