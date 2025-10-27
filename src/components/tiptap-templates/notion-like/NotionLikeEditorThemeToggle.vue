<script setup lang="ts">
import { useColorMode } from "@vueuse/core";

// --- UI Primitives ---
import { Button } from "../../tiptap-ui-primitive/button";

// ---  Icons ---
import MoonStarIcon from "../../tiptap-icons/MoonStarIcon.vue";
import SunIcon from "../../tiptap-icons/SunIcon.vue";

const mode = useColorMode();

const toggleDarkMode = () =>
  (mode.value = mode.value === "dark" ? "light" : "dark");
</script>

<template>
  <Button
    @click="toggleDarkMode"
    :aria-label="`Switch to ${mode === 'dark' ? 'light' : 'dark'} mode`"
    data-style="ghost"
  >
    <MoonStarIcon v-if="mode === 'dark'" class="tiptap-button-icon" />
    <SunIcon v-else class="tiptap-button-icon" />
  </Button>
</template>
