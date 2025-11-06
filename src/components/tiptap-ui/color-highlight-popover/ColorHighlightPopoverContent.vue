<template>
  <Card
    ref="containerRef"
    :tabindex="0"
    :style="isMobile ? { boxShadow: 'none', border: 0 } : {}"
  >
    <CardBody :style="isMobile ? { padding: 0 } : {}">
      <CardItemGroup orientation="horizontal">
        <ButtonGroup orientation="horizontal">
          <ColorHighlightButton
            v-for="(color, index) in colors"
            :key="color.value"
            :editor="editor"
            :highlight-color="color.value"
            :tooltip="color.label"
            :aria-label="`${color.label} highlight color`"
            :tabindex="index === selectedIndex ? 0 : -1"
            :data-highlighted="selectedIndex === index"
          />
        </ButtonGroup>
        <Separator />
        <ButtonGroup orientation="horizontal">
          <Button
            @click="handleRemoveHighlight"
            aria-label="Remove highlight"
            tooltip="Remove highlight"
            :tabindex="selectedIndex === colors.length ? 0 : -1"
            type="button"
            role="menuitem"
            data-style="ghost"
            :data-highlighted="selectedIndex === colors.length"
          >
            <BanIcon class="tiptap-button-icon" />
          </Button>
        </ButtonGroup>
      </CardItemGroup>
    </CardBody>
  </Card>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import type { Editor } from '@tiptap/vue-3'

// --- Composables ---
import { useColorHighlight, type HighlightColor } from '@/composables/useColorHighlight'
import { useMenuNavigation } from '@/composables/useMenuNavigation'
import { useIsMobile } from '@/composables/useMobile'

// --- Icons ---
import BanIcon from '@/components/tiptap-icons/BanIcon.vue'

// --- UI Primitives ---
import Button from '@/components/tiptap-ui-primitive/button/Button.vue'
import { ButtonGroup } from '@/components/tiptap-ui-primitive/button'
import Separator from '@/components/tiptap-ui-primitive/separator/Separator.vue'
import {
  Card,
  CardBody,
  CardItemGroup,
} from '@/components/tiptap-ui-primitive/card'

// --- UI Components ---
import ColorHighlightButton from '@/components/tiptap-ui/color-highlight-button/ColorHighlightButton.vue'

export interface ColorHighlightPopoverContentProps {
  /**
   * The Tiptap editor instance.
   */
  editor?: Editor | null
  /**
   * Optional colors to use in the highlight popover.
   * If not provided, defaults to a predefined set of colors.
   */
  colors?: HighlightColor[]
}

const props = withDefaults(defineProps<ColorHighlightPopoverContentProps>(), {
  colors: () => [],
})

const { handleRemoveHighlight } = useColorHighlight({ editor: props.editor })
const isMobile = useIsMobile()
const containerRef = ref<HTMLDivElement | null>(null)

const menuItems = computed(() => [
  ...props.colors,
  { label: 'Remove highlight', value: 'none' },
])

const { selectedIndex } = useMenuNavigation({
  containerRef,
  items: menuItems.value,
  orientation: 'both',
  onSelect: (item) => {
    if (!containerRef.value) return false
    const highlightedElement = containerRef.value.querySelector(
      '[data-highlighted="true"]'
    ) as HTMLElement
    if (highlightedElement) highlightedElement.click()
    if (item.value === 'none') handleRemoveHighlight()
  },
  autoSelectFirstItem: false,
})
</script>
