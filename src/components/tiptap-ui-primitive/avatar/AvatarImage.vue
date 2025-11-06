<script setup lang="ts">
import { inject, ref, onMounted, watch, type Ref, type ComputedRef } from 'vue'

type ImageLoadingStatus = 'idle' | 'loading' | 'loaded' | 'error'

export interface AvatarImageProps {
  src?: string
  alt?: string
  referrerPolicy?: ReferrerPolicy
  class?: string
}

const props = defineProps<AvatarImageProps>()

const emit = defineEmits<{
  loadingStatusChange: [status: ImageLoadingStatus]
}>()

// Inject avatar context
const context = inject<{
  imageLoadingStatus: Ref<ImageLoadingStatus>
  onImageLoadingStatusChange: (status: ImageLoadingStatus) => void
  size: ComputedRef<string>
}>('avatarContext')

if (!context) {
  throw new Error('AvatarImage must be used within an Avatar component')
}

const { onImageLoadingStatusChange } = context
const imageLoadingStatus = ref<ImageLoadingStatus>('idle')

const loadImage = () => {
  if (!props.src) {
    imageLoadingStatus.value = 'error'
    return
  }

  imageLoadingStatus.value = 'loading'
  const image = new window.Image()

  image.onload = () => {
    imageLoadingStatus.value = 'loaded'
  }

  image.onerror = () => {
    imageLoadingStatus.value = 'error'
  }

  image.src = props.src
  if (props.referrerPolicy) {
    image.referrerPolicy = props.referrerPolicy
  }
}

onMounted(() => {
  loadImage()
})

watch(() => props.src, () => {
  loadImage()
})

watch(imageLoadingStatus, (newStatus) => {
  if (newStatus !== 'idle') {
    emit('loadingStatusChange', newStatus)
    onImageLoadingStatusChange(newStatus)
  }
})
</script>

<template>
  <img
    v-if="imageLoadingStatus === 'loaded'"
    :src="src"
    :alt="alt"
    :class="['tiptap-avatar-image', props.class]"
  />
</template>
