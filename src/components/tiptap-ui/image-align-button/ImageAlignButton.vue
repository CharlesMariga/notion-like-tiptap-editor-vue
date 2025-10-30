<script setup lang="ts">
// --- Composables ---
import { useTiptapEditor } from "@/composables/useTiptapEditor";

// --- Tiptap UI ---
import type { Editor } from "@tiptap/vue-3";
import type { ImageAlign } from "@/components/tiptap-ui/image-align-button";
import { useImageAlign } from "@/components/tiptap-ui/image-align-button";

// --- UI Primitives ---
import Button from "@/components/tiptap-ui-primitive/button/Button.vue";

interface ImageAlignButtonProps {
  /**
   * The Tiptap editor instance.
   */
  editor?: Editor | null;
  /**
   * The image alignment to apply.
   */
  align: ImageAlign;
  /**
   * The name of the image extension to target.
   * @default "image"
   */
  extensionName?: string;
  /**
   * The attribute name used for alignment.
   * @default "data-align"
   */
  attributeName?: string;
  /**
   * Whether the button should hide when alignment is not available.
   * @default false
   */
  hideWhenUnavailable?: boolean;
  /**
   * Callback function called after a successful alignment change.
   */
  onAligned?: () => void;
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

const props = withDefaults(defineProps<ImageAlignButtonProps>(), {
  hideWhenUnavailable: false,
  extensionName: "image",
  attributeName: "data-align",
  showShortcut: false,
});

const { editor } = useTiptapEditor(props.editor);

const {
  isVisible,
  handleImageAlign,
  label,
  canAlign,
  isActive,
  Icon,
  shortcutKeys,
} = useImageAlign({
  editor: editor.value,
  align: props.align,
  extensionName: props.extensionName,
  attributeName: props.attributeName,
  hideWhenUnavailable: props.hideWhenUnavailable,
  onAligned: props.onAligned,
});

const handleClick = () => {
  handleImageAlign();
};
</script>

<template>
  <Button
    v-if="isVisible"
    type="button"
    :disabled="!canAlign"
    data-style="ghost"
    :data-active-state="isActive ? 'on' : 'off'"
    :data-disabled="!canAlign"
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
