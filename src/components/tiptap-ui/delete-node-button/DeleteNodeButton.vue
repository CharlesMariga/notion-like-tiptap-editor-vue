<script setup lang="ts">
// --- Composables ---
import { useTiptapEditor } from "@/composables/useTiptapEditor";

// --- Tiptap UI ---
import type { Editor } from "@tiptap/vue-3";
import {
  useDeleteNode,
} from "@/components/tiptap-ui/delete-node-button";

// --- UI Primitives ---
import Button from "@/components/tiptap-ui-primitive/button/Button.vue";

interface DeleteNodeButtonProps {
  /**
   * The Tiptap editor instance.
   */
  editor?: Editor | null;
  /**
   * Whether the button should hide when node deletion is not available.
   * @default false
   */
  hideWhenUnavailable?: boolean;
  /**
   * Callback function called after a successful deletion.
   */
  onDeleted?: () => void;
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

const props = withDefaults(defineProps<DeleteNodeButtonProps>(), {
  hideWhenUnavailable: false,
  showShortcut: false,
});

const { editor } = useTiptapEditor(props.editor);

const {
  isVisible,
  handleDeleteNode,
  label,
  shortcutKeys,
  Icon,
} = useDeleteNode({
  editor: editor.value,
  hideWhenUnavailable: props.hideWhenUnavailable,
  onDeleted: props.onDeleted,
});

const handleClick = () => {
  handleDeleteNode();
};
</script>

<template>
  <Button
    v-if="isVisible"
    type="button"
    data-style="ghost"
    role="button"
    :tabindex="-1"
    :aria-label="label"
    :tooltip="'Delete'"
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

<style scoped>
.tiptap-button-icon {
  width: 1rem;
  height: 1rem;
}

.tiptap-button-text {
  margin-left: 0.5rem;
}

.tiptap-button-shortcut {
  margin-left: auto;
  padding-left: 0.5rem;
  opacity: 0.7;
  font-size: 0.75rem;
}
</style>
