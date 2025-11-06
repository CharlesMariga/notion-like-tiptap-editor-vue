import { inject, provide, ref, onMounted, watch, type InjectionKey, type Ref } from 'vue'
import { fetchAiToken, getUrlParam } from '@/lib/tiptap-collab-utils'

export type AiContextValue = {
  aiToken: Ref<string | null>
  hasAi: Ref<boolean>
}

const AiContextKey: InjectionKey<AiContextValue> = Symbol('AiContext')

export function useAiToken() {
  const aiToken = ref<string | null>(null)
  const hasAi = ref<boolean>(true)

  onMounted(() => {
    const noAiParam = getUrlParam('noAi')
    hasAi.value = parseInt(noAiParam || '0') !== 1
  })

  watch(
    hasAi,
    async (newHasAi) => {
      if (!newHasAi) return

      const token = await fetchAiToken()
      aiToken.value = token
    },
    { immediate: true }
  )

  return { aiToken, hasAi }
}

export function provideAiContext() {
  const { hasAi, aiToken } = useAiToken()

  const contextValue: AiContextValue = {
    hasAi,
    aiToken,
  }

  provide(AiContextKey, contextValue)

  return contextValue
}

export const useAi = (): AiContextValue => {
  const context = inject(AiContextKey)
  if (!context) {
    throw new Error('useAi must be used within a component with AiContext provided')
  }
  return context
}
