<script setup lang="ts">
import { inject, ref, onMounted, onUnmounted, computed, type Ref, type ComputedRef } from 'vue'

type ImageLoadingStatus = 'idle' | 'loading' | 'loaded' | 'error'

export interface AvatarFallbackProps {
  delayMs?: number
  class?: string
}

const props = defineProps<AvatarFallbackProps>()

// Inject avatar context
const context = inject<{
  imageLoadingStatus: Ref<ImageLoadingStatus>
  onImageLoadingStatusChange: (status: ImageLoadingStatus) => void
  size: ComputedRef<string>
}>('avatarContext')

if (!context) {
  throw new Error('AvatarFallback must be used within an Avatar component')
}

const canRender = ref(props.delayMs === undefined)
let timerId: number | undefined

onMounted(() => {
  if (props.delayMs !== undefined) {
    timerId = window.setTimeout(() => {
      canRender.value = true
    }, props.delayMs)
  }
})

onUnmounted(() => {
  if (timerId !== undefined) {
    window.clearTimeout(timerId)
  }
})

const shouldShow = computed(() => {
  return canRender.value && context.imageLoadingStatus.value !== 'loaded'
})
</script>

<template>
  <template v-if="shouldShow">
    <span :class="['tiptap-avatar-bg', props.class]" />
    <span :class="['tiptap-avatar-fallback', props.class]">
      <slot />
    </span>
  </template>
</template>
