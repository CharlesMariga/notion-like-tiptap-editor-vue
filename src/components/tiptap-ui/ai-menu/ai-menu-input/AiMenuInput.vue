<script setup lang="ts">
import { ref, computed, watch } from "vue"
import type { Tone } from "@tiptap-pro/extension-ai"
import { isHotkey } from "is-hotkey"

// Icons
import MicAiIcon from "@/components/tiptap-icons/MicAiIcon.vue"
import ArrowUpIcon from "@/components/tiptap-icons/ArrowUpIcon.vue"
import AiSparklesIcon from "@/components/tiptap-icons/AiSparklesIcon.vue"

// UI Components
import { SUPPORTED_TONES } from "@/components/tiptap-ui/ai-menu/ai-menu-items/ai-menu-items-constants"

// UI Primitives
import { Button, ButtonGroup } from "@/components/tiptap-ui-primitive/button"
import Spacer from "@/components/tiptap-ui-primitive/spacer/Spacer.vue"
import { Toolbar, ToolbarGroup } from "@/components/tiptap-ui-primitive/toolbar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/tiptap-ui-primitive/dropdown-menu"
import { Card, CardBody } from "@/components/tiptap-ui-primitive/card"

import type { AiMenuInputTextareaProps } from "./ai-menu-input-types"

// Styles
import "@/components/tiptap-ui/ai-menu/ai-menu-input/ai-menu-input.scss"

withDefaults(defineProps<AiMenuInputTextareaProps>(), {
  showPlaceholder: false,
  placeholder: "Ask AI what you want...",
})

const emit = defineEmits<{
  inputSubmit: [value: string]
  toneChange: [tone: string]
  close: []
  inputFocus: []
  inputBlur: []
  emptyBlur: []
  placeholderClick: []
}>()

const promptValue = ref("")
const tone = ref<Tone | null>(null)
const isFocused = ref(false)
const textareaRef = ref<HTMLTextAreaElement | null>(null)

const isEmpty = computed(() => !promptValue.value?.trim())

const handleSubmit = () => {
  const cleanedPrompt = promptValue.value?.trim()
  if (cleanedPrompt) {
    emit("inputSubmit", cleanedPrompt)
    promptValue.value = ""
  }
}

const handleKeyDown = (event: KeyboardEvent) => {
  if (isHotkey("backspace", event) && !promptValue.value?.length) {
    event.preventDefault()
    emit("close")
  } else if (isHotkey("enter", event) && !(event as any).shiftKey) {
    event.preventDefault()
    handleSubmit()
  } else if (isHotkey("escape", event)) {
    event.preventDefault()
    emit("close")
  }
}

const handleBlur = (e: FocusEvent) => {
  const hasFocus = (e.currentTarget as HTMLElement).contains(
    e.relatedTarget as Node
  )
  if (hasFocus) return

  if (isEmpty.value) {
    emit("emptyBlur")
  } else {
    emit("inputBlur")
  }
}

const handleToneChange = (newTone: string) => {
  tone.value = newTone
  emit("toneChange", newTone)
}

const handleFocus = () => {
  isFocused.value = true
  emit("inputFocus")
}

const handleTextareaBlur = (e: FocusEvent) => {
  isFocused.value = false
  handleBlur(e)
}

const handleOnPlaceholderClick = () => {
  emit("placeholderClick")
}

// Auto-resize textarea
watch(promptValue, () => {
  if (textareaRef.value) {
    textareaRef.value.style.height = "auto"
    textareaRef.value.style.height = textareaRef.value.scrollHeight + "px"
  }
})
</script>

<template>
  <div
    class="tiptap-ai-prompt-input"
    :data-focused="isFocused"
    :data-active-state="showPlaceholder ? 'off' : 'on'"
  >
    <!-- Placeholder -->
    <div
      v-if="showPlaceholder"
      class="tiptap-ai-prompt-input-placeholder"
      @click="handleOnPlaceholderClick"
    >
      <div class="tiptap-ai-prompt-input-placeholder-content">
        <AiSparklesIcon class="tiptap-ai-prompt-input-placeholder-icon" />
        <span class="tiptap-ai-prompt-input-placeholder-text">
          Tell AI what else needs to be changed...
        </span>
      </div>
      <Button data-style="primary" :disabled="true">
        <ArrowUpIcon class="tiptap-button-icon" />
      </Button>
    </div>

    <!-- Input -->
    <template v-else>
      <textarea
        ref="textareaRef"
        v-model="promptValue"
        class="tiptap-ai-prompt-input-content"
        :placeholder="placeholder"
        :style="{ display: showPlaceholder ? 'none' : 'flex' }"
        autofocus
        rows="1"
        @keydown="handleKeyDown"
        @focus="handleFocus"
        @blur="handleTextareaBlur"
      />

      <!-- Toolbar -->
      <Toolbar
        variant="floating"
        data-plain="true"
        class="tiptap-ai-prompt-input-toolbar"
        :style="{ display: showPlaceholder ? 'none' : 'flex' }"
      >
        <ToolbarGroup>
          <!-- Tone Selector -->
          <DropdownMenu>
            <DropdownMenuTrigger as-child>
              <Button
                type="button"
                data-style="ghost"
                :data-active-state="tone ? 'on' : 'off'"
                role="button"
                :tabindex="-1"
                aria-label="Tone adjustment options"
              >
                <MicAiIcon class="tiptap-button-icon" />
                <span class="tiptap-button-text">Tone</span>
              </Button>
            </DropdownMenuTrigger>

            <DropdownMenuContent align="start">
              <Card>
                <CardBody>
                  <ButtonGroup>
                    <DropdownMenuItem
                      v-for="supportedTone in SUPPORTED_TONES"
                      :key="supportedTone.value"
                      as-child
                    >
                      <Button
                        data-style="ghost"
                        :data-active-state="
                          tone === supportedTone.value ? 'on' : 'off'
                        "
                        @click="handleToneChange(supportedTone.value)"
                      >
                        <span class="tiptap-button-text">
                          {{ supportedTone.label }}
                        </span>
                      </Button>
                    </DropdownMenuItem>
                  </ButtonGroup>
                </CardBody>
              </Card>
            </DropdownMenuContent>
          </DropdownMenu>
        </ToolbarGroup>

        <Spacer />

        <ToolbarGroup>
          <Button
            :disabled="isEmpty"
            data-style="primary"
            aria-label="Submit prompt"
            @click="handleSubmit"
          >
            <ArrowUpIcon class="tiptap-button-icon" />
          </Button>
        </ToolbarGroup>
      </Toolbar>
    </template>
  </div>
</template>
