<script setup lang="ts">
// --- Composables ---
import { useTiptapEditor } from "@/composables/useTiptapEditor";

// --- Tiptap UI ---
import type { Editor } from "@tiptap/vue-3";
import type { Level } from "@/components/tiptap-ui/heading-button";
import { useHeading } from "@/components/tiptap-ui/heading-button";

// --- UI Primitives ---
import Button from "@/components/tiptap-ui-primitive/button/Button.vue";

// --- Lib ---
import { parseShortcutKeys } from "@/lib/tiptap-utils";

interface HeadingButtonProps {
  /**
   * The Tiptap editor instance.
   */
  editor?: Editor | null;
  /**
   * The heading level.
   */
  level: Level;
  /**
   * Whether the button should hide when heading is not available.
   * @default false
   */
  hideWhenUnavailable?: boolean;
  /**
   * Callback function called after a successful heading toggle.
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

const props = withDefaults(defineProps<HeadingButtonProps>(), {
  hideWhenUnavailable: false,
  showShortcut: false,
});

const { editor } = useTiptapEditor(props.editor);

const {
  isVisible,
  handleToggle,
  label,
  canToggle,
  isActive,
  Icon,
  shortcutKeys,
} = useHeading({
  editor: editor.value,
  level: props.level,
  hideWhenUnavailable: props.hideWhenUnavailable,
  onToggled: props.onToggled,
});

const handleClick = () => {
  handleToggle();
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
        {{ parseShortcutKeys({ shortcutKeys }) }}
      </span>
    </slot>
  </Button>
</template>
