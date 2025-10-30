<script setup lang="ts">
import { ref, inject, onBeforeUnmount, watch, nextTick, type Ref } from "vue";

interface PopoverContext {
  isOpen: Readonly<Ref<boolean>>;
  setOpen: (open: boolean) => void;
}

interface PopoverTriggerProps {
  asChild?: boolean;
}

const props = defineProps<PopoverTriggerProps>();

const popover = inject<PopoverContext>("popover");

const wrapperRef = ref<HTMLElement | null>(null);
// Inject the trigger ref from the parent Popover component
const triggerElementRef = inject<Ref<HTMLElement | null>>(
  "popover-trigger",
  ref<HTMLElement | null>(null)
);

const handleClick = () => {
  if (popover) {
    popover.setOpen(!popover.isOpen.value);
  }
};

// Watch for wrapperRef to be set, then set the trigger element
watch(
  wrapperRef,
  async (newWrapper) => {
    if (!newWrapper) return;

    await nextTick();
    await nextTick(); // Double nextTick to ensure Vue component rendering is complete

    if (props.asChild) {
      // Get the first child element (could be button or any other element)
      const childElement = newWrapper.firstElementChild as HTMLElement;
      if (childElement) {
        triggerElementRef.value = childElement;
        childElement.addEventListener("click", handleClick);
      }
    } else {
      triggerElementRef.value = newWrapper;
    }
  },
  { immediate: true }
);

onBeforeUnmount(() => {
  const element = triggerElementRef.value;
  if (element && props.asChild) {
    element.removeEventListener("click", handleClick);
  }
});

defineExpose({
  triggerRef: triggerElementRef,
});
</script>

<template>
  <span v-if="asChild" ref="wrapperRef">
    <slot />
  </span>
  <button
    v-else
    ref="wrapperRef"
    type="button"
    :aria-expanded="popover?.isOpen.value"
    aria-haspopup="dialog"
    @click="handleClick"
  >
    <slot />
  </button>
</template>
