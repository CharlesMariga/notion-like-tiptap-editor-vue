<script setup lang="ts">
// --- Composables ---
import { useTiptapEditor } from "@/composables/useTiptapEditor";

// --- Tiptap UI ---
import type { Editor } from "@tiptap/vue-3";
import {
  useImageDownload,
} from "@/components/tiptap-ui/image-download-button";

// --- UI Primitives ---
import Button from "@/components/tiptap-ui-primitive/button/Button.vue";

interface ImageDownloadButtonProps {
  /**
   * The Tiptap editor instance.
   */
  editor?: Editor | null;
  /**
   * Whether the button should hide when download is not available.
   * @default false
   */
  hideWhenUnavailable?: boolean;
  /**
   * Callback function called after a successful image download.
   */
  onDownloaded?: (filename?: string) => void;
  /**
   * Optional function to resolve file URLs before downloading.
   * Useful for handling relative paths or custom URL schemes.
   */
  resolveFileUrl?: (url: string) => Promise<string>;
  /**
   * Download behavior: 'download' forces download, 'open' opens in new tab, 'auto' tries download with fallback
   * @default 'auto'
   */
  downloadMethod?: "download" | "open" | "auto";
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

const props = withDefaults(defineProps<ImageDownloadButtonProps>(), {
  hideWhenUnavailable: false,
  showShortcut: false,
  downloadMethod: "auto",
});

const { editor } = useTiptapEditor(props.editor);

const {
  isVisible,
  canDownload,
  handleDownload,
  label,
  shortcutKeys,
  Icon,
} = useImageDownload({
  editor: editor.value,
  hideWhenUnavailable: props.hideWhenUnavailable,
  onDownloaded: props.onDownloaded,
  resolveFileUrl: props.resolveFileUrl,
  downloadMethod: props.downloadMethod,
});

const handleClick = async () => {
  await handleDownload();
};
</script>

<template>
  <Button
    v-if="isVisible"
    type="button"
    data-style="ghost"
    data-active-state="off"
    role="button"
    :tabindex="-1"
    :disabled="!canDownload"
    :data-disabled="!canDownload"
    :aria-label="label"
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
