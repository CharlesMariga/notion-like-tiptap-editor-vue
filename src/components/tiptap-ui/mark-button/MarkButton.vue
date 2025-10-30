<script setup lang="ts">
// --- Composables ---
import { useTiptapEditor } from "@/composables/useTiptapEditor";

// --- Tiptap UI ---
import type { Editor } from "@tiptap/vue-3";
import type { Mark } from "@/components/tiptap-ui/mark-button";
import { useMark } from "@/components/tiptap-ui/mark-button";

// --- UI Primitives ---
import Button from "@/components/tiptap-ui-primitive/button/Button.vue";

interface MarkButtonProps {
  /**
   * The Tiptap editor instance.
   */
  editor?: Editor | null;
  /**
   * The type of mark to toggle
   */
  type: Mark;
  /**
   * Whether the button should hide when mark is not available.
   * @default false
   */
  hideWhenUnavailable?: boolean;
  /**
   * Callback function called after a successful mark toggle.
   */
  onToggled?: () => void;
  /**
   * Optional text to display alongside the icon.
   */
  text?: string;
  /**
   * Optional show shortcut keys in the button.
   * @default false
   */
  showShortcut?: boolean;
}

const props = withDefaults(defineProps<MarkButtonProps>(), {
  hideWhenUnavailable: false,
  showShortcut: false,
});

const { editor } = useTiptapEditor(props.editor);

const {
  isVisible,
  handleMark,
  label,
  canToggle,
  isActive,
  Icon,
  shortcutKeys,
} = useMark({
  editor: editor.value,
  type: props.type,
  hideWhenUnavailable: props.hideWhenUnavailable,
  onToggled: props.onToggled,
});

const handleClick = () => {
  handleMark();
};
</script>

<template>
  <Button
    v-if="isVisible"
    type="button"
    :disabled="!canToggle"
    data-style="ghost"
    :data-active-state="isActive ? 'on' : 'off'"
    :data-disabled="!canToggle"
    role="button"
    :tabindex="-1"
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
      <span
        v-if="text"
        class="tiptap-button-text"
      >{{ text }}</span>
      <span
        v-if="showShortcut"
        class="tiptap-button-shortcut"
      >
        {{ shortcutKeys }}
      </span>
    </slot>
  </Button>
</template>
