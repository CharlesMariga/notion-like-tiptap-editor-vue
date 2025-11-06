<script setup lang="ts">
import { provide, ref, computed, type CSSProperties } from 'vue'
import './avatar.scss'

type ImageLoadingStatus = 'idle' | 'loading' | 'loaded' | 'error'
type Size = 'default' | 'sm' | 'lg' | 'xl'

export interface AvatarProps {
  size?: Size
  userColor?: string
  class?: string
}

const props = withDefaults(defineProps<AvatarProps>(), {
  size: 'default',
})

const imageLoadingStatus = ref<ImageLoadingStatus>('idle')

const onImageLoadingStatusChange = (status: ImageLoadingStatus) => {
  imageLoadingStatus.value = status
}

// Provide context for child components
provide('avatarContext', {
  imageLoadingStatus,
  onImageLoadingStatusChange,
  size: computed(() => props.size),
})

const style = computed<CSSProperties | undefined>(() => {
  return props.userColor
    ? { '--dynamic-user-color': props.userColor }
    : undefined
})
</script>

<template>
  <span
    :class="['tiptap-avatar', props.class]"
    :style="style"
    :data-size="size"
  >
    <span class="tiptap-avatar-item">
      <slot />
    </span>
  </span>
</template>
