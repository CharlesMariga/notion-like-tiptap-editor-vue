<script setup lang="ts">
import { useSlots, computed } from 'vue'
import Avatar from './Avatar.vue'
import AvatarFallback from './AvatarFallback.vue'

export interface AvatarGroupProps {
  maxVisible?: number
  class?: string
}

const props = defineProps<AvatarGroupProps>()

const slots = useSlots()

const childrenArray = computed(() => {
  const defaultSlot = slots.default?.() || []
  return defaultSlot
})

const visibleAvatars = computed(() => {
  if (props.maxVisible) {
    return childrenArray.value.slice(0, props.maxVisible)
  }
  return childrenArray.value
})

const remainingCount = computed(() => {
  return childrenArray.value.length - visibleAvatars.value.length
})
</script>

<template>
  <div
    :class="['tiptap-avatar-group', props.class]"
    :data-max-user-visible="maxVisible"
  >
    <component
      v-for="(child, index) in visibleAvatars"
      :key="index"
      :is="child"
    />
    <Avatar v-if="remainingCount > 0">
      <AvatarFallback>+{{ remainingCount }}</AvatarFallback>
    </Avatar>
  </div>
</template>
