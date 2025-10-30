<script setup lang="ts">
import type { Editor } from "@tiptap/vue-3";

// --- Composables ---
import { useTiptapEditor } from "@/composables/useTiptapEditor";

// --- Tiptap UI ---
import {
  useTurnIntoDropdown,
  getFilteredBlockTypeOptions,
} from "@/components/tiptap-ui/turn-into-dropdown";

// --- UI Primitives ---
import Button from "@/components/tiptap-ui-primitive/button/Button.vue";
import ButtonGroup from "@/components/tiptap-ui-primitive/button/ButtonGroup.vue";
import Popover from "@/components/tiptap-ui-primitive/popover/popover.vue";
import PopoverContent from "@/components/tiptap-ui-primitive/popover/PopoverContent.vue";
import PopoverTrigger from "@/components/tiptap-ui-primitive/popover/PopoverTrigger.vue";
import Card from "@/components/tiptap-ui-primitive/card/Card.vue";
import CardBody from "@/components/tiptap-ui-primitive/card/CardBody.vue";
import CardGroupLabel from "@/components/tiptap-ui-primitive/card/CardGroupLabel.vue";
import CardItemGroup from "@/components/tiptap-ui-primitive/card/CardItemGroup.vue";

interface TurnIntoDropdownProps {
  /**
   * Optional editor instance. If not provided, will use editor from context
   */
  editor?: Editor | null;
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
  /**
   * Whether to use card layout for the dropdown content
   * @default true
   */
  useCardLayout?: boolean;
}

const props = withDefaults(defineProps<TurnIntoDropdownProps>(), {
  hideWhenUnavailable: false,
  useCardLayout: true,
});

const { editor } = useTiptapEditor(props.editor);

const {
  isVisible,
  canToggle,
  isOpen,
  activeBlockType,
  handleOpenChange,
  label,
  Icon,
  filteredOptions,
} = useTurnIntoDropdown({
  editor: editor.value,
  hideWhenUnavailable: props.hideWhenUnavailable,
  blockTypes: props.blockTypes,
  onOpenChange: props.onOpenChange,
});

// Helper function to handle block type changes
const handleBlockTypeChange = (
  option: ReturnType<typeof getFilteredBlockTypeOptions>[0]
) => {
  if (!editor.value) return;

  const ed = editor.value;

  switch (option.type) {
    case "paragraph":
      ed.chain().focus().setParagraph().run();
      break;
    case "heading":
      if (option.level) {
        ed.chain().focus().setHeading({ level: option.level }).run();
      }
      break;
    case "bulletList":
      ed.chain().focus().toggleBulletList().run();
      break;
    case "orderedList":
      ed.chain().focus().toggleOrderedList().run();
      break;
    case "taskList":
      ed.chain().focus().toggleTaskList().run();
      break;
    case "blockquote":
      ed.chain().focus().toggleBlockquote().run();
      break;
    case "codeBlock":
      ed.chain().focus().toggleCodeBlock().run();
      break;
  }

  handleOpenChange(false);
};
</script>

<template>
  <Popover
    v-if="isVisible"
    v-model:open="isOpen"
    @update:open="handleOpenChange"
  >
    <PopoverTrigger as-child>
      <Button
        type="button"
        data-style="ghost"
        :disabled="!canToggle"
        :data-disabled="!canToggle"
        role="button"
        :tabindex="-1"
        :aria-label="label"
        :tooltip="'Turn into'"
      >
        <slot>
          <span class="tiptap-button-text">
            {{ activeBlockType?.label || "Text" }}
          </span>
          <component :is="Icon" class="tiptap-button-dropdown-small" />
        </slot>
      </Button>
    </PopoverTrigger>

    <PopoverContent align="start">
      <Card v-if="useCardLayout">
        <CardBody>
          <CardItemGroup>
            <CardGroupLabel>Turn into</CardGroupLabel>
            <ButtonGroup class="flex-col">
              <Button
                v-for="(option, index) in filteredOptions"
                :key="`${option.type}-${option.level ?? index}`"
                type="button"
                data-style="ghost"
                class="justify-start"
                @click="handleBlockTypeChange(option)"
              >
                <component
                  v-if="option.icon"
                  :is="option.icon"
                  class="tiptap-button-icon"
                />
                <span class="tiptap-button-text">{{ option.label }}</span>
              </Button>
            </ButtonGroup>
          </CardItemGroup>
        </CardBody>
      </Card>

      <ButtonGroup v-else class="flex-col">
        <Button
          v-for="(option, index) in filteredOptions"
          :key="`${option.type}-${option.level ?? index}`"
          type="button"
          data-style="ghost"
          class="justify-start"
          @click="handleBlockTypeChange(option)"
        >
          <component
            v-if="option.icon"
            :is="option.icon"
            class="tiptap-button-icon"
          />
          <span class="tiptap-button-text">{{ option.label }}</span>
        </Button>
      </ButtonGroup>
    </PopoverContent>
  </Popover>
</template>
