<script setup lang="ts">
import { ref, computed, watch, onMounted, onBeforeUnmount } from "vue";
import { type Editor } from "@tiptap/vue-3";

// Hooks
import { useTiptapEditor } from "@/composables/useTiptapEditor";
import { useUiEditorState } from "@/composables/useUiEditorState";
import {
  useAiMenuStateProvider,
  useAiContentTracker,
  useTextSelectionTracker,
} from "@/composables/useAiMenu";

// Utils
import {
  getSelectedDOMElement,
  selectionHasText,
} from "@/lib/tiptap-advanced-utils";
import { getContextAndInsertAt } from "@/components/tiptap-ui/ai-menu/ai-menu-utils";

// Components
import AiMenuInput from "@/components/tiptap-ui/ai-menu/ai-menu-input/AiMenuInput.vue";
import AiMenuActions from "@/components/tiptap-ui/ai-menu/ai-menu-actions/AiMenuActions.vue";
import AiMenuItems from "@/components/tiptap-ui/ai-menu/ai-menu-items/AiMenuItems.vue";

// UI Primitives
import { Button, ButtonGroup } from "@/components/tiptap-ui-primitive/button";
import { Card, CardBody } from "@/components/tiptap-ui-primitive/card";
import {
  Popover,
  PopoverContent,
} from "@/components/tiptap-ui-primitive/popover";
import { PopoverAnchor } from "radix-vue";

// Icons
import StopCircle2Icon from "@/components/tiptap-icons/StopCircle2Icon.vue";

import "@/components/tiptap-ui/ai-menu/ai-menu.scss";

const props = defineProps<{
  editor?: Editor | null;
}>();

const { editor: localEditor } = useTiptapEditor(props.editor);
const { state, updateState, setFallbackAnchor, reset } =
  useAiMenuStateProvider();
const { aiGenerationIsLoading, aiGenerationActive, aiGenerationHasMessage } =
  useUiEditorState(localEditor);

const tiptapAiPromptInputRef = ref<any>(null);
const anchorElement = ref<HTMLElement | null>(null);

const closeAiMenu = () => {
  if (!localEditor.value) return;
  reset();
  localEditor.value.commands.resetUiState();
};

const handlePromptSubmit = (userPrompt: string) => {
  if (!localEditor.value || !userPrompt.trim()) return;

  console.log("[AiMenu] Submitting prompt:", userPrompt);
  console.log("[AiMenu] Current states before submit:", {
    aiGenerationIsLoading: aiGenerationIsLoading.value,
    aiGenerationHasMessage: aiGenerationHasMessage.value,
    aiGenerationActive: aiGenerationActive.value,
  });

  const { context } = getContextAndInsertAt(localEditor.value);
  const promptWithContext = context
    ? `${context}\n\n${userPrompt}`
    : userPrompt;

  // Ensure fallback anchor is set before submitting
  if (!state.value.fallbackAnchor.element || !state.value.fallbackAnchor.rect) {
    const currentSelectedElement = getSelectedDOMElement(localEditor.value);
    if (currentSelectedElement) {
      const rect = currentSelectedElement.getBoundingClientRect();
      setFallbackAnchor(currentSelectedElement, rect);
    }
  }

  localEditor.value
    .chain()
    .aiTextPrompt({
      text: promptWithContext,
      insert: true,
      stream: true,
      tone: state.value.tone,
      format: "rich-text",
    })
    .run();

  console.log("[AiMenu] After aiTextPrompt call:", {
    aiGenerationIsLoading: aiGenerationIsLoading.value,
    aiGenerationHasMessage: aiGenerationHasMessage.value,
    aiGenerationActive: aiGenerationActive.value,
  });
};

const setAnchorEl = (element: HTMLElement) => {
  anchorElement.value = element;
};

const handleSelectionChange = (
  element: HTMLElement | null,
  rect: DOMRect | null
) => {
  setFallbackAnchor(element, rect);
};

const handleOnReject = () => {
  if (!localEditor.value) return;
  localEditor.value.commands.aiReject();
  closeAiMenu();
};

const handleOnAccept = () => {
  if (!localEditor.value) return;
  localEditor.value.commands.aiAccept();
  closeAiMenu();
};

const handleInputOnClose = () => {
  if (!localEditor.value) return;
  if (aiGenerationIsLoading.value) {
    localEditor.value.commands.aiReject({ type: "reset" });
  } else {
    localEditor.value.commands.aiAccept();
  }
  closeAiMenu();
};

const handleClickOutside = () => {
  if (!aiGenerationIsLoading.value) {
    closeAiMenu();

    if (!localEditor.value) return;
    localEditor.value.commands.aiAccept();
  }
};

const handleStop = () => {
  if (!localEditor.value) return;

  localEditor.value.chain().aiReject({ type: "reset" }).run();
  reset();
  localEditor.value.commands.resetUiState();
};

// Setup content and selection tracking
useAiContentTracker({
  editor: localEditor,
  aiGenerationActive,
  setAnchorElement: setAnchorEl,
  fallbackAnchor: computed(() => state.value.fallbackAnchor),
});

useTextSelectionTracker({
  editor: localEditor,
  aiGenerationActive,
  showMenuAtElement: setAnchorEl,
  setMenuVisible: (visible) => updateState({ isOpen: visible }),
  onSelectionChange: handleSelectionChange,
  prevent: aiGenerationIsLoading,
});

// Watch for loading state changes
watch(aiGenerationIsLoading, (isLoading) => {
  console.log("[AiMenu] aiGenerationIsLoading changed:", isLoading);
  if (isLoading) {
    updateState({ shouldShowInput: false });
  }
});

// Watch for message state changes
watch(aiGenerationHasMessage, (hasMessage) => {
  console.log("[AiMenu] aiGenerationHasMessage changed:", hasMessage);
});

// Watch for active state changes
watch([aiGenerationActive, () => state.value.isOpen], ([active, isOpen]) => {
  if (!active && isOpen) {
    closeAiMenu();
  }
  // When AI generation becomes active but menu isn't open, open it
  if (active && !isOpen) {
    updateState({ isOpen: true });

    // Set anchor element at cursor position if no selection
    if (localEditor.value) {
      const selectedElement = getSelectedDOMElement(localEditor.value);
      if (selectedElement) {
        const rect = selectedElement.getBoundingClientRect();
        setFallbackAnchor(selectedElement, rect);
        setAnchorEl(selectedElement);
      }
    }
  }
});

const shouldShowList = computed(
  () =>
    (localEditor.value && selectionHasText(localEditor.value)) ||
    (aiGenerationHasMessage.value &&
      state.value.shouldShowInput &&
      state.value.inputIsFocused)
);

// Track window size to recalculate menu width on resize
const windowWidth = ref(window.innerWidth);

// Calculate menu width based on editor content area
const menuWidth = computed(() => {
  // Depend on windowWidth to trigger recalculation on resize
  windowWidth.value;

  if (!localEditor.value) return "360px";

  const editorElement = localEditor.value.view.dom;
  const width = editorElement.clientWidth; // clientWidth excludes padding

  // Return the width, with a min of 320px and max of 600px
  return `${width - 48 * 2}px`;
});

// Update windowWidth on resize
const handleResize = () => {
  windowWidth.value = window.innerWidth;
};

onMounted(() => {
  window.addEventListener("resize", handleResize);
});

onBeforeUnmount(() => {
  window.removeEventListener("resize", handleResize);
});
</script>

<template>
  <Popover
    v-if="localEditor && state.isOpen && aiGenerationActive"
    :open="state.isOpen"
  >
    <Teleport to="body">
      <div
        v-if="anchorElement"
        ref="virtualAnchor"
        :style="{
          position: 'absolute',
          left: state.fallbackAnchor.rect?.left + 'px',
          top: state.fallbackAnchor.rect?.top + 'px',
          width: state.fallbackAnchor.rect?.width + 'px',
          height: state.fallbackAnchor.rect?.height + 'px',
          pointerEvents: 'none',
          visibility: 'hidden',
        }"
      />
    </Teleport>
    <PopoverAnchor v-if="anchorElement" :element="anchorElement" />
    <PopoverContent
      class="tiptap-ai-menu"
      :style="{ width: menuWidth }"
      @click-outside="handleClickOutside"
    >
      <Card>
        <!-- Progress Indicator -->
        <div
          v-if="aiGenerationIsLoading"
          class="tiptap-ai-menu-progress"
        >
          <div class="tiptap-spinner-alt">
            <span>AI is writing</span>
            <div class="dots-container">
              <div class="dot"></div>
              <div class="dot"></div>
              <div class="dot"></div>
            </div>
          </div>

          <ButtonGroup>
            <Button data-style="ghost" title="Stop" @click="handleStop">
              <StopCircle2Icon class="tiptap-button-icon" />
            </Button>
          </ButtonGroup>
        </div>

        <!-- Input -->
        <AiMenuInput
          v-if="!aiGenerationIsLoading"
          ref="tiptapAiPromptInputRef"
          :show-placeholder="
            !aiGenerationIsLoading &&
            aiGenerationHasMessage &&
            !state.shouldShowInput
          "
          @input-focus="updateState({ inputIsFocused: true })"
          @input-blur="updateState({ inputIsFocused: false })"
          @close="handleInputOnClose"
          @placeholder-click="updateState({ shouldShowInput: true })"
          @input-submit="handlePromptSubmit"
          @tone-change="(tone) => updateState({ tone })"
        />

        <!-- Actions -->
        <AiMenuActions
          v-if="aiGenerationHasMessage && !aiGenerationIsLoading"
          :editor="localEditor"
          :options="{ tone: state.tone, format: 'rich-text' }"
          @accept="handleOnAccept"
          @reject="handleOnReject"
        />
      </Card>

      <!-- Menu Items List - Separate floating element anchored to input -->
      <Popover
        v-if="!aiGenerationIsLoading && shouldShowList"
        :open="true"
      >
        <PopoverAnchor
          v-if="tiptapAiPromptInputRef"
          :element="tiptapAiPromptInputRef?.$el"
        />
        <PopoverContent
          class="tiptap-ai-menu-items-popover"
          :side="'bottom'"
          :align="'start'"
          :avoid-collisions="false"
        >
          <Card>
            <CardBody>
              <AiMenuItems :editor="localEditor" />
            </CardBody>
          </Card>
        </PopoverContent>
      </Popover>
    </PopoverContent>
  </Popover>
</template>
