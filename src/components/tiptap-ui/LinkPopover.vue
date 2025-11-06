<template>
  <Popover v-if="isVisible" :open="isOpen" @update:open="handleOnOpenChange">
    <PopoverTrigger as-child>
      <Button
        type="button"
        :disabled="!canSet"
        data-style="ghost"
        :data-active-state="isActive ? 'on' : 'off'"
        :data-disabled="!canSet"
        role="button"
        :tabindex="-1"
        :aria-label="label"
        :aria-pressed="isActive"
        tooltip="Link"
        v-bind="$attrs"
      >
        <slot>
          <LinkIcon class="tiptap-button-icon" />
        </slot>
      </Button>
    </PopoverTrigger>

    <PopoverContent>
      <Card>
        <CardBody>
          <CardItemGroup orientation="horizontal">
            <InputGroup>
              <Input
                type="url"
                placeholder="Paste a link..."
                :value="url"
                @input="handleUrlInput"
                @keydown="handleKeyDown"
                ref="inputRef"
                autocomplete="off"
                autocorrect="off"
                autocapitalize="off"
              />
            </InputGroup>

            <ButtonGroup orientation="horizontal">
              <Button
                type="button"
                @click="handleSetLink"
                title="Apply link"
                :disabled="!url && !isActive"
                data-style="ghost"
              >
                <CornerDownLeftIcon class="tiptap-button-icon" />
              </Button>
            </ButtonGroup>

            <Separator orientation="vertical" decorative />

            <ButtonGroup orientation="horizontal">
              <Button
                type="button"
                @click="openLink"
                title="Open in new window"
                :disabled="!url && !isActive"
                data-style="ghost"
              >
                <ExternalLinkIcon class="tiptap-button-icon" />
              </Button>

              <Button
                type="button"
                @click="removeLink"
                title="Remove link"
                :disabled="!url && !isActive"
                data-style="ghost"
              >
                <TrashIcon class="tiptap-button-icon" />
              </Button>
            </ButtonGroup>
          </CardItemGroup>
        </CardBody>
      </Card>
    </PopoverContent>
  </Popover>
</template>

<script setup lang="ts">
import { ref, watch, nextTick } from 'vue'
import type { Editor } from '@tiptap/vue-3'
import { useTiptapEditor } from '@/composables/useTiptapEditor'
import { useLinkPopover } from '@/composables/useLinkPopover'
import Popover from '@/components/tiptap-ui-primitive/popover/Popover.vue'
import PopoverTrigger from '@/components/tiptap-ui-primitive/popover/PopoverTrigger.vue'
import PopoverContent from '@/components/tiptap-ui-primitive/popover/PopoverContent.vue'
import Button from '@/components/tiptap-ui-primitive/button/Button.vue'
import ButtonGroup from '@/components/tiptap-ui-primitive/button/ButtonGroup.vue'
import Card from '@/components/tiptap-ui-primitive/card/Card.vue'
import CardBody from '@/components/tiptap-ui-primitive/card/CardBody.vue'
import CardItemGroup from '@/components/tiptap-ui-primitive/card/CardItemGroup.vue'
import Input from '@/components/tiptap-ui-primitive/input/Input.vue'
import InputGroup from '@/components/tiptap-ui-primitive/input/InputGroup.vue'
import Separator from '@/components/tiptap-ui-primitive/separator/Separator.vue'
import LinkIcon from '@/components/tiptap-icons/LinkIcon.vue'
import CornerDownLeftIcon from '@/components/tiptap-icons/CornerDownLeftIcon.vue'
import ExternalLinkIcon from '@/components/tiptap-icons/ExternalLinkIcon.vue'
import TrashIcon from '@/components/tiptap-icons/TrashIcon.vue'

interface LinkPopoverProps {
  editor?: Editor | null
  hideWhenUnavailable?: boolean
  autoOpenOnLinkActive?: boolean
}

const props = withDefaults(defineProps<LinkPopoverProps>(), {
  hideWhenUnavailable: false,
  autoOpenOnLinkActive: true,
})

const emit = defineEmits<{
  setLink: []
  openChange: [isOpen: boolean]
}>()

const { editor } = useTiptapEditor(props.editor)

const isOpen = ref(false)
const inputRef = ref<HTMLInputElement>()

const {
  isVisible,
  canSet,
  isActive,
  url,
  setUrl,
  setLink,
  removeLink,
  openLink,
  label,
} = useLinkPopover({
  editor: editor.value,
  hideWhenUnavailable: props.hideWhenUnavailable,
  onSetLink: () => emit('setLink'),
})

const handleOnOpenChange = (nextIsOpen: boolean) => {
  isOpen.value = nextIsOpen
  emit('openChange', nextIsOpen)

  if (nextIsOpen) {
    nextTick(() => {
      // inputRef.value might be a component instance, get the actual input element
      const input = inputRef.value
      if (input) {
        if (typeof input.focus === 'function') {
          input.focus()
        } else if ((input as any).$el && typeof (input as any).$el.focus === 'function') {
          (input as any).$el.focus()
        }
      }
    })
  }
}

const handleSetLink = () => {
  setLink()
  isOpen.value = false
}

const handleUrlInput = (event: Event) => {
  const target = event.target as HTMLInputElement
  setUrl(target.value)
}

const handleKeyDown = (event: KeyboardEvent) => {
  if (event.key === 'Enter') {
    event.preventDefault()
    handleSetLink()
  }
}

watch(
  () => props.autoOpenOnLinkActive && isActive.value,
  (shouldOpen) => {
    if (shouldOpen) {
      isOpen.value = true
    }
  }
)
</script>

<style scoped>
.link-popover-content {
  padding: 0.5rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  background: var(--tt-popover-bg-color);
  border: 1px solid var(--tt-popover-border-color);
  border-radius: var(--tt-radius-md);
  min-width: 320px;
}

.link-input-group {
  flex: 1;
}

.link-input {
  width: 100%;
  padding: 0.5rem;
  border: 1px solid var(--tt-border-color);
  border-radius: var(--tt-radius-sm);
  background: transparent;
  color: var(--tt-text-color);
  font-size: 0.875rem;
  outline: none;
}

.link-input:focus {
  border-color: var(--tt-brand-color-600);
}

.link-button-group {
  display: flex;
  align-items: center;
  gap: 0.25rem;
}

.link-separator {
  width: 1px;
  height: 1.5rem;
  background: var(--tt-border-color);
  margin: 0 0.25rem;
}
</style>
