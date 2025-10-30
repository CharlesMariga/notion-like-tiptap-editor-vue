<script setup lang="ts">
import { ref, watch, onMounted, onUnmounted, computed } from "vue";
import { cn } from "@/lib/tiptap-utils";

interface ToolbarProps {
  variant?: "floating" | "fixed";
  class?: string;
}

const props = withDefaults(defineProps<ToolbarProps>(), {
  variant: "fixed",
});

const toolbarRef = ref<HTMLDivElement | null>(null);
const items = ref<HTMLElement[]>([]);

const collectItems = () => {
  if (!toolbarRef.value) return [];
  return Array.from(
    toolbarRef.value.querySelectorAll<HTMLElement>(
      'button:not([disabled]), [role="button"]:not([disabled]), [tabindex="0"]:not([disabled])'
    )
  );
};

// Watch for DOM changes to update items
onMounted(() => {
  const toolbar = toolbarRef.value;
  if (!toolbar) return;

  const updateItems = () => {
    items.value = collectItems();
  };

  updateItems();
  const observer = new MutationObserver(updateItems);
  observer.observe(toolbar, { childList: true, subtree: true });

  onUnmounted(() => observer.disconnect());
});

// Keyboard navigation state
const selectedIndex = ref<number>(-1);

// Handle keyboard navigation manually for toolbar
const handleKeyDown = (event: KeyboardEvent) => {
  if (!items.value.length) return;

  let handled = false;

  switch (event.key) {
    case "ArrowLeft":
      event.preventDefault();
      selectedIndex.value =
        selectedIndex.value <= 0
          ? items.value.length - 1
          : selectedIndex.value - 1;
      handled = true;
      break;

    case "ArrowRight":
      event.preventDefault();
      selectedIndex.value = (selectedIndex.value + 1) % items.value.length;
      handled = true;
      break;

    case "Home":
      event.preventDefault();
      selectedIndex.value = 0;
      handled = true;
      break;

    case "End":
      event.preventDefault();
      selectedIndex.value = items.value.length - 1;
      handled = true;
      break;

    case "Enter":
    case " ":
      if (selectedIndex.value >= 0) {
        const selectedItem = items.value[selectedIndex.value];
        if (selectedItem) {
          event.preventDefault();
          selectedItem.click();
          handled = true;
        }
      }
      break;
  }

  return handled;
};

// Set up keyboard navigation
onMounted(() => {
  const toolbar = toolbarRef.value;
  if (!toolbar) return;

  toolbar.addEventListener("keydown", handleKeyDown);

  onUnmounted(() => {
    toolbar.removeEventListener("keydown", handleKeyDown);
  });
});

// Handle focus states
onMounted(() => {
  const toolbar = toolbarRef.value;
  if (!toolbar) return;

  const handleFocus = (e: FocusEvent) => {
    const target = e.target as HTMLElement;
    if (toolbar.contains(target)) {
      target.setAttribute("data-focus-visible", "true");
    }
  };

  const handleBlur = (e: FocusEvent) => {
    const target = e.target as HTMLElement;
    if (toolbar.contains(target)) {
      target.removeAttribute("data-focus-visible");
    }
  };

  toolbar.addEventListener("focus", handleFocus, true);
  toolbar.addEventListener("blur", handleBlur, true);

  onUnmounted(() => {
    toolbar.removeEventListener("focus", handleFocus, true);
    toolbar.removeEventListener("blur", handleBlur, true);
  });
});

// Focus the selected item
watch(selectedIndex, (index) => {
  if (index >= 0 && items.value[index]) {
    items.value[index].focus();
  }
});

const className = computed(() => cn("tiptap-toolbar", props.class));

// Expose the toolbar ref for parent components
defineExpose({
  toolbarRef,
});
</script>

<template>
  <div
    ref="toolbarRef"
    role="toolbar"
    aria-label="toolbar"
    :data-variant="variant"
    :class="className"
  >
    <slot />
  </div>
</template>

<style lang="scss">
@use "./toolbar.scss";
</style>
