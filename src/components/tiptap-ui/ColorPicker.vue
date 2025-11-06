<template>
  <Popover v-if="isVisible" :open="isOpen" @update:open="handleOpenChange">
    <PopoverTrigger>
      <Button
        type="button"
        :disabled="!canToggle"
        data-style="ghost"
        :data-active-state="isActive ? 'on' : 'off'"
        :data-disabled="!canToggle"
        role="button"
        :tabindex="-1"
        aria-label="Text color"
        tooltip="Text color"
        @click="handleClick"
        v-bind="$attrs"
      >
        <slot>
          <TextColorSmallIcon
            class="tiptap-button-icon"
            :style="{ color: activeColor }"
          />
        </slot>
      </Button>
    </PopoverTrigger>

    <PopoverContent>
      <div class="color-picker-content">
        <div v-if="recentColors.length > 0" class="color-section">
          <div class="color-section-title">Recent</div>
          <div class="color-grid">
            <button
              v-for="(color, index) in recentColors"
              :key="`recent-${index}`"
              class="color-button"
              :style="{
                backgroundColor: color.value,
                borderColor: getColorBorder(color.value)
              }"
              :title="color.label"
              @click="handleColorSelect(color.type, color.label, color.value)"
            />
          </div>
        </div>

        <div class="color-section">
          <div class="color-section-title">Text Color</div>
          <div class="color-grid">
            <button
              v-for="color in TEXT_COLORS"
              :key="color.value"
              class="color-button"
              :style="{
                backgroundColor: color.value,
                borderColor: color.border || 'transparent'
              }"
              :title="color.label"
              @click="handleColorSelect('text', color.label, color.value)"
            />
          </div>
        </div>

        <div class="color-section">
          <div class="color-section-title">Highlight Color</div>
          <div class="color-grid">
            <button
              v-for="color in HIGHLIGHT_COLORS"
              :key="color.value"
              class="color-button"
              :style="{ backgroundColor: color.value }"
              :title="color.label"
              @click="handleColorSelect('highlight', color.label, color.value)"
            />
          </div>
          <Button
            type="button"
            class="remove-highlight-btn"
            data-style="ghost"
            @click="handleRemoveHighlight"
          >
            Remove highlight
          </Button>
        </div>
      </div>
    </PopoverContent>
  </Popover>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import type { Editor } from '@tiptap/vue-3'
import { useTiptapEditor } from '@/composables/useTiptapEditor'
import {
  useColorTextPopover,
  useRecentColors,
  setTextColor,
  setHighlightColor,
  removeHighlight,
  TEXT_COLORS,
  HIGHLIGHT_COLORS,
  type ColorType,
} from '@/composables/useColorText'
import Popover from '@/components/tiptap-ui-primitive/popover/Popover.vue'
import PopoverTrigger from '@/components/tiptap-ui-primitive/popover/PopoverTrigger.vue'
import PopoverContent from '@/components/tiptap-ui-primitive/popover/PopoverContent.vue'
import Button from '@/components/tiptap-ui-primitive/button/Button.vue'
import TextColorSmallIcon from '@/components/tiptap-icons/TextColorSmallIcon.vue'

interface ColorPickerProps {
  editor?: Editor | null
  hideWhenUnavailable?: boolean
}

const props = withDefaults(defineProps<ColorPickerProps>(), {
  hideWhenUnavailable: false,
})

const emit = defineEmits<{
  colorChanged: [{ type: ColorType; label: string; value: string }]
}>()

const { editor } = useTiptapEditor(props.editor)
const isOpen = ref(false)

const { recentColors, addRecentColor } = useRecentColors(3)

const {
  isVisible,
  canToggle,
  activeTextStyle,
  activeHighlight,
} = useColorTextPopover({
  editor: editor.value,
  hideWhenUnavailable: props.hideWhenUnavailable,
})

const activeColor = computed(() => {
  return activeTextStyle.value?.color || 'currentColor'
})

const isActive = computed(() => {
  return !!(activeTextStyle.value?.color || activeHighlight.value?.color)
})

const getColorBorder = (value: string) => {
  const color = TEXT_COLORS.find(c => c.value === value)
  return color?.border || 'var(--tt-border-color)'
}

const handleOpenChange = (nextIsOpen: boolean) => {
  isOpen.value = nextIsOpen
}

const handleClick = (event: MouseEvent) => {
  if (event.defaultPrevented) return
  isOpen.value = !isOpen.value
}

const handleColorSelect = (type: ColorType, label: string, value: string) => {
  if (!editor.value) return

  if (type === 'text') {
    setTextColor(editor.value, value)
  } else {
    setHighlightColor(editor.value, value)
  }

  addRecentColor({ type, label, value })
  emit('colorChanged', { type, label, value })
  isOpen.value = false
}

const handleRemoveHighlight = () => {
  if (!editor.value) return
  removeHighlight(editor.value)
  isOpen.value = false
}
</script>

<style scoped>
.color-picker-content {
  padding: 0.75rem;
  background: var(--tt-popover-bg-color);
  border: 1px solid var(--tt-popover-border-color);
  border-radius: var(--tt-radius-md);
  min-width: 220px;
  max-width: 280px;
}

.color-section {
  margin-bottom: 0.75rem;
}

.color-section:last-child {
  margin-bottom: 0;
}

.color-section-title {
  font-size: 0.75rem;
  font-weight: 600;
  color: var(--tt-text-color-secondary);
  margin-bottom: 0.5rem;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.color-grid {
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 0.375rem;
}

.color-button {
  width: 2rem;
  height: 2rem;
  border: 2px solid;
  border-radius: var(--tt-radius-sm);
  cursor: pointer;
  transition: all 0.15s ease;
  padding: 0;
}

.color-button:hover {
  transform: scale(1.1);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
}

.color-button:active {
  transform: scale(0.95);
}

.remove-highlight-btn {
  margin-top: 0.5rem;
  width: 100%;
  justify-content: center;
  font-size: 0.875rem;
}
</style>
