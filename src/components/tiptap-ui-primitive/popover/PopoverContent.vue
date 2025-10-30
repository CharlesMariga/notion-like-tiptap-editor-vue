<script setup lang="ts">
import {
  ref,
  inject,
  computed,
  onMounted,
  onUnmounted,
  useAttrs,
  watch,
  type Ref,
} from "vue";
import {
  useFloating,
  flip,
  shift,
  offset,
  autoUpdate,
  type Placement,
} from "@floating-ui/vue";
import { cn } from "@/lib/tiptap-utils";
import "@/components/tiptap-ui-primitive/popover/popover.scss";

interface PopoverContext {
  isOpen: Readonly<Ref<boolean>>;
  setOpen: (open: boolean) => void;
}

interface PopoverContentProps {
  class?: string;
  align?: "start" | "center" | "end";
  side?: "top" | "right" | "bottom" | "left";
  sideOffset?: number;
  alignOffset?: number;
  asChild?: boolean;
}

const props = withDefaults(defineProps<PopoverContentProps>(), {
  align: "center",
  side: "bottom",
  sideOffset: 4,
  alignOffset: 0,
});

defineOptions({
  inheritAttrs: false,
});

const attrs = useAttrs();

const popover = inject<PopoverContext>("popover");
const triggerRef = inject<Ref<HTMLElement | null>>(
  "popover-trigger",
  ref<HTMLElement | null>(null),
  false
);

const contentRef = ref<HTMLElement | null>(null);

// Convert align/side to floating-ui placement
const placement = computed<Placement>(() => {
  const side = props.side;
  const align = props.align;

  if (align === "center") {
    return side;
  }

  return `${side}-${align}` as Placement;
});

// Set up floating-ui with autoUpdate to handle position updates
const { floatingStyles, update } = useFloating(
  triggerRef as Ref<HTMLElement | null>,
  contentRef,
  {
    placement,
    strategy: "fixed",
    middleware: [offset(props.sideOffset), flip(), shift({ padding: 8 })],
    open: popover?.isOpen,
    whileElementsMounted: autoUpdate,
  }
);

// Manually trigger update when trigger ref becomes available
watch(
  [triggerRef, contentRef, () => popover?.isOpen.value],
  ([trigger, content, isOpen]) => {
    if (trigger && content && isOpen) {
      update();
    }
  }
);

// Handle click outside to close
const handleClickOutside = (event: MouseEvent) => {
  if (!popover?.isOpen.value) return;

  const target = event.target as Node;
  const isOutsideTrigger =
    triggerRef?.value && !triggerRef.value.contains(target);
  const isOutsideContent =
    contentRef.value && !contentRef.value.contains(target);

  if (isOutsideTrigger && isOutsideContent) {
    popover.setOpen(false);
  }
};

// Handle escape key to close
const handleEscape = (event: KeyboardEvent) => {
  if (event.key === "Escape" && popover?.isOpen.value) {
    popover.setOpen(false);
  }
};

onMounted(() => {
  document.addEventListener("mousedown", handleClickOutside);
  document.addEventListener("keydown", handleEscape);
});

onUnmounted(() => {
  document.removeEventListener("mousedown", handleClickOutside);
  document.removeEventListener("keydown", handleEscape);
});

const className = computed(() => cn("tiptap-popover", props.class));
</script>

<template>
  <Teleport to="body">
    <div
      v-if="popover?.isOpen.value"
      ref="contentRef"
      :class="className"
      :style="floatingStyles"
      role="dialog"
      aria-modal="false"
      v-bind="attrs"
    >
      <slot />
    </div>
  </Teleport>
</template>
