<script setup lang="ts">
import { EditorContent, useEditor } from "@tiptap/vue-3";
import { Extension } from "@tiptap/core";

// --- Tiptap Core Extensions ---
import StarterKit from "@tiptap/starter-kit";
import { Placeholder } from "@tiptap/extensions";
import LoadingSpinner from "../../ui/LoadingSpinner.vue";
import NotionLikeEditorHeader from "./NotionLikeEditorHeader.vue";

// --- Tiptap UI ---
import SlashDropdownMenu from "../../tiptap-ui/slash-dropdown-menu/SlashDropdownMenu.vue";

// --- Lib ---

const props = defineProps<{
  placeholder: string;
}>();

// Create an extension that handles Enter for suggestion menus
const SuggestionEnterFix = Extension.create({
  name: 'suggestionEnterFix',
  priority: 2000, // Very high priority to run before default handlers

  addKeyboardShortcuts() {
    return {
      Enter: () => {
        // Call the global handler we exposed from SuggestionMenu
        const handler = (this.editor as any).__suggestionMenuEnterHandler;

        if (handler) {
          const handled = handler();

          if (handled) {
            // Suggestion menu handled the Enter key, prevent default behavior
            return true;
          }
        }

        // No active suggestion menu, allow default Enter behavior
        return false;
      },
    };
  },
});

const editor = useEditor({
  extensions: [
    SuggestionEnterFix,
    // Ai.configure({
    //   appId: TIPTAP_AI_APP_ID,
    //   token: undefined, // TODO: Add aiToken
    //   autocompletion: false,
    //   showDecorations: true,
    //   hideDecorationsOnStreamEnd: false,
    //   onLoading: (context) => {
    //     context.editor.commands.aiGenerationSetIsLoading(true);
    //     context.editor.commands.aiGenerationHasMessage(false);
    //   },
    //   onChunk: (context) => {
    //     context.editor.commands.aiGenerationSetIsLoading(true);
    //     context.editor.commands.aiGenerationHasMessage(true);
    //   },
    //   onSuccess: (context) => {
    //     const hasMessage = !!context.response;
    //     context.editor.commands.aiGenerationSetIsLoading(false);
    //     context.editor.commands.aiGenerationHasMessage(hasMessage);
    //   },
    // }),
    StarterKit.configure({
      undoRedo: false,
      dropcursor: {
        width: 2,
      },
      link: { openOnClick: false },
    }),
    Placeholder.configure({
      placeholder: props.placeholder,
      emptyEditorClass: "is-empty with-slash",
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
    <SlashDropdownMenu :editor="editor" />
  </div>
  <LoadingSpinner v-else />
</template>
