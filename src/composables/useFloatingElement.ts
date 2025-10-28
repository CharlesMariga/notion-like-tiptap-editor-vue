import {
  computed,
  watch,
  ref,
  toValue,
  type CSSProperties,
  type Ref,
  type MaybeRefOrGetter,
} from "vue";
import {
  useFloating,
  type UseFloatingOptions,
} from "@floating-ui/vue";

interface FloatingElementReturn {
  /**
   * Ref to attach to the floating element DOM node.
   */
  floatingRef: Ref<HTMLElement | null>;
  /**
   * Combined styles for positioning and z-index.
   */
  style: Ref<CSSProperties>;
  /**
   * Function to manually trigger position updates of the floating element.
   */
  update: () => void;
}

/**
 * Custom composable for creating and managing floating elements relative to a reference position
 *
 * @param show - Boolean or ref controlling visibility of the floating element
 * @param referencePos - DOMRect or ref representing the position to anchor the floating element to
 * @param zIndex - Z-index value for the floating element
 * @param options - Additional options to pass to the underlying useFloating hook
 * @returns Object containing properties and methods to control the floating element
 */
export function useFloatingElement(
  show: MaybeRefOrGetter<boolean>,
  referencePos: MaybeRefOrGetter<DOMRect | null>,
  zIndex: MaybeRefOrGetter<number>,
  options?: MaybeRefOrGetter<Partial<UseFloatingOptions>>
): FloatingElementReturn {
  // Convert to refs for reactivity
  const isOpen = computed(() => toValue(show));
  const position = computed(() => toValue(referencePos));
  const zIndexValue = computed(() => toValue(zIndex));
  const optionsValue = computed(() => toValue(options) ?? {});

  // Create refs for floating-ui
  const referenceRef = ref<HTMLElement | null>(null);
  const floatingRef = ref<HTMLElement | null>(null);

  // Set up floating-ui with the v1.x API (takes two refs as arguments)
  const { floatingStyles, update } = useFloating(referenceRef, floatingRef, {
    open: isOpen,
    ...optionsValue.value,
  });

  // Set reference element based on position
  watch(
    position,
    (newPos) => {
      if (newPos === null) {
        referenceRef.value = null;
        return;
      }

      // Create a virtual element from the DOMRect
      referenceRef.value = {
        getBoundingClientRect: () => newPos,
      } as any;
    },
    { immediate: true }
  );

  // Update position when referencePos changes
  watch(position, () => {
    if (position.value) {
      update();
    }
  });

  // Combine floating styles with z-index
  const combinedStyle = computed<CSSProperties>(() => ({
    ...floatingStyles.value,
    zIndex: zIndexValue.value,
    // Only show when open
    display: isOpen.value ? undefined : "none",
  }));

  return {
    floatingRef,
    style: combinedStyle,
    update,
  };
}
