<script setup lang="ts">
import { ref, computed } from "vue";
import type { Editor } from "@tiptap/vue-3";

// --- Composables ---
import { useTiptapEditor } from "@/composables/useTiptapEditor";
import { useMenuNavigation } from "@/composables/useMenuNavigation";

// TODO: Create these icon components
// --- Icons ---
// import ChevronDownIcon from "@/components/tiptap-icons/ChevronDownIcon.vue";

// --- Tiptap UI ---
import type { ColorType, ColorItem } from "@/components/tiptap-ui/color-text-popover";
import { useColorTextPopover, useRecentColors, getColorByValue } from "@/components/tiptap-ui/color-text-popover";

// --- UI Primitives ---
import Button from "@/components/tiptap-ui-primitive/button/Button.vue";
import ButtonGroup from "@/components/tiptap-ui-primitive/button/ButtonGroup.vue";
import Popover from "@/components/tiptap-ui-primitive/popover/popover.vue";
import PopoverTrigger from "@/components/tiptap-ui-primitive/popover/PopoverTrigger.vue";
import PopoverContent from "@/components/tiptap-ui-primitive/popover/PopoverContent.vue";
import Card from "@/components/tiptap-ui-primitive/card/Card.vue";
import CardBody from "@/components/tiptap-ui-primitive/card/CardBody.vue";
import CardGroupLabel from "@/components/tiptap-ui-primitive/card/CardGroupLabel.vue";
import CardItemGroup from "@/components/tiptap-ui-primitive/card/CardItemGroup.vue";

// TODO: Import these when created
// --- Color Buttons ---
// import { TEXT_COLORS, ColorTextButton } from "@/components/tiptap-ui/color-text-button";
// import { HIGHLIGHT_COLORS, ColorHighlightButton } from "@/components/tiptap-ui/color-highlight-button";

// Temporary color definitions until the proper files are created
const TEXT_COLORS: ColorItem[] = [
  { value: "#000000", label: "Black" },
  { value: "#374151", label: "Gray" },
  { value: "#ef4444", label: "Red" },
  { value: "#f97316", label: "Orange" },
  { value: "#eab308", label: "Yellow" },
  { value: "#22c55e", label: "Green" },
  { value: "#3b82f6", label: "Blue" },
  { value: "#8b5cf6", label: "Purple" },
  { value: "#ec4899", label: "Pink" },
];

const HIGHLIGHT_COLORS: ColorItem[] = [
  { value: "#fef3c7", label: "Yellow" },
  { value: "#fed7aa", label: "Orange" },
  { value: "#fecaca", label: "Red" },
  { value: "#fce7f3", label: "Pink" },
  { value: "#e9d5ff", label: "Purple" },
  { value: "#dbeafe", label: "Blue" },
  { value: "#d1fae5", label: "Green" },
  { value: "#f3f4f6", label: "Gray" },
];

// Utility function to chunk array
function chunkArray<T>(array: T[], size: number): T[][] {
  const chunks: T[][] = [];
  for (let i = 0; i < array.length; i += size) {
    chunks.push(array.slice(i, i + size));
  }
  return chunks;
}

interface ColorTextPopoverProps {
  /**
   * The Tiptap editor instance.
   */
  editor?: Editor | null;
  /**
   * Whether the popover should hide when color text is not available.
   * @default false
   */
  hideWhenUnavailable?: boolean;
  /**
   * Callback function called after a color is applied.
   */
  onColorChanged?: ({
    type,
    label,
    value,
  }: {
    type: ColorType;
    label: string;
    value: string;
  }) => void;
  /**
   * Maximum colors per row
   * @default 5
   */
  maxColorsPerGroup?: number;
  /**
   * Maximum recent colors to show
   * @default 3
   */
  maxRecentColors?: number;
}

const props = withDefaults(defineProps<ColorTextPopoverProps>(), {
  hideWhenUnavailable: false,
  maxColorsPerGroup: 5,
  maxRecentColors: 3,
});

const { editor } = useTiptapEditor(props.editor);
const isOpen = ref(false);

const {
  isVisible,
  canToggle,
  activeTextStyle,
  activeHighlight,
  handleColorChanged: onColorChangedFromHook,
  label,
  Icon,
} = useColorTextPopover({
  editor: editor.value,
  hideWhenUnavailable: props.hideWhenUnavailable,
  onColorChanged: props.onColorChanged,
});

const { recentColors, addRecentColor, isInitialized } = useRecentColors(
  props.maxRecentColors
);

const containerRef = ref<HTMLElement | null>(null);

const textColorGroups = computed(() =>
  chunkArray(TEXT_COLORS, props.maxColorsPerGroup)
);

const highlightColorGroups = computed(() =>
  chunkArray(HIGHLIGHT_COLORS, props.maxColorsPerGroup)
);

const allTextColors = computed(() => textColorGroups.value.flat());

const allHighlightColors = computed(() => highlightColorGroups.value.flat());

const textColorStartIndex = computed(() =>
  isInitialized.value ? recentColors.value.length : 0
);

const highlightColorStartIndex = computed(
  () => textColorStartIndex.value + allTextColors.value.length
);

const menuItems = computed(() => {
  const items: any[] = [];

  if (isInitialized.value && recentColors.value.length > 0) {
    items.push(
      ...recentColors.value.map((color) => ({
        type: color.type,
        value: color.value,
        label: `Recent ${color.type === "text" ? "text" : "highlight"} color`,
        group: "recent",
      }))
    );
  }

  items.push(
    ...allTextColors.value.map((color) => ({
      type: "text" as ColorType,
      value: color.value,
      label: color.label,
      group: "text",
    }))
  );

  items.push(
    ...allHighlightColors.value.map((color) => ({
      type: "highlight" as ColorType,
      value: color.value,
      label: color.label,
      group: "highlight",
    }))
  );

  return items;
});

const handleColorSelected = ({
  type,
  label,
  value,
}: {
  type: ColorType;
  label: string;
  value: string;
}) => {
  if (!containerRef.value) return false;

  const highlightedElement = containerRef.value.querySelector(
    '[data-highlighted="true"]'
  ) as HTMLElement;

  if (highlightedElement) {
    highlightedElement.click();
  }

  addRecentColor({ type, label, value });
  onColorChangedFromHook({ type, label, value });
  isOpen.value = false;
};

const { selectedIndex } = useMenuNavigation({
  containerRef,
  items: menuItems,
  onSelect: (item: any) => {
    if (item) {
      handleColorSelected({
        type: item.type,
        label: item.label,
        value: item.value,
      });
    }
  },
  orientation: "both",
  autoSelectFirstItem: false,
});

const handleClick = () => {
  isOpen.value = !isOpen.value;
};

const getColorButtonStyle = (colorValue: string, type: ColorType) => {
  if (type === "text") {
    return { color: colorValue };
  } else {
    return { backgroundColor: colorValue };
  }
};
</script>

<template>
  <Popover
    v-if="isVisible"
    v-model:open="isOpen"
  >
    <PopoverTrigger as-child>
      <Button
        type="button"
        data-style="ghost"
        data-appearance="default"
        role="button"
        :aria-label="label"
        :tooltip="label"
        :disabled="!canToggle"
        :data-disabled="!canToggle"
        @click="handleClick"
      >
        <slot>
          <span
            class="tiptap-button-color-text-popover"
            :style="{
              '--active-highlight-color': activeHighlight.color || 'transparent',
            }"
          >
            <component
              :is="Icon"
              class="tiptap-button-icon"
              :style="{ color: activeTextStyle.color || undefined }"
            />
          </span>
          <span class="tiptap-button-dropdown-small">▼</span>
        </slot>
      </Button>
    </PopoverTrigger>

    <PopoverContent
      aria-label="Text color options"
      side="bottom"
      align="start"
    >
      <Card
        ref="containerRef"
        tabindex="0"
        role="menu"
      >
        <CardBody>
          <!-- Recent Colors Section -->
          <CardItemGroup v-if="isInitialized && recentColors.length > 0">
            <CardGroupLabel>Recently used</CardGroupLabel>
            <ButtonGroup orientation="horizontal">
              <Button
                v-for="(colorObj, index) in recentColors"
                :key="`recent-${colorObj.type}-${colorObj.value}`"
                type="button"
                data-style="ghost"
                class="color-button"
                :style="getColorButtonStyle(colorObj.value, colorObj.type)"
                :tabindex="selectedIndex === index ? 0 : -1"
                :data-highlighted="selectedIndex === index"
                :tooltip="getColorByValue(colorObj.value, colorObj.type === 'text' ? TEXT_COLORS : HIGHLIGHT_COLORS).label"
                @click="
                  handleColorSelected({
                    type: colorObj.type,
                    label: getColorByValue(colorObj.value, colorObj.type === 'text' ? TEXT_COLORS : HIGHLIGHT_COLORS).label,
                    value: colorObj.value,
                  })
                "
              >
                A
              </Button>
            </ButtonGroup>
          </CardItemGroup>

          <!-- Text Color Section -->
          <CardItemGroup>
            <CardGroupLabel>Text color</CardGroupLabel>
            <ButtonGroup
              v-for="(group, groupIndex) in textColorGroups"
              :key="`text-group-${groupIndex}`"
              orientation="horizontal"
            >
              <Button
                v-for="(color, colorIndex) in group"
                :key="`text-${color.value}-${colorIndex}`"
                type="button"
                data-style="ghost"
                class="color-button"
                :style="{ color: color.value }"
                :tooltip="color.label"
                :tabindex="
                  selectedIndex ===
                    textColorStartIndex +
                    textColorGroups.slice(0, groupIndex).reduce((acc, g) => acc + g.length, 0) +
                    colorIndex
                    ? 0
                    : -1
                "
                :data-highlighted="
                  selectedIndex ===
                    textColorStartIndex +
                    textColorGroups.slice(0, groupIndex).reduce((acc, g) => acc + g.length, 0) +
                    colorIndex
                "
                :aria-label="`${color.label} text color`"
                @click="
                  handleColorSelected({ type: 'text', label: color.label, value: color.value })
                "
              >
                A
              </Button>
            </ButtonGroup>
          </CardItemGroup>

          <!-- Highlight Color Section -->
          <CardItemGroup>
            <CardGroupLabel>Highlight color</CardGroupLabel>
            <ButtonGroup
              v-for="(group, groupIndex) in highlightColorGroups"
              :key="`highlight-group-${groupIndex}`"
              orientation="horizontal"
            >
              <Button
                v-for="(color, colorIndex) in group"
                :key="`highlight-${color.value}-${colorIndex}`"
                type="button"
                data-style="ghost"
                class="color-button"
                :style="{ backgroundColor: color.value }"
                :tooltip="color.label"
                :tabindex="
                  selectedIndex ===
                    highlightColorStartIndex +
                    highlightColorGroups.slice(0, groupIndex).reduce((acc, g) => acc + g.length, 0) +
                    colorIndex
                    ? 0
                    : -1
                "
                :data-highlighted="
                  selectedIndex ===
                    highlightColorStartIndex +
                    highlightColorGroups.slice(0, groupIndex).reduce((acc, g) => acc + g.length, 0) +
                    colorIndex
                "
                :aria-label="`${color.label} highlight color`"
                @click="
                  handleColorSelected({
                    type: 'highlight',
                    label: color.label,
                    value: color.value,
                  })
                "
              >
                A
              </Button>
            </ButtonGroup>
          </CardItemGroup>
        </CardBody>
      </Card>
    </PopoverContent>
  </Popover>
</template>

<style scoped>
.tiptap-button-icon {
  width: 1rem;
  height: 1rem;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

.tiptap-button-color-text-popover {
  position: relative;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

.tiptap-button-color-text-popover::after {
  content: "";
  position: absolute;
  bottom: -2px;
  left: 0;
  right: 0;
  height: 3px;
  background-color: var(--active-highlight-color, transparent);
  border-radius: 2px;
}

.tiptap-button-dropdown-small {
  margin-left: 0.25rem;
  font-size: 0.75rem;
  opacity: 0.7;
}

.color-button {
  min-width: 2rem;
  min-height: 2rem;
  font-weight: bold;
  border: 1px solid #e5e7eb;
}

.color-button[data-highlighted="true"] {
  outline: 2px solid #3b82f6;
  outline-offset: 2px;
}
</style>
