<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'
import Button from '@/components/tiptap-ui-primitive/button/Button.vue'
import SunIcon from '@/components/tiptap-icons/SunIcon.vue'
import MoonStarIcon from '@/components/tiptap-icons/MoonStarIcon.vue'

const isDarkMode = ref(false)

onMounted(() => {
  // Check meta tag or system preference
  const metaDark = document.querySelector('meta[name="color-scheme"][content="dark"]')
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
  isDarkMode.value = !!metaDark || prefersDark

  // Listen to system preference changes
  const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
  const handleChange = () => {
    isDarkMode.value = mediaQuery.matches
  }
  mediaQuery.addEventListener('change', handleChange)

  // Cleanup
  return () => {
    mediaQuery.removeEventListener('change', handleChange)
  }
})

// Update document class when dark mode changes
watch(isDarkMode, (isDark) => {
  document.documentElement.classList.toggle('dark', isDark)
})

const toggleDarkMode = () => {
  isDarkMode.value = !isDarkMode.value
}
</script>

<template>
  <Button
    @click="toggleDarkMode"
    :aria-label="`Switch to ${isDarkMode ? 'light' : 'dark'} mode`"
    data-style="ghost"
  >
    <MoonStarIcon v-if="isDarkMode" class="tiptap-button-icon" />
    <SunIcon v-else class="tiptap-button-icon" />
  </Button>
</template>
