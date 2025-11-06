<script setup lang="ts">
import { PopoverTrigger as RadixPopoverTrigger } from 'radix-vue'

defineOptions({
  inheritAttrs: true,
})
</script>

<template>
  <RadixPopoverTrigger v-bind="$attrs" as-child>
    <slot />
  </RadixPopoverTrigger>
</template>
