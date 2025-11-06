import throttle from 'lodash.throttle'
import { onUnmounted } from 'vue'

interface ThrottleSettings {
  leading?: boolean | undefined
  trailing?: boolean | undefined
}

const defaultOptions: ThrottleSettings = {
  leading: false,
  trailing: true,
}

/**
 * A composable that returns a throttled callback function.
 *
 * @param fn The function to throttle
 * @param wait The time in ms to wait before calling the function
 * @param options The throttle options
 */
export function useThrottledCallback<T extends (...args: any[]) => any>(
  fn: T,
  wait = 250,
  options: ThrottleSettings = defaultOptions
): {
  (this: ThisParameterType<T>, ...args: Parameters<T>): ReturnType<T> | undefined
  cancel: () => void
  flush: () => void
} {
  const handler = throttle<T>(fn, wait, options)

  onUnmounted(() => {
    handler.cancel()
  })

  return handler
}

export default useThrottledCallback
