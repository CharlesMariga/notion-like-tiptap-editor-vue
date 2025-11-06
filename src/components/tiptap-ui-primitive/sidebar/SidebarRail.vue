<script setup lang="ts">
import { useSidebar } from './Sidebar.vue'

const { toggleSidebar } = useSidebar()
</script>

<template>
  <button
    data-sidebar="rail"
    aria-label="Toggle Sidebar"
    tabindex="-1"
    title="Toggle Sidebar"
    class="sidebar-rail"
    @click="toggleSidebar"
  />
</template>
