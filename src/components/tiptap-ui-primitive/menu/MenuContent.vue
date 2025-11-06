<script setup lang="ts">
import { ref, computed } from 'vue'
import { DropdownMenuContent, DropdownMenuPortal } from 'radix-vue'
import { useOnClickOutside } from '@/composables/useOnClickOutside'
import { useMenuContext } from './menu-context'
import { cn } from '@/lib/tiptap-utils'
import type { MenuContentProps } from './menu-types'

const props = withDefaults(defineProps<MenuContentProps & { class?: string }>(), {
  class: '',
  portal: false,
})

defineEmits<{
  (e: 'close'): void
}>()

const menuRef = ref<HTMLElement | null>(null)
const menuContext = useMenuContext()
const open = computed(() => menuContext.value.open)

if (props.onClickOutside) {
  useOnClickOutside(menuRef, props.onClickOutside)
}
</script>

<template>
  <DropdownMenuPortal :disabled="!portal">
    <DropdownMenuContent
      ref="menuRef"
      :class="cn('tiptap-menu-content', props.class)"
      :data-state="open ? 'open' : 'closed'"
      :align-offset="4"
      :side="props.side"
      :align="props.align"
    >
      <slot />
    </DropdownMenuContent>
  </DropdownMenuPortal>
</template>
