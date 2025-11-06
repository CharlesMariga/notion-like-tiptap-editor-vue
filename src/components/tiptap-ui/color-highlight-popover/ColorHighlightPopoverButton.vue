<template>
  <Button
    type="button"
    data-style="ghost"
    data-appearance="default"
    role="button"
    :tabindex="-1"
    aria-label="Highlight text"
    tooltip="Highlight"
    v-bind="$attrs"
  >
    <slot>
      <HighlighterIcon class="tiptap-button-icon" />
    </slot>
  </Button>
</template>

<script setup lang="ts">
// --- UI Primitives ---
import Button from '@/components/tiptap-ui-primitive/button/Button.vue'

// --- Icons ---
import HighlighterIcon from '@/components/tiptap-icons/HighlighterIcon.vue'
</script>
