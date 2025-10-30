<script setup lang="ts">
import { ref, provide, readonly, watch } from "vue";

/**
 * Popover root component that manages the open/closed state
 * and provides context to child components
 */
interface PopoverProps {
  /**
   * Controlled open state
   */
  open?: boolean;
  /**
   * Default open state for uncontrolled usage
   */
  defaultOpen?: boolean;
  /**
   * Callback when open state changes
   */
  onOpenChange?: (open: boolean) => void;
}

const props = defineProps<PopoverProps>();
const emit = defineEmits<{
  "update:open": [open: boolean];
}>();

// Internal state for uncontrolled mode
const internalOpen = ref(props.defaultOpen ?? false);

// Use controlled state if provided, otherwise use internal state
const isOpen = ref(props.open ?? internalOpen.value);

const setOpen = (value: boolean) => {
  if (props.open === undefined) {
    // Uncontrolled mode
    internalOpen.value = value;
  }

  isOpen.value = value;
  emit("update:open", value);
  props.onOpenChange?.(value);
};

// Watch for controlled prop changes
watch(
  () => props.open,
  (newValue) => {
    if (newValue !== undefined) {
      isOpen.value = newValue;
    }
  }
);

// Create a ref for the trigger element that will be set by PopoverTrigger
const triggerRef = ref<HTMLElement | null>(null);

// Provide state and trigger ref to children
provide("popover", {
  isOpen: readonly(isOpen),
  setOpen,
});

provide("popover-trigger", triggerRef);
</script>

<template>
  <slot />
</template>

<style lang="scss">
@use "./popover.scss";
</style>
