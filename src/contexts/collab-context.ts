import { inject, provide, ref, onMounted, watch, onUnmounted, type InjectionKey, type Ref } from 'vue'
import { Doc as YDoc } from 'yjs'
import {
  fetchCollabToken,
  getUrlParam,
  TIPTAP_COLLAB_DOC_PREFIX,
  TIPTAP_COLLAB_APP_ID,
} from '@/lib/tiptap-collab-utils'

// Type stub for TiptapCollabProvider (will be available when @tiptap-pro/provider is installed)
type TiptapCollabProvider = any

export type CollabContextValue = {
  provider: Ref<TiptapCollabProvider | null>
  ydoc: YDoc
  hasCollab: Ref<boolean>
}

const CollabContextKey: InjectionKey<CollabContextValue> = Symbol('CollabContext')

export type CollaborationOptions = {
  room: string
  initialContent?: Record<string, any>
}

export function useCollaboration(options: CollaborationOptions) {
  const { room, initialContent } = options
  const provider = ref<TiptapCollabProvider | null>(null)
  const collabToken = ref<string | null>(null)
  const hasCollab = ref<boolean>(true)
  const ydoc = new YDoc()

  onMounted(() => {
    const noCollabParam = getUrlParam('noCollab')
    hasCollab.value = parseInt(noCollabParam || '0') !== 1
  })

  watch(
    hasCollab,
    async (newHasCollab) => {
      if (!newHasCollab) return

      const token = await fetchCollabToken()
      collabToken.value = token
    },
    { immediate: true }
  )

  watch(
    [collabToken, hasCollab],
    async ([newCollabToken, newHasCollab]) => {
      console.log('🔍 Collab watch triggered:', { hasCollab: newHasCollab, hasToken: !!newCollabToken })

      if (!newHasCollab || !newCollabToken) {
        console.log('⏭️  Skipping provider creation - no collab or no token')
        return
      }

      try {
        // Dynamically import TiptapCollabProvider only if available
        const { TiptapCollabProvider } = await import('@tiptap-pro/provider')

        const docPrefix = TIPTAP_COLLAB_DOC_PREFIX
        const documentName = room ? `${docPrefix}${room}` : docPrefix
        const appId = TIPTAP_COLLAB_APP_ID

        console.log('🔄 Attempting to connect to Tiptap Collaboration...')
        console.log('📝 Document name:', documentName)
        console.log('🆔 App ID:', appId)
        console.log('ℹ️  If connection fails (e.g., expired token), the editor will work in offline mode.')

        const newProvider = new TiptapCollabProvider({
          name: documentName,
          appId,
          token: newCollabToken,
          document: ydoc,
          ...(initialContent && { initialContent }),
        })

        // Track if we've connected at least once
        let hasConnected = false

        // Listen for connection status
        newProvider.on('status', ({ status }: { status: string }) => {
          if (status === 'connected') {
            hasConnected = true
            console.log('✓ Collaboration connected successfully')
          } else if (status === 'disconnected' && hasConnected) {
            console.warn('⚠ Collaboration disconnected. Working in offline mode.')
          }
        })

        // Handle authentication errors
        newProvider.on('authenticationFailed', () => {
          console.warn('⚠ Collaboration authentication failed (token may be expired). Working in offline mode.')
          // Don't disable hasCollab - just work offline
        })

        // Handle connection errors silently - working offline is expected
        newProvider.on('synced', ({ state }: { state: boolean }) => {
          if (state && !hasConnected) {
            hasConnected = true
          }
        })

        provider.value = newProvider
      } catch (error) {
        console.warn('TiptapCollabProvider not available. Collaboration features will be disabled.', error)
        hasCollab.value = false
      }
    },
    { immediate: false }
  )

  onUnmounted(() => {
    if (provider.value) {
      provider.value.destroy()
    }
  })

  return { provider, ydoc, hasCollab }
}

export function provideCollabContext(options: CollaborationOptions | string) {
  // Support both string (room) and options object for backwards compatibility
  const collabOptions = typeof options === 'string' ? { room: options } : options
  const { hasCollab, provider, ydoc } = useCollaboration(collabOptions)

  const contextValue: CollabContextValue = {
    hasCollab,
    provider,
    ydoc,
  }

  provide(CollabContextKey, contextValue)

  return contextValue
}

export const useCollab = (): CollabContextValue => {
  const context = inject(CollabContextKey)
  if (!context) {
    throw new Error('useCollab must be used within a component with CollabContext provided')
  }
  return context
}
