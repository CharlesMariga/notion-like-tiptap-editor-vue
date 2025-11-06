<script setup lang="ts">
import { computed, ref, watch } from "vue"
import type { Editor } from "@tiptap/vue-3"
import type { TextOptions, Language } from "@tiptap-pro/extension-ai"

// Hooks
import { useTiptapEditor } from "@/composables/useTiptapEditor"
import { useAiMenuState } from "@/composables/useAiMenu"
import { useAiMenuNavigation } from "@/composables/useAiMenuNavigation"

// Utils
import { getContextAndInsertAt } from "@/components/tiptap-ui/ai-menu/ai-menu-utils"

// UI Primitives
import { Button, ButtonGroup } from "@/components/tiptap-ui-primitive/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/tiptap-ui-primitive/dropdown-menu"
import { Card, CardBody, CardItemGroup, CardGroupLabel } from "@/components/tiptap-ui-primitive/card"
import Separator from "@/components/tiptap-ui-primitive/separator/Separator.vue"

import { SUPPORTED_LANGUAGES, SUPPORTED_TONES } from "./ai-menu-items-constants"

// Icons
import ChevronRightIcon from "@/components/tiptap-icons/ChevronRightIcon.vue"
import SummarizeTextIcon from "@/components/tiptap-icons/SummarizeTextIcon.vue"
import Simplify2Icon from "@/components/tiptap-icons/Simplify2Icon.vue"
import LanguagesIcon from "@/components/tiptap-icons/LanguagesIcon.vue"
import MicAiIcon from "@/components/tiptap-icons/MicAiIcon.vue"
import TextExtendIcon from "@/components/tiptap-icons/TextExtendIcon.vue"
import TextReduceIcon from "@/components/tiptap-icons/TextReduceIcon.vue"
import CompleteSentenceIcon from "@/components/tiptap-icons/CompleteSentenceIcon.vue"
import SmileAiIcon from "@/components/tiptap-icons/SmileAiIcon.vue"
import CheckAiIcon from "@/components/tiptap-icons/CheckAiIcon.vue"

const props = defineProps<{
  editor?: Editor | null
}>()

const { editor: localEditor } = useTiptapEditor(props.editor)
const { state, updateState } = useAiMenuState()

// State for controlling dropdowns programmatically
const adjustToneOpen = ref(false)
const languagesOpen = ref(false)

// List all actionable items for keyboard navigation (excluding submenus)
const actionItems = [
  'adjustTone',
  'aiFixSpellingAndGrammar',
  'aiExtend',
  'aiShorten',
  'simplifyLanguage',
  'improveWriting',
  'emojify',
  'continueWriting',
  'summarize',
  'translateTo',
]

const itemCount = computed(() => actionItems.length)

const handleSelectItem = (index: number) => {
  const action = actionItems[index]
  if (!action) return

  // Handle dropdown menus - open them programmatically
  if (action === 'adjustTone') {
    adjustToneOpen.value = true
    return
  }

  if (action === 'translateTo') {
    languagesOpen.value = true
    return
  }

  handleAction(action)
}

// Setup keyboard navigation
const { activeIndex, resetActiveIndex } = useAiMenuNavigation({
  isOpen: computed(() => true), // Menu is visible
  onSelect: handleSelectItem,
  itemCount,
})

// Reset active index when menu unmounts
watch(() => props.editor, () => {
  resetActiveIndex()
})

// Helper to execute AI commands
function executeAiCommand(
  editor: Editor | null,
  command: string,
  options?: TextOptions
) {
  if (!editor) return

  const { insertAt, isSelection, context } = getContextAndInsertAt(editor)
  const newOptions: TextOptions = {
    ...options,
    insertAt,
    regenerate: !isSelection,
  }

  if (isSelection) {
    newOptions.text = context
  }

  const chain = editor.chain()

  switch (command) {
    case "aiFixSpellingAndGrammar":
      chain.aiFixSpellingAndGrammar(newOptions).run()
      break
    case "aiExtend":
      chain.aiExtend(newOptions).run()
      break
    case "aiShorten":
      chain.aiShorten(newOptions).run()
      break
    case "simplifyLanguage":
      chain.aiSimplify(newOptions).run()
      break
    case "improveWriting":
      chain.aiRephrase(newOptions).run()
      break
    case "emojify":
      chain.aiEmojify(newOptions).run()
      break
    case "continueWriting":
      chain.aiComplete(newOptions).run()
      break
    case "summarize":
      chain.aiSummarize(newOptions).run()
      break
  }
}

// Tone selection handler
function handleToneSelection(selectedTone: string) {
  if (!localEditor.value) return

  const { insertAt, isSelection, context } = getContextAndInsertAt(localEditor.value)

  if (!state.value.tone || state.value.tone !== selectedTone) {
    updateState({ tone: selectedTone })
  }

  const toneOptions: TextOptions = {
    stream: true,
    format: "rich-text",
    insertAt,
    regenerate: !isSelection,
  }

  if (state.value.language) {
    toneOptions.language = state.value.language
  }

  if (isSelection) {
    toneOptions.text = context
  }

  localEditor.value.chain().aiAdjustTone(selectedTone, toneOptions).run()
}

// Language selection handler
function handleLanguageSelection(selectedLanguageCode: Language) {
  if (!localEditor.value) return

  const { insertAt, isSelection, context } = getContextAndInsertAt(localEditor.value)

  updateState({ language: selectedLanguageCode })

  const langOptions: TextOptions = {
    stream: true,
    format: "rich-text",
    insertAt,
    regenerate: !isSelection,
  }

  if (state.value.tone) {
    langOptions.tone = state.value.tone
  }

  if (isSelection) {
    langOptions.text = context
  }

  localEditor.value.chain().aiTranslate(selectedLanguageCode, langOptions).run()
}

// Action handler with options
function handleAction(actionType: string) {
  const options: TextOptions = {
    stream: true,
    format: "rich-text",
    language: state.value.language,
  }

  if (state.value.tone) {
    options.tone = state.value.tone
  }

  executeAiCommand(localEditor.value, actionType, options)
}
</script>

<template>
  <div v-if="localEditor" class="tiptap-ai-menu-items">
    <!-- Edit Actions Group -->
    <CardItemGroup>
      <CardGroupLabel>Edit</CardGroupLabel>
      <ButtonGroup>
        <!-- Adjust Tone -->
      <DropdownMenu v-model:open="adjustToneOpen">
        <DropdownMenuTrigger as-child>
          <Button
            data-style="ghost"
            :data-active-state="activeIndex === 0 ? 'on' : 'off'"
          >
            <MicAiIcon class="tiptap-button-icon" />
            <span class="tiptap-button-text">Adjust Tone</span>
            <ChevronRightIcon class="tiptap-button-icon-right" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent side="right">
          <Card>
            <CardBody>
              <ButtonGroup>
                <DropdownMenuItem
                  v-for="tone in SUPPORTED_TONES"
                  :key="tone.value"
                  as-child
                >
                  <Button
                    data-style="ghost"
                    @click="handleToneSelection(tone.value)"
                  >
                    <span class="tiptap-button-text">{{ tone.label }}</span>
                  </Button>
                </DropdownMenuItem>
              </ButtonGroup>
            </CardBody>
          </Card>
        </DropdownMenuContent>
      </DropdownMenu>

      <!-- Fix Spelling & Grammar -->
      <Button
        data-style="ghost"
        :data-active-state="activeIndex === 1 ? 'on' : 'off'"
        @click="handleAction('aiFixSpellingAndGrammar')"
      >
        <CheckAiIcon class="tiptap-button-icon" />
        <span class="tiptap-button-text">Fix spelling & grammar</span>
      </Button>

      <!-- Make Longer -->
      <Button
        data-style="ghost"
        :data-active-state="activeIndex === 2 ? 'on' : 'off'"
        @click="handleAction('aiExtend')"
      >
        <TextExtendIcon class="tiptap-button-icon" />
        <span class="tiptap-button-text">Make longer</span>
      </Button>

      <!-- Make Shorter -->
      <Button
        data-style="ghost"
        :data-active-state="activeIndex === 3 ? 'on' : 'off'"
        @click="handleAction('aiShorten')"
      >
        <TextReduceIcon class="tiptap-button-icon" />
        <span class="tiptap-button-text">Make shorter</span>
      </Button>

      <!-- Simplify Language -->
      <Button
        data-style="ghost"
        :data-active-state="activeIndex === 4 ? 'on' : 'off'"
        @click="handleAction('simplifyLanguage')"
      >
        <Simplify2Icon class="tiptap-button-icon" />
        <span class="tiptap-button-text">Simplify language</span>
      </Button>

      <!-- Improve Writing -->
      <Button
        data-style="ghost"
        :data-active-state="activeIndex === 5 ? 'on' : 'off'"
        @click="handleAction('improveWriting')"
      >
        <SmileAiIcon class="tiptap-button-icon" />
        <span class="tiptap-button-text">Improve writing</span>
      </Button>

      <!-- Emojify -->
      <Button
        data-style="ghost"
        :data-active-state="activeIndex === 6 ? 'on' : 'off'"
        @click="handleAction('emojify')"
      >
        <SmileAiIcon class="tiptap-button-icon" />
        <span class="tiptap-button-text">Emojify</span>
      </Button>
      </ButtonGroup>
    </CardItemGroup>

    <Separator orientation="horizontal" />

    <!-- Write Actions Group -->
    <CardItemGroup>
      <CardGroupLabel>Write</CardGroupLabel>
      <ButtonGroup>

      <!-- Continue Writing -->
      <Button
        data-style="ghost"
        :data-active-state="activeIndex === 7 ? 'on' : 'off'"
        @click="handleAction('continueWriting')"
      >
        <CompleteSentenceIcon class="tiptap-button-icon" />
        <span class="tiptap-button-text">Continue writing</span>
      </Button>

      <!-- Add a Summary -->
      <Button
        data-style="ghost"
        :data-active-state="activeIndex === 8 ? 'on' : 'off'"
        @click="handleAction('summarize')"
      >
        <SummarizeTextIcon class="tiptap-button-icon" />
        <span class="tiptap-button-text">Add a summary</span>
      </Button>

      <!-- Translate To -->
      <DropdownMenu v-model:open="languagesOpen">
        <DropdownMenuTrigger as-child>
          <Button
            data-style="ghost"
            :data-active-state="activeIndex === 9 ? 'on' : 'off'"
          >
            <LanguagesIcon class="tiptap-button-icon" />
            <span class="tiptap-button-text">Languages</span>
            <ChevronRightIcon class="tiptap-button-icon-right" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent side="right">
          <Card>
            <CardBody>
              <ButtonGroup>
                <DropdownMenuItem
                  v-for="language in SUPPORTED_LANGUAGES"
                  :key="language.value"
                  as-child
                >
                  <Button
                    data-style="ghost"
                    @click="handleLanguageSelection(language.value)"
                  >
                    <LanguagesIcon class="tiptap-button-icon" />
                    <span class="tiptap-button-text">{{ language.label }}</span>
                  </Button>
                </DropdownMenuItem>
              </ButtonGroup>
            </CardBody>
          </Card>
        </DropdownMenuContent>
      </DropdownMenu>
      </ButtonGroup>
    </CardItemGroup>
  </div>
</template>
