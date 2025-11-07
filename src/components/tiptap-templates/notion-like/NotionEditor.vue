<script setup lang="ts">
import { ref, computed, watch, onBeforeUnmount, provide, type MaybeRef } from "vue";
import { EditorContent, Editor } from "@tiptap/vue-3";
import { StarterKit } from "@tiptap/starter-kit";
import { Mention } from "@tiptap/extension-mention";
import { TaskList } from "@tiptap/extension-task-list";
import { TaskItem } from "@tiptap/extension-task-item";
import { Color } from "@tiptap/extension-color";
import { TextStyle } from "@tiptap/extension-text-style";
import { Placeholder } from "@tiptap/extension-placeholder";
import { Collaboration, isChangeOrigin } from "@tiptap/extension-collaboration";
import { CollaborationCaret } from "@tiptap/extension-collaboration-caret";
import { Typography } from "@tiptap/extension-typography";
import { Highlight } from "@tiptap/extension-highlight";
import { Superscript } from "@tiptap/extension-superscript";
import { Subscript } from "@tiptap/extension-subscript";
import { TextAlign } from "@tiptap/extension-text-align";
import { Mathematics } from "@tiptap/extension-mathematics";
import { UniqueID } from "@tiptap/extension-unique-id";
import { Emoji, gitHubEmojis } from "@tiptap/extension-emoji";
import { Ai } from "@tiptap-pro/extension-ai";

// Custom Extensions
import { HorizontalRule } from "@/components/tiptap-node/horizontal-rule-node/horizontal-rule-node-extension";
import { UiState } from "@/components/tiptap-extension/ui-state-extension";
import { Image } from "@/components/tiptap-node/image-node/image-node-extension";
import { ImageUploadNode } from "@/components/tiptap-node/image-upload-node/image-upload-node-extension";

// Composables
import { useUiEditorState } from "@/composables/useUiEditorState";
import { useScrollToHash } from "@/composables/useScrollToHash";

// Contexts
import { useUser } from "@/contexts/user-context";
import { useCollab } from "@/contexts/collab-context";
import { useAi } from "@/contexts/ai-context";

// UI Components
import EmojiDropdownMenu from "@/components/tiptap-ui/emoji-dropdown-menu/EmojiDropdownMenu.vue";
import MentionDropdownMenu from "@/components/tiptap-ui/mention-dropdown-menu/MentionDropdownMenu.vue";
import SlashDropdownMenu from "@/components/tiptap-ui/slash-dropdown-menu/SlashDropdownMenu.vue";
import AiMenu from "@/components/tiptap-ui/ai-menu/AiMenu.vue";
import DragContextMenu from "@/components/tiptap-ui/drag-context-menu/DragContextMenu.vue";
import NotionEditorHeader from "./NotionEditorHeader.vue";
import NotionEditorFloatingToolbar from "./NotionEditorFloatingToolbar.vue";
import NotionEditorMobileToolbar from "./NotionEditorMobileToolbar.vue";

// Utils
import { handleImageUpload, MAX_FILE_SIZE } from "@/lib/tiptap-utils";
import { TIPTAP_AI_APP_ID } from "@/lib/tiptap-collab-utils";
import defaultContent from "./data/content.json";

// Styles
import "@/components/tiptap-node/blockquote-node/blockquote-node.scss";
import "@/components/tiptap-node/code-block-node/code-block-node.scss";
import "@/components/tiptap-node/horizontal-rule-node/horizontal-rule-node.scss";
import "@/components/tiptap-node/list-node/list-node.scss";
import "@/components/tiptap-node/image-node/image-node.scss";
import "@/components/tiptap-node/heading-node/heading-node.scss";
import "@/components/tiptap-node/paragraph-node/paragraph-node.scss";
import "./notion-like-editor.scss";

interface NotionEditorProps {
  room: string;
  placeholder?: string;
}

const props = withDefaults(defineProps<NotionEditorProps>(), {
  placeholder: "Start writing...",
});

// Get context values
const { user } = useUser();
const { provider, ydoc } = useCollab();
const { aiToken } = useAi();

// Create editor configuration function that always includes collaboration
const createEditorConfig = (collabProvider: any) => ({
  immediatelyRender: false,
  shouldRerenderOnTransaction: false,
  editorProps: {
    attributes: {
      class: "notion-like-editor",
    },
  },
  extensions: [
    StarterKit.configure({
      undoRedo: false,
      horizontalRule: false,
      dropcursor: {
        width: 2,
      },
    }),
    HorizontalRule,
    TextAlign.configure({ types: ["heading", "paragraph"] }),
    // Always include Collaboration extensions with the provided provider
    Collaboration.configure({ document: ydoc }),
    CollaborationCaret.configure({
      provider: collabProvider,
      user: {
        id: user.value.id,
        name: user.value.name,
        color: user.value.color,
      },
    }),
    Placeholder.configure({
      placeholder: props.placeholder,
      emptyNodeClass: "is-empty with-slash",
    }),
    Mention,
    Emoji.configure({
      emojis: gitHubEmojis.filter((emoji) => !emoji.name.includes("regional")),
      forceFallbackImages: true,
    }),
    Mathematics,
    Superscript,
    Subscript,
    Color,
    TextStyle,
    TaskList,
    TaskItem.configure({ nested: true }),
    Highlight.configure({ multicolor: true }),
    Image,
    ImageUploadNode.configure({
      accept: "image/*",
      maxSize: MAX_FILE_SIZE,
      limit: 3,
      upload: handleImageUpload,
      onError: (error) => console.error("Upload failed:", error),
    }),
    UniqueID.configure({
      types: [
        "paragraph",
        "bulletList",
        "orderedList",
        "taskList",
        "heading",
        "blockquote",
        "codeBlock",
      ],
      filterTransaction: (transaction) => !isChangeOrigin(transaction),
    }),
    Typography,
    UiState,
    // AI extension - conditionally enabled when token is available
    ...(aiToken.value
      ? [
          Ai.configure({
            appId: TIPTAP_AI_APP_ID,
            token: aiToken.value,
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
        ]
      : []),
  ],
});

// Editor instance - initially null, will be created when provider is ready
const editor = ref<Editor | null>(null);

// Watch for provider to be ready, then create editor
watch(
  [provider, aiToken],
  ([newProvider, newAiToken]) => {
    console.log("📺 NotionEditor watch triggered:", {
      hasProvider: !!newProvider,
      hasYdoc: !!ydoc,
      hasAiToken: !!newAiToken,
    });

    // Wait for provider to be available
    if (!newProvider || !ydoc) {
      console.log("⏭️  Waiting for provider and ydoc...");
      return;
    }

    console.log("🎉 Creating editor with collaboration!");

    // Destroy existing editor if any
    if (editor.value) {
      console.log("🗑️  Destroying existing editor");
      editor.value.destroy();
    }

    // Create new editor with collaboration - pass provider explicitly
    const config = createEditorConfig(newProvider);
    const newEditor = new Editor({
      ...config,
      onCreate: ({ editor }) => {
        console.log("✅ Editor created successfully");
        // Set default content if document is empty after a short delay (to allow collab sync)
        setTimeout(() => {
          if (editor.isEmpty) {
            console.log("📄 Setting default content");
            editor.commands.setContent(defaultContent);
          } else {
            console.log("📄 Document has content from collaboration");
          }
        }, 100);
      },
    });

    editor.value = newEditor;
  },
  { immediate: true }
);

// Cleanup on unmount
onBeforeUnmount(() => {
  if (editor.value) {
    editor.value.destroy();
  }
});

// Create a properly typed editor ref for child components
const typedEditor = computed<Editor | undefined>(() => (editor.value as Editor) ?? undefined);

// Provide editor to child components
provide("editor", editor);

// UI state management
const uiState = useUiEditorState(editor as MaybeRef<Editor | null>);

// Cursor style based on dragging
const cursorStyle = computed(() => ({
  cursor: uiState.isDragging.value ? "grabbing" : "auto",
}));

// Scroll to hash
useScrollToHash();

// Loading state - show loading until we have the editor with AI
const isLoading = computed(() => {
  if (!editor.value) return true;
  // Check if AI extension is loaded
  const hasAiExtension = editor.value.extensionManager.extensions.some(
    (e) => e.name === "ai"
  );
  return !hasAiExtension && aiToken.value !== null;
});
</script>

<template>
  <div class="notion-like-editor-wrapper">
    <!-- Loading spinner -->
    <div v-if="isLoading" class="spinner-container">
      <div class="spinner-content">
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle cx="12" cy="12" r="10"></circle>
          <path
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          ></path>
        </svg>
        <div class="spinner-loading-text">Connecting...</div>
      </div>
    </div>

    <!-- Editor -->
    <template v-else-if="editor">
      <NotionEditorHeader />

      <EditorContent
        :editor="typedEditor"
        role="presentation"
        class="notion-like-editor-content"
        :style="cursorStyle"
      />

      <!-- Dropdown menus - rendered outside EditorContent -->
      <EmojiDropdownMenu />
      <MentionDropdownMenu />
      <SlashDropdownMenu />

      <!-- AI Menu -->
      <AiMenu :editor="typedEditor" />

      <!-- Drag Context Menu -->
      <DragContextMenu :editor="typedEditor" :with-slash-command-trigger="true" />

      <!-- Floating toolbar -->
      <NotionEditorFloatingToolbar />

      <!-- Mobile toolbar -->
      <Teleport to="body">
        <NotionEditorMobileToolbar />
      </Teleport>
    </template>
  </div>
</template>

<style lang="scss">
@use "./notion-like-editor.scss" as *;
</style>
