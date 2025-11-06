import { onMounted, onUnmounted, type Ref } from 'vue'

type EventType = 'mousedown' | 'mouseup' | 'touchstart' | 'touchend' | 'focusin' | 'focusout'

/**
 * Custom composable that handles clicks outside specified element(s).
 * @param ref - The Vue ref object(s) representing the element(s) to watch for outside clicks
 * @param handler - The callback function to be executed when a click outside the element occurs
 * @param eventType - The mouse event type to listen for (optional, default is 'mousedown')
 * @param eventListenerOptions - The options object to be passed to the `addEventListener` method (optional)
 */
export function useOnClickOutside<T extends HTMLElement | null = HTMLElement>(
  ref: Ref<T> | Ref<T>[],
  handler: (event: MouseEvent | TouchEvent | FocusEvent) => void,
  eventType: EventType = 'mousedown',
  eventListenerOptions: AddEventListenerOptions = {}
): void {
  const listener = (event: Event) => {
    const target = event.target as Node

    // Do nothing if the target is not connected element with document
    if (!target || !target.isConnected) {
      return
    }

    const isOutside = Array.isArray(ref)
      ? ref
          .filter((r) => Boolean(r.value))
          .every((r) => r.value && !r.value.contains(target))
      : ref.value && !ref.value.contains(target)

    if (isOutside) {
      handler(event as MouseEvent | TouchEvent | FocusEvent)
    }
  }

  onMounted(() => {
    window.addEventListener(eventType, listener, eventListenerOptions)
  })

  onUnmounted(() => {
    window.removeEventListener(eventType, listener, eventListenerOptions)
  })
}
