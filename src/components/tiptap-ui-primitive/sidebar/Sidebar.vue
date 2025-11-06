<script setup lang="ts">
import { computed, provide, inject, ref, onMounted, onBeforeUnmount, type InjectionKey } from 'vue'
import { useMobile } from '@/composables/useMobile'

interface SidebarContext {
  state: 'expanded' | 'collapsed'
  open: boolean
  setOpen: (open: boolean) => void
  openMobile: boolean
  setOpenMobile: (open: boolean) => void
  isMobile: boolean
  toggleSidebar: () => void
}

const SIDEBAR_INJECTION_KEY = Symbol('sidebar') as InjectionKey<SidebarContext>

export function useSidebar() {
  const context = inject(SIDEBAR_INJECTION_KEY)
  if (!context) {
    throw new Error('useSidebar must be used within a SidebarProvider.')
  }
  return context
}

// SidebarProvider component
interface SidebarProviderProps {
  defaultOpen?: boolean
  open?: boolean
  sidebarWidth?: string
}

const props = withDefaults(defineProps<SidebarProviderProps>(), {
  defaultOpen: true,
  sidebarWidth: '26rem',
})

const emit = defineEmits<{
  'update:open': [value: boolean]
}>()

const SIDEBAR_COOKIE_NAME = 'sidebar_state'
const SIDEBAR_COOKIE_MAX_AGE = 60 * 60 * 24 * 7
const SIDEBAR_KEYBOARD_SHORTCUT = 'b'

const isMobile = useMobile()
const openMobile = ref(false)
const setOpenMobile = (value: boolean) => {
  openMobile.value = value
}

// Internal state
const _open = ref(props.defaultOpen)

const open = computed(() => props.open ?? _open.value)

const setOpen = (value: boolean | ((value: boolean) => boolean)) => {
  const openState = typeof value === 'function' ? value(open.value) : value

  if (props.open !== undefined) {
    emit('update:open', openState)
  } else {
    _open.value = openState
  }

  // Set cookie to persist sidebar state
  document.cookie = `${SIDEBAR_COOKIE_NAME}=${openState}; path=/; max-age=${SIDEBAR_COOKIE_MAX_AGE}`
}

const toggleSidebar = () => {
  if (isMobile.value) {
    setOpenMobile(!openMobile.value)
  } else {
    setOpen(!open.value)
  }
}

// Keyboard shortcut
const handleKeyDown = (event: KeyboardEvent) => {
  if (
    event.key === SIDEBAR_KEYBOARD_SHORTCUT &&
    (event.metaKey || event.ctrlKey)
  ) {
    event.preventDefault()
    toggleSidebar()
  }
}

onMounted(() => {
  window.addEventListener('keydown', handleKeyDown)
})

onBeforeUnmount(() => {
  window.removeEventListener('keydown', handleKeyDown)
})

const state = computed(() => (open.value ? 'expanded' : 'collapsed'))

const contextValue = computed<SidebarContext>(() => ({
  state: state.value,
  open: open.value,
  setOpen,
  isMobile: isMobile.value,
  openMobile: openMobile.value,
  setOpenMobile,
  toggleSidebar,
}))

provide(SIDEBAR_INJECTION_KEY, contextValue.value)
</script>

<template>
  <div
    class="sidebar-wrapper"
    :style="{
      '--sidebar-width': sidebarWidth,
    }"
  >
    <slot />
  </div>
</template>
