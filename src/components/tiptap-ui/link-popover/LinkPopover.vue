<script setup lang="ts">
import { ref, watch, computed } from "vue";
import type { Editor } from "@tiptap/vue-3";

// --- Composables ---
import { useIsMobile } from "@/composables/useIsMobile";
import { useTiptapEditor } from "@/composables/useTiptapEditor";

// TODO: Create these icon components
// --- Icons ---
// import CornerDownLeftIcon from "@/components/tiptap-icons/CornerDownLeftIcon.vue";
// import ExternalLinkIcon from "@/components/tiptap-icons/ExternalLinkIcon.vue";
// import LinkIcon from "@/components/tiptap-icons/LinkIcon.vue";
// import TrashIcon from "@/components/tiptap-icons/TrashIcon.vue";

// --- Tiptap UI ---
import { useLinkPopover } from "@/components/tiptap-ui/link-popover";

// --- UI Primitives ---
import Button from "@/components/tiptap-ui-primitive/button/Button.vue";
import ButtonGroup from "@/components/tiptap-ui-primitive/button/ButtonGroup.vue";
import Popover from "@/components/tiptap-ui-primitive/popover/popover.vue";
import PopoverContent from "@/components/tiptap-ui-primitive/popover/PopoverContent.vue";
import PopoverTrigger from "@/components/tiptap-ui-primitive/popover/PopoverTrigger.vue";
import Separator from "@/components/tiptap-ui-primitive/separator/Separator.vue";
import Card from "@/components/tiptap-ui-primitive/card/Card.vue";
import CardBody from "@/components/tiptap-ui-primitive/card/CardBody.vue";
import CardItemGroup from "@/components/tiptap-ui-primitive/card/CardItemGroup.vue";

interface LinkPopoverProps {
  /**
   * The Tiptap editor instance.
   */
  editor?: Editor | null;
  /**
   * Whether to hide the link popover when not available.
   * @default false
   */
  hideWhenUnavailable?: boolean;
  /**
   * Callback function called when the link is set.
   */
  onSetLink?: () => void;
  /**
   * Callback for when the popover opens or closes.
   */
  onOpenChange?: (isOpen: boolean) => void;
  /**
   * Whether to automatically open the popover when a link is active.
   * @default true
   */
  autoOpenOnLinkActive?: boolean;
}

const props = withDefaults(defineProps<LinkPopoverProps>(), {
  hideWhenUnavailable: false,
  autoOpenOnLinkActive: true,
});

const { editor } = useTiptapEditor(props.editor);
const isMobile = useIsMobile();
const isOpen = ref(false);

const {
  isVisible,
  canSet,
  isActive,
  url,
  setUrl,
  setLink,
  removeLink,
  openLink,
  label,
  Icon,
} = useLinkPopover({
  editor: editor.value,
  hideWhenUnavailable: props.hideWhenUnavailable,
  onSetLink: props.onSetLink,
});

const handleOnOpenChange = (nextIsOpen: boolean) => {
  isOpen.value = nextIsOpen;
  props.onOpenChange?.(nextIsOpen);
};

const handleSetLink = () => {
  setLink();
  isOpen.value = false;
};

const handleClick = () => {
  isOpen.value = !isOpen.value;
};

const handleKeyDown = (event: KeyboardEvent) => {
  if (event.key === "Enter") {
    event.preventDefault();
    handleSetLink();
  }
};

// Auto-open popover when link is active
watch(
  () => isActive,
  (active) => {
    if (props.autoOpenOnLinkActive && active) {
      isOpen.value = true;
    }
  }
);

const cardStyle = computed(() =>
  isMobile.value ? { boxShadow: "none", border: 0 } : {}
);

const cardBodyStyle = computed(() => (isMobile.value ? { padding: 0 } : {}));
</script>

<template>
  <Popover
    v-if="isVisible"
    v-model:open="isOpen"
    @update:open="handleOnOpenChange"
  >
    <PopoverTrigger as-child>
      <Button
        type="button"
        data-style="ghost"
        role="button"
        :tabindex="-1"
        :disabled="!canSet"
        :data-active-state="isActive ? 'on' : 'off'"
        :data-disabled="!canSet"
        :aria-label="label"
        :aria-pressed="isActive"
        :tooltip="label"
        @click="handleClick"
      >
        <slot>
          <component
            :is="Icon"
            class="tiptap-button-icon"
          />
        </slot>
      </Button>
    </PopoverTrigger>

    <PopoverContent>
      <Card :style="cardStyle">
        <CardBody :style="cardBodyStyle">
          <CardItemGroup orientation="horizontal">
            <!-- Input Group -->
            <div class="input-group">
              <input
                type="url"
                class="link-input"
                placeholder="Paste a link..."
                :value="url"
                autofocus
                autocomplete="off"
                autocorrect="off"
                autocapitalize="off"
                @input="(e) => setUrl((e.target as HTMLInputElement).value)"
                @keydown="handleKeyDown"
              >
            </div>

            <!-- Apply Button -->
            <ButtonGroup orientation="horizontal">
              <Button
                type="button"
                title="Apply link"
                :disabled="!url && !isActive"
                data-style="ghost"
                @click="handleSetLink"
              >
                <span class="tiptap-button-icon">↵</span>
              </Button>
            </ButtonGroup>

            <Separator />

            <!-- Open and Remove Buttons -->
            <ButtonGroup orientation="horizontal">
              <Button
                type="button"
                title="Open in new window"
                :disabled="!url && !isActive"
                data-style="ghost"
                @click="() => openLink()"
              >
                <span class="tiptap-button-icon">🔗</span>
              </Button>

              <Button
                type="button"
                title="Remove link"
                :disabled="!url && !isActive"
                data-style="ghost"
                @click="removeLink"
              >
                <span class="tiptap-button-icon">🗑️</span>
              </Button>
            </ButtonGroup>
          </CardItemGroup>
        </CardBody>
      </Card>
    </PopoverContent>
  </Popover>
</template>

<style scoped>
.tiptap-button-icon {
  width: 1rem;
  height: 1rem;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

.input-group {
  flex: 1;
  min-width: 0;
}

.link-input {
  width: 100%;
  padding: 0.5rem;
  border: 1px solid #e5e7eb;
  border-radius: 0.375rem;
  font-size: 0.875rem;
  line-height: 1.25rem;
  outline: none;
  transition: border-color 0.15s ease-in-out;
}

.link-input:focus {
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.link-input::placeholder {
  color: #9ca3af;
}
</style>
