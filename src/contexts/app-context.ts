import { inject, provide, ref, type InjectionKey, type Ref } from 'vue'

export type AppContextValue = {
  activeThread: Ref<string | null>
  setActiveThread: (threadId: string | null) => void

  /**
   * A map of thread ids to their respective bubble elements
   */
  threadBubbles: Ref<Record<string, HTMLElement[]>>

  /**
   * Add new thread bubbles to the map
   * @param threadIds The thread IDs attached to the bubble
   * @param element The bubble element
   * @returns void
   */
  addThreadBubble: (threadIds: string | string[], element: HTMLElement) => void

  /**
   * Remove a thread bubble from the map
   * @param threadIdOrElement The thread ID or element to remove
   * @returns void
   */
  removeThreadBubble: (threadIdOrElement: string | HTMLElement) => void
}

const AppContextKey: InjectionKey<AppContextValue> = Symbol('AppContext')

export function provideAppContext() {
  const activeThread = ref<string | null>(null)
  const threadBubbles = ref<Record<string, HTMLElement[]>>({})

  const setActiveThread = (threadId: string | null) => {
    activeThread.value = threadId
  }

  const addThreadBubble = (threadIds: string | string[], element: HTMLElement) => {
    const ids = Array.isArray(threadIds) ? threadIds : [threadIds]

    ids.forEach((id) => {
      const hasThread = threadBubbles.value[id]
      const hasElement = threadBubbles.value[id]?.includes(element)

      if (hasThread && hasElement) {
        return
      }

      if (!threadBubbles.value[id]) {
        threadBubbles.value[id] = [element]
        return
      }

      threadBubbles.value[id] = [...threadBubbles.value[id], element]
    })
  }

  const removeThreadBubble = (threadIdOrElement: string | HTMLElement) => {
    const isElement = typeof threadIdOrElement !== 'string'
    const isString = typeof threadIdOrElement === 'string'

    if (isString) {
      delete threadBubbles.value[threadIdOrElement]
      return
    }

    if (isElement) {
      const element = threadIdOrElement as HTMLElement

      Object.keys(threadBubbles.value).forEach((id) => {
        const threadBubble = threadBubbles.value[id]

        // if the element is included in the thread bubble
        // we'll remove it from the array
        if (threadBubble && threadBubble.includes(element)) {
          threadBubbles.value[id] = threadBubble.filter((el) => el !== element)
        }

        // if there are no more elements in the thread bubble
        // we'll remove the thread bubble data
        if (threadBubbles.value[id] && threadBubbles.value[id].length === 0) {
          delete threadBubbles.value[id]
        }
      })
    }
  }

  const contextValue: AppContextValue = {
    activeThread,
    setActiveThread,
    threadBubbles,
    addThreadBubble,
    removeThreadBubble,
  }

  provide(AppContextKey, contextValue)

  return contextValue
}

/**
 * Hook to access the app state.
 * @returns {AppContextValue}
 */
export const useAppState = (): AppContextValue => {
  const context = inject(AppContextKey)
  if (!context) {
    throw new Error('useAppState must be used within a component with AppContext provided')
  }
  return context
}
