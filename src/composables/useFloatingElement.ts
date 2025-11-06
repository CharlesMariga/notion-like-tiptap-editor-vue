import { ref, computed, watch, unref, type Ref, type CSSProperties, type MaybeRef } from 'vue'
import type { UseFloatingOptions } from '@floating-ui/vue'
import { useFloating } from '@floating-ui/vue'

interface FloatingElementReturn {
  /**
   * Whether the floating element is currently mounted in the DOM.
   */
  isMounted: Ref<boolean>
  /**
   * Combined styles for positioning, transitions, and z-index.
   */
  style: Ref<CSSProperties>
  /**
   * Function to manually trigger position updates of the floating element.
   */
  update: () => void
  /**
   * Returns props that should be spread onto the floating element.
   */
  getFloatingProps: (
    userProps?: Record<string, unknown>
  ) => Record<string, unknown>
  /**
   * Returns props that should be spread onto the reference element.
   */
  getReferenceProps: (
    userProps?: Record<string, unknown>
  ) => Record<string, unknown>
  /**
   * Refs object containing floating and reference element refs
   */
  refs: {
    floating: Ref<HTMLElement | null>
    reference: Ref<Element | null>
  }
}

/**
 * Custom composable for creating and managing floating elements relative to a reference position
 *
 * @param show - Ref controlling visibility of the floating element
 * @param referencePos - Ref containing DOMRect representing the position to anchor the floating element to
 * @param zIndex - Z-index value for the floating element
 * @param options - Additional options to pass to the underlying useFloating hook
 * @returns Object containing properties and methods to control the floating element
 */
export function useFloatingElement(
  show: Ref<boolean>,
  referencePos: Ref<DOMRect | null>,
  zIndex: number,
  options?: MaybeRef<Partial<UseFloatingOptions>>
): FloatingElementReturn {
  const reference = ref<Element | null>(null)
  const floating = ref<HTMLElement | null>(null)
  const isMounted = ref(false)

  // Watch show state to update mounted status
  watch(
    show,
    (isShown) => {
      isMounted.value = isShown
    },
    { immediate: true }
  )

  const { floatingStyles, update } = useFloating(reference, floating, {
    open: show,
    ...unref(options),
  })

  watch(
    () => referencePos.value,
    () => {
      update()
    }
  )

  watch(
    () => referencePos.value,
    (newPos) => {
      if (newPos === null) {
        return
      }

      reference.value = {
        getBoundingClientRect: () => newPos,
      } as Element
    },
    { immediate: true }
  )

  const combinedStyle = computed(() => ({
    ...floatingStyles.value,
    zIndex,
  }))

  const getFloatingProps = (userProps?: Record<string, unknown>) => ({
    ...userProps,
  })

  const getReferenceProps = (userProps?: Record<string, unknown>) => ({
    ...userProps,
  })

  return {
    isMounted,
    style: combinedStyle,
    update,
    getFloatingProps,
    getReferenceProps,
    refs: {
      floating,
      reference,
    },
  }
}
