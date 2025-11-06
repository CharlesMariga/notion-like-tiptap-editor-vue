<script setup lang="ts">
import { provideUserContext } from '@/contexts/user-context'
import { provideAppContext } from '@/contexts/app-context'
import { provideCollabContext } from '@/contexts/collab-context'
import { provideAiContext } from '@/contexts/ai-context'
import { NotionEditor } from '@/components/tiptap-templates/notion-like'
import defaultContent from '@/components/tiptap-templates/notion-like/data/content.json'

// Use a static room name so content persists across reloads
const room = 'notion-demo'

// Provide all contexts
provideUserContext()
provideAppContext()
provideCollabContext({
  room,
  initialContent: defaultContent,
})
provideAiContext()
</script>

<template>
  <NotionEditor
    :room="room"
    placeholder="Start typing or press '/' for commands..."
  />
</template>
