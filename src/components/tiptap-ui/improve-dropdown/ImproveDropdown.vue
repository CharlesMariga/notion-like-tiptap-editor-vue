<script setup lang="ts">
import { computed, markRaw, ref } from 'vue'
import type { Editor } from '@tiptap/vue-3'
import type { TextOptions, Language } from '@tiptap-pro/extension-ai'

// Composables
import { useTiptapEditor } from '@/composables/useTiptapEditor'
import { useImproveDropdownState, useAICommands } from '@/composables/useImproveDropdown'

// Icons
import MicAiIcon from '@/components/tiptap-icons/MicAiIcon.vue'
import AiSparklesIcon from '@/components/tiptap-icons/AiSparklesIcon.vue'
import CheckAiIcon from '@/components/tiptap-icons/CheckAiIcon.vue'
import TextExtendIcon from '@/components/tiptap-icons/TextExtendIcon.vue'
import TextReduceIcon from '@/components/tiptap-icons/TextReduceIcon.vue'
import Simplify2Icon from '@/components/tiptap-icons/Simplify2Icon.vue'
import SmileAiIcon from '@/components/tiptap-icons/SmileAiIcon.vue'
import CompleteSentenceIcon from '@/components/tiptap-icons/CompleteSentenceIcon.vue'
import SummarizeTextIcon from '@/components/tiptap-icons/SummarizeTextIcon.vue'
import LanguagesIcon from '@/components/tiptap-icons/LanguagesIcon.vue'
import ChevronRightIcon from '@/components/tiptap-icons/ChevronRightIcon.vue'

// UI Components
import { SUPPORTED_LANGUAGES, SUPPORTED_TONES } from '@/components/tiptap-ui/ai-menu/ai-menu-items/ai-menu-items-constants'
import AiAskButton from '@/components/tiptap-ui/ai-ask-button/AiAskButton.vue'

// UI Primitives
import { Button, ButtonGroup } from '@/components/tiptap-ui-primitive/button'
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSub,
  DropdownMenuSubTrigger,
  DropdownMenuSubContent,
} from '@/components/tiptap-ui-primitive/dropdown-menu'
import { Card, CardBody } from '@/components/tiptap-ui-primitive/card'
import Separator from '@/components/tiptap-ui-primitive/separator/Separator.vue'

interface ImproveDropdownProps {
  editor?: Editor | null
  hideWhenUnavailable?: boolean
  textOptions?: TextOptions
  portal?: boolean
}

const props = withDefaults(defineProps<ImproveDropdownProps>(), {
  hideWhenUnavailable: false,
  portal: false,
})

const { editor: localEditor } = useTiptapEditor(props.editor)
const hideWhenUnavailable = ref(props.hideWhenUnavailable)

const { executeAICommand, adjustTone, translate } = useAICommands(
  localEditor,
  props.textOptions
)

const { isDisabled, isOpen, handleOpenChange, show } = useImproveDropdownState(
  localEditor,
  hideWhenUnavailable
)

interface MenuAction {
  icon: any
  label: string
  command: string
  onClick: () => void
}

interface SubMenuAction {
  icon: any
  label: string
  items: Array<{
    label: string
    value: string
    icon?: any
    onClick: () => void
  }>
}

const menuActions = computed<MenuAction[]>(() => [
  {
    icon: markRaw(CheckAiIcon),
    label: 'Fix spelling & grammar',
    command: 'fixSpellingAndGrammar',
    onClick: () => executeAICommand('fixSpellingAndGrammar'),
  },
  {
    icon: markRaw(TextExtendIcon),
    label: 'Extend text',
    command: 'extend',
    onClick: () => executeAICommand('extend'),
  },
  {
    icon: markRaw(TextReduceIcon),
    label: 'Reduce text',
    command: 'shorten',
    onClick: () => executeAICommand('shorten'),
  },
  {
    icon: markRaw(Simplify2Icon),
    label: 'Simplify text',
    command: 'simplify',
    onClick: () => executeAICommand('simplify'),
  },
  {
    icon: markRaw(SmileAiIcon),
    label: 'Emojify',
    command: 'emojify',
    onClick: () => executeAICommand('emojify'),
  },
])

const secondaryActions = computed<MenuAction[]>(() => [
  {
    icon: markRaw(CompleteSentenceIcon),
    label: 'Complete sentence',
    command: 'complete',
    onClick: () => executeAICommand('complete'),
  },
  {
    icon: markRaw(SummarizeTextIcon),
    label: 'Summarize',
    command: 'summarize',
    onClick: () => executeAICommand('summarize'),
  },
])

const subMenuActions = computed<SubMenuAction[]>(() => [
  {
    icon: markRaw(MicAiIcon),
    label: 'Adjust tone',
    items: SUPPORTED_TONES.map((option) => ({
      label: option.label,
      value: option.value,
      onClick: () => adjustTone(option.value),
    })),
  },
])

const translateSubMenu = computed<SubMenuAction>(() => ({
  icon: markRaw(LanguagesIcon),
  label: 'Translate',
  items: SUPPORTED_LANGUAGES.map((option) => ({
    label: option.label,
    value: option.value,
    icon: markRaw(LanguagesIcon),
    onClick: () => translate(option.value as Language),
  })),
}))
</script>

<template>
  <DropdownMenu
    v-if="show && localEditor && localEditor.isEditable"
    :open="isOpen"
    @update:open="handleOpenChange"
  >
    <DropdownMenuTrigger as-child>
      <Button
        type="button"
        data-style="ghost"
        :disabled="isDisabled"
        :data-disabled="isDisabled"
        role="button"
        :tabindex="-1"
        aria-label="Improve"
        tooltip="Improve"
      >
        <AiSparklesIcon class="tiptap-button-icon" />
        <span class="tiptap-button-text">Improve</span>
      </Button>
    </DropdownMenuTrigger>

    <DropdownMenuContent align="start" :portal="portal">
      <Card>
        <CardBody>
          <ButtonGroup>
            <!-- Adjust Tone Submenu -->
            <DropdownMenuSub v-for="(action, index) in subMenuActions" :key="index">
              <DropdownMenuSubTrigger as-child>
                <Button data-style="ghost" type="button">
                  <component :is="action.icon" class="tiptap-button-icon" />
                  <span class="tiptap-button-text">{{ action.label }}</span>
                  <ChevronRightIcon class="tiptap-button-icon-sub" />
                </Button>
              </DropdownMenuSubTrigger>
              <DropdownMenuSubContent>
                <Card>
                  <CardBody>
                    <ButtonGroup>
                      <DropdownMenuItem
                        v-for="item in action.items"
                        :key="item.value"
                        as-child
                      >
                        <Button
                          type="button"
                          data-style="ghost"
                          @click="item.onClick"
                        >
                          <component
                            :is="item.icon"
                            v-if="item.icon"
                            class="tiptap-button-icon"
                          />
                          <span class="tiptap-button-text">{{ item.label }}</span>
                        </Button>
                      </DropdownMenuItem>
                    </ButtonGroup>
                  </CardBody>
                </Card>
              </DropdownMenuSubContent>
            </DropdownMenuSub>

            <!-- Main Actions -->
            <DropdownMenuItem
              v-for="(action, index) in menuActions"
              :key="index"
              as-child
            >
              <Button type="button" data-style="ghost" @click="action.onClick">
                <component :is="action.icon" class="tiptap-button-icon" />
                <span class="tiptap-button-text">{{ action.label }}</span>
              </Button>
            </DropdownMenuItem>
          </ButtonGroup>

          <Separator orientation="horizontal" />

          <ButtonGroup>
            <!-- Ask AI Button -->
            <DropdownMenuItem as-child>
              <AiAskButton text="Ask AI" :show-tooltip="false" />
            </DropdownMenuItem>

            <!-- Secondary Actions -->
            <DropdownMenuItem
              v-for="(action, index) in secondaryActions"
              :key="index"
              as-child
            >
              <Button type="button" data-style="ghost" @click="action.onClick">
                <component :is="action.icon" class="tiptap-button-icon" />
                <span class="tiptap-button-text">{{ action.label }}</span>
              </Button>
            </DropdownMenuItem>

            <!-- Translate Submenu -->
            <DropdownMenuSub>
              <DropdownMenuSubTrigger as-child>
                <Button data-style="ghost" type="button">
                  <component :is="translateSubMenu.icon" class="tiptap-button-icon" />
                  <span class="tiptap-button-text">{{ translateSubMenu.label }}</span>
                  <ChevronRightIcon class="tiptap-button-icon-sub" />
                </Button>
              </DropdownMenuSubTrigger>
              <DropdownMenuSubContent>
                <Card>
                  <CardBody>
                    <ButtonGroup>
                      <DropdownMenuItem
                        v-for="item in translateSubMenu.items"
                        :key="item.value"
                        as-child
                      >
                        <Button
                          type="button"
                          data-style="ghost"
                          @click="item.onClick"
                        >
                          <component
                            :is="item.icon"
                            v-if="item.icon"
                            class="tiptap-button-icon"
                          />
                          <span class="tiptap-button-text">{{ item.label }}</span>
                        </Button>
                      </DropdownMenuItem>
                    </ButtonGroup>
                  </CardBody>
                </Card>
              </DropdownMenuSubContent>
            </DropdownMenuSub>
          </ButtonGroup>
        </CardBody>
      </Card>
    </DropdownMenuContent>
  </DropdownMenu>
</template>
