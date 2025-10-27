<script setup lang="ts">
import { Button } from "../../tiptap-ui-primitive/button";

defineProps({
  /**
   * Optional text to display alongside the icon.
   */
  text: {
    type: String,
    required: false,
  },

  /**
   * Optional show shortcut keys in the button.
   * @default false
   */
  showShortcutKeys: {
    type: Boolean,
    default: false,
  },
});
</script>

<template>
  <Button type="button" data-style="ghost" role="button" :tabindex="-1">
    <slot>
      <span v-if="text" class="tiptap-button-text">{{ text }}</span>
    </slot>
  </Button>
</template>
