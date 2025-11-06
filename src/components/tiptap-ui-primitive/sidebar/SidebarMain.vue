<script setup lang="ts">
import { useSidebar } from './Sidebar.vue'

interface SidebarMainProps {
  side?: 'left' | 'right'
  collapsible?: 'offcanvas'
}

withDefaults(defineProps<SidebarMainProps>(), {
  side: 'left',
  collapsible: 'offcanvas',
})

const { state } = useSidebar()
</script>

<template>
  <div
    class="sidebar"
    :data-state="state"
    :data-collapsible="state === 'collapsed' ? collapsible : ''"
    :data-side="side"
  >
    <!-- Sidebar gap for desktop -->
    <div
      class="sidebar-gap"
      :data-collapsible="state === 'collapsed' ? collapsible : ''"
      :data-side="side"
    />
    <div
      class="sidebar-container"
      :data-state="state"
      :data-collapsible="state === 'collapsed' ? collapsible : ''"
      :data-side="side"
    >
      <div data-sidebar="sidebar" class="sidebar-main">
        <slot />
      </div>
    </div>
  </div>
</template>
