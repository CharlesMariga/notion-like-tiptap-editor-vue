<script setup lang="ts">
import { computed, ref } from "vue";
import type { Editor } from "@tiptap/vue-3";

// --- Composables ---
import { useTiptapEditor } from "@/composables/useTiptapEditor";
import { useUiEditorState } from "@/composables/useUiEditorState";
import { useIsMobile } from "@/composables/useIsMobile";
import { useFloatingToolbarVisibility } from "@/composables/useFloatingToolbarVisibility";

// --- Utils ---
import { isSelectionValid } from "@/lib/tiptap-collab-utils";

// --- UI Utils ---
import FloatingElement from "@/components/tiptap-ui-utils/floating-element/FloatingElement.vue";

// --- Primitive UI Components ---
import Button from "@/components/tiptap-ui-primitive/button/Button.vue";
import Popover from "@/components/tiptap-ui-primitive/popover/popover.vue";
import PopoverContent from "@/components/tiptap-ui-primitive/popover/PopoverContent.vue";
import PopoverTrigger from "@/components/tiptap-ui-primitive/popover/PopoverTrigger.vue";
import Toolbar from "@/components/tiptap-ui-primitive/toolbar/Toolbar.vue";
import ToolbarGroup from "@/components/tiptap-ui-primitive/toolbar/ToolbarGroup.vue";
import ToolbarSeparator from "@/components/tiptap-ui-primitive/toolbar/ToolbarSeparator.vue";

// --- Node ---
import ImageNodeFloating from "@/components/tiptap-node/image-node/ImageNodeFloating.vue";

// --- Icons ---
import MoreVerticalIcon from "@/components/tiptap-icons/MoreVerticalIcon.vue";

// --- UI ---
// Note: These components are currently in React format and will need to be converted to Vue
// For now, they are imported but may not work correctly
import ColorTextPopover from "@/components/tiptap-ui/color-text-popover/ColorTextPopover.vue";
import ImproveDropdown from "@/components/tiptap-ui/improve-dropdown/ImproveDropdown.vue";
import LinkPopover from "@/components/tiptap-ui/link-popover/LinkPopover.vue";
import MarkButton from "@/components/tiptap-ui/mark-button/MarkButton.vue";
import TextAlignButton from "@/components/tiptap-ui/text-align-button/TextAlignButton.vue";
import TurnIntoDropdown from "@/components/tiptap-ui/turn-into-dropdown/TurnIntoDropdown.vue";

const props = defineProps<{
  editor: Editor | null | undefined;
}>();

const { editor } = useTiptapEditor(() => props.editor);
const isMobile = useIsMobile(480);
const { lockDragHandle, aiGenerationActive, commentInputVisible } =
  useUiEditorState(editor);

const { shouldShow } = useFloatingToolbarVisibility({
  editor,
  isSelectionValid,
  extraHideWhen: computed(() =>
    Boolean(aiGenerationActive.value || commentInputVisible.value)
  ),
});

const showToolbar = computed(() => !lockDragHandle.value && !isMobile.value);

// More options popover state
const moreOptionsOpen = ref(false);
</script>

<template>
  <FloatingElement
    v-if="showToolbar"
    :editor="editor"
    :should-show="shouldShow"
  >
    <div class="tiptap-floating-toolbar">
      <Toolbar variant="floating">
        <ToolbarGroup>
          <ImproveDropdown :editor="editor" :hide-when-unavailable="true" />
        </ToolbarGroup>

        <ToolbarSeparator />

        <ToolbarGroup>
          <TurnIntoDropdown :editor="editor" :hide-when-unavailable="true" />
        </ToolbarGroup>

        <ToolbarSeparator />

        <ToolbarGroup>
          <MarkButton
            :editor="editor"
            type="bold"
            :hide-when-unavailable="true"
          />
          <MarkButton
            :editor="editor"
            type="italic"
            :hide-when-unavailable="true"
          />
          <MarkButton
            :editor="editor"
            type="underline"
            :hide-when-unavailable="true"
          />
          <MarkButton
            :editor="editor"
            type="strike"
            :hide-when-unavailable="true"
          />
          <MarkButton
            :editor="editor"
            type="code"
            :hide-when-unavailable="true"
          />
        </ToolbarGroup>

        <ToolbarSeparator />

        <ToolbarGroup>
          <ImageNodeFloating :editor="editor" />
        </ToolbarGroup>

        <ToolbarSeparator />

        <ToolbarGroup>
          <LinkPopover
            :editor="editor"
            :auto-open-on-link-active="false"
            :hide-when-unavailable="true"
          />
          <ColorTextPopover :editor="editor" :hide-when-unavailable="true" />
        </ToolbarGroup>

        <ToolbarSeparator />

        <!-- More Options Dropdown -->
        <Popover v-model:open="moreOptionsOpen">
          <PopoverTrigger as-child>
            <Button
              data-style="ghost"
              aria-label="More options"
              :tooltip="'More options'"
            >
              <MoreVerticalIcon />
            </Button>
          </PopoverTrigger>
          <PopoverContent align="start">
            <div class="more-options-content">
              <ToolbarGroup class="flex-col">
                <TextAlignButton
                  :editor="editor"
                  align="left"
                  :hide-when-unavailable="true"
                />
                <TextAlignButton
                  :editor="editor"
                  align="center"
                  :hide-when-unavailable="true"
                />
                <TextAlignButton
                  :editor="editor"
                  align="right"
                  :hide-when-unavailable="true"
                />
                <TextAlignButton
                  :editor="editor"
                  align="justify"
                  :hide-when-unavailable="true"
                />
              </ToolbarGroup>
            </div>
          </PopoverContent>
        </Popover>
      </Toolbar>
    </div>
  </FloatingElement>
</template>
