<script setup lang="ts">
import { ref, computed, watch } from "vue";
import type { Editor } from "@tiptap/vue-3";
import { NodeSelection } from "@tiptap/pm/state";

// --- Composables ---
import { useTiptapEditor } from "@/composables/useTiptapEditor";

// --- UI Primitives ---
import Button from "@/components/tiptap-ui-primitive/button/Button.vue";
import ButtonGroup from "@/components/tiptap-ui-primitive/button/ButtonGroup.vue";
import Popover from "@/components/tiptap-ui-primitive/popover/popover.vue";
import PopoverContent from "@/components/tiptap-ui-primitive/popover/PopoverContent.vue";
import PopoverTrigger from "@/components/tiptap-ui-primitive/popover/PopoverTrigger.vue";
import Card from "@/components/tiptap-ui-primitive/card/Card.vue";
import CardBody from "@/components/tiptap-ui-primitive/card/CardBody.vue";
import Separator from "@/components/tiptap-ui-primitive/separator/Separator.vue";

// import AiSparklesIcon from "@/components/tiptap-icons/AiSparklesIcon.vue";
import CheckAiIcon from "@/components/tiptap-icons/CheckAiIcon.vue";
import TextExtendIcon from "@/components/tiptap-icons/TextExtendIcon.vue";
import TextReduceIcon from "@/components/tiptap-icons/TextReduceIcon.vue";
import Simplify2Icon from "@/components/tiptap-icons/Simplify2Icon.vue";
import SmileAiIcon from "@/components/tiptap-icons/SmileAiIcon.vue";
import CompleteSentenceIcon from "@/components/tiptap-icons/CompleteSentenceIcon.vue";
import SummarizeTextIcon from "@/components/tiptap-icons/SummarizeTextIcon.vue";
import MicAiIcon from "@/components/tiptap-icons/MicAiIcon.vue";
// import LanguagesIcon from "@/components/tiptap-icons/LanguagesIcon.vue";
// import ChevronRightIcon from "@/components/tiptap-icons/ChevronRightIcon.vue";
// import SubMenuDropdown from "./SubMenuDropdown.vue";

interface ImproveDropdownProps {
  /**
   * Optional editor instance. If not provided, will use editor from context
   */
  editor?: Editor | null;
  /**
   * Whether to hide the dropdown when AI features are not available
   * @default false
   */
  hideWhenUnavailable?: boolean;
}

const props = withDefaults(defineProps<ImproveDropdownProps>(), {
  hideWhenUnavailable: false,
});

const AI_EXCLUDED_BLOCKS = [
  "image",
  "imageUpload",
  "video",
  "audio",
  "table",
  "codeBlock",
  "horizontalRule",
  "hardBreak",
];

const { editor } = useTiptapEditor(props.editor);
const isOpen = ref(false);
const show = ref(true);

/**
 * NOTE: This component requires @tiptap-pro/extension-ai which is not available.
 * The AI functionality has been disabled. To enable it:
 * 1. Install @tiptap-pro/extension-ai
 * 2. Configure the AI extension in your editor
 * 3. Implement the AI command handlers below
 */

const canUseAi = computed(() => {
  if (!editor.value || !editor.value.isEditable) return false;

  const { selection } = editor.value.state;
  if (selection.empty) {
    return false;
  }

  if (selection instanceof NodeSelection) {
    if (!selection.node.content.size) {
      return false;
    }
    const node = selection.node;
    if (AI_EXCLUDED_BLOCKS.includes(node.type.name)) {
      return false;
    }
  }

  return true;
});

const isDisabled = computed(() => !canUseAi.value);

const shouldShowImproveDropdown = computed(() => {
  if (!editor.value || !editor.value.isEditable) {
    return false;
  }

  if (props.hideWhenUnavailable && !editor.value.isActive("code")) {
    return canUseAi.value;
  }

  return true;
});

// Watch for editor selection changes
watch(
  editor,
  (currentEditor) => {
    if (!currentEditor) return;

    const handleSelectionUpdate = () => {
      show.value = shouldShowImproveDropdown.value;
    };

    handleSelectionUpdate();
    currentEditor.on("selectionUpdate", handleSelectionUpdate);

    return () => {
      currentEditor.off("selectionUpdate", handleSelectionUpdate);
    };
  },
  { immediate: true }
);

const handleOpenChange = (open: boolean) => {
  if (!editor.value || isDisabled.value) return;
  isOpen.value = open;
};

// Stub AI command handlers - replace with actual implementation when AI extension is available
const executeAICommand = (command: string) => {
  console.warn(
    `AI command "${command}" called but @tiptap-pro/extension-ai is not configured`
  );
  isOpen.value = false;
};

const menuActions = [
  {
    icon: CheckAiIcon,
    label: "Fix spelling & grammar",
    command: "fixSpellingAndGrammar",
    onClick: () => executeAICommand("fixSpellingAndGrammar"),
  },
  {
    icon: TextExtendIcon,
    label: "Extend text",
    command: "extend",
    onClick: () => executeAICommand("extend"),
  },
  {
    icon: TextReduceIcon,
    label: "Reduce text",
    command: "shorten",
    onClick: () => executeAICommand("shorten"),
  },
  {
    icon: Simplify2Icon,
    label: "Simplify text",
    command: "simplify",
    onClick: () => executeAICommand("simplify"),
  },
  {
    icon: SmileAiIcon,
    label: "Emojify",
    command: "emojify",
    onClick: () => executeAICommand("emojify"),
  },
];

const secondaryActions = [
  {
    icon: CompleteSentenceIcon,
    label: "Complete sentence",
    command: "complete",
    onClick: () => executeAICommand("complete"),
  },
  {
    icon: SummarizeTextIcon,
    label: "Summarize",
    command: "summarize",
    onClick: () => executeAICommand("summarize"),
  },
];

// const subMenuActions = computed(() => [
//   {
//     icon: MicAiIcon,
//     label: "Adjust tone",
//     items: [
//       {
//         label: "Professional",
//         value: "professional",
//         onClick: () => adjustTone("professional"),
//       },
//       { label: "Casual", value: "casual", onClick: () => adjustTone("casual") },
//     ],
//   },
// ]);
</script>

<template>
  <Popover
    v-if="show && editor && editor.isEditable"
    v-model:open="isOpen"
    @update:open="handleOpenChange"
  >
    <PopoverTrigger as-child>
      <Button
        type="button"
        data-style="ghost"
        :disabled="isDisabled"
        :data-disabled="isDisabled"
        role="button"
        :tabindex="-1"
        aria-label="Improve"
        :tooltip="'Improve'"
      >
        <!-- Placeholder icon until AiSparklesIcon is created -->
        <span class="tiptap-button-icon">✨</span>
        <span class="tiptap-button-text">Improve</span>
      </Button>
    </PopoverTrigger>

    <PopoverContent align="start">
      <Card>
        <CardBody>
          <ButtonGroup class="flex-col">
            <!-- Note: Tone adjustment submenu would go here -->
            <!-- Requires additional submenu implementation -->
            <!-- <SubMenuDropdown
              v-for="(action, index) in subMenuActions"
              :key="index"
              :action="action"
            /> -->

            <Button
              v-for="(action, index) in menuActions"
              :key="index"
              type="button"
              data-style="ghost"
              class="justify-start"
              @click="action.onClick"
            >
              <component :is="action.icon" class="tiptap-button-icon" />
              <span class="tiptap-button-text">{{ action.label }}</span>
            </Button>
          </ButtonGroup>

          <Separator orientation="horizontal" />

          <ButtonGroup class="flex-col">
            <!-- Note: "Ask AI" button would go here -->
            <!-- Requires AiAskButton component -->

            <Button
              v-for="(action, index) in secondaryActions"
              :key="index"
              type="button"
              data-style="ghost"
              class="justify-start"
              @click="action.onClick"
            >
              <component :is="action.icon" class="tiptap-button-icon" />
              <span class="tiptap-button-text">{{ action.label }}</span>
            </Button>

            <!-- Note: Translate submenu would go here -->
            <!-- Requires additional submenu implementation -->
          </ButtonGroup>
        </CardBody>
      </Card>
    </PopoverContent>
  </Popover>
</template>

<style scoped>
.flex-col {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.justify-start {
  justify-content: flex-start;
}

.tiptap-button-icon {
  width: 1rem;
  height: 1rem;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

.tiptap-button-text {
  text-align: left;
}
</style>
