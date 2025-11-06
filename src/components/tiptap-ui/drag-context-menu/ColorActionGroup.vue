<template>
  <SubMenuTrigger :icon="PaintBucketIcon" label="Color">
    <ButtonGroup>
      <!-- Recent Colors -->
      <template v-if="isInitialized && recentColors.length > 0">
        <Label>Recent colors</Label>
        <RecentColorMenuItem
          v-for="colorObj in recentColors"
          :key="colorObj.value"
          :color-obj="colorObj"
        />
        <Separator orientation="horizontal" />
      </template>

      <!-- Text Colors -->
      <Label>Text color</Label>
      <TextColorMenuItem
        v-for="textColor in TEXT_COLORS"
        :key="textColor.value"
        :color="textColor"
      />

      <Separator orientation="horizontal" />

      <!-- Highlight Colors -->
      <Label>Highlight color</Label>
      <HighlightColorMenuItem
        v-for="highlightColor in HIGHLIGHT_COLORS"
        :key="highlightColor.value"
        :color="highlightColor"
      />
    </ButtonGroup>
  </SubMenuTrigger>
</template>

<script setup lang="ts">
import { ButtonGroup } from '@/components/tiptap-ui-primitive/button'
import { Label } from '@/components/tiptap-ui-primitive/label'
import { Separator } from '@/components/tiptap-ui-primitive/separator'
import SubMenuTrigger from './SubMenuTrigger.vue'
import TextColorMenuItem from './TextColorMenuItem.vue'
import HighlightColorMenuItem from './HighlightColorMenuItem.vue'
import RecentColorMenuItem from './RecentColorMenuItem.vue'
import { useRecentColors } from '@/composables/useRecentColors'
import { TEXT_COLORS } from '@/composables/useColorText'
import { HIGHLIGHT_COLORS } from '@/composables/useColorHighlight'
import PaintBucketIcon from '@/components/tiptap-icons/PaintBucketIcon.vue'

const { recentColors, isInitialized } = useRecentColors()
</script>
