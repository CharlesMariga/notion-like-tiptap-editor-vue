<script setup lang="ts">
import { PopoverRoot } from 'radix-vue'

defineOptions({
  inheritAttrs: true,
})
</script>

<template>
  <PopoverRoot v-bind="$attrs">
    <slot />
  </PopoverRoot>
</template>
