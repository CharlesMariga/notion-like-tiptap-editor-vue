<script setup lang="ts">
import { Button } from '@/components/tiptap-ui-primitive/button'
import MessageSquareIcon from '@/components/tiptap-icons/MessageSquareIcon.vue'
import { useSidebar } from './Sidebar.vue'

const { toggleSidebar } = useSidebar()

const handleClick = () => {
  toggleSidebar()
}
</script>

<template>
  <Button
    data-sidebar="trigger"
    data-style="ghost"
    @click="handleClick"
  >
    <MessageSquareIcon class="tiptap-button-icon" />
  </Button>
</template>
