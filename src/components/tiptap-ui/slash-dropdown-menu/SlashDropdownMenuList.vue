<script lang="ts">
import { defineComponent, h, type PropType } from 'vue'

import type {
  SuggestionItem,
} from '@/components/tiptap-ui-utils/suggestion-menu'

import ButtonGroup from '@/components/tiptap-ui-primitive/button/ButtonGroup.vue'
import Separator from '@/components/tiptap-ui-primitive/separator/Separator.vue'
import Card from '@/components/tiptap-ui-primitive/card/Card.vue'
import CardBody from '@/components/tiptap-ui-primitive/card/CardBody.vue'
import CardGroupLabel from '@/components/tiptap-ui-primitive/card/CardGroupLabel.vue'
import CardItemGroup from '@/components/tiptap-ui-primitive/card/CardItemGroup.vue'
import SlashMenuItem from './SlashMenuItem.vue'

import type { SlashMenuConfig } from './useSlashDropdownMenu'

export default defineComponent({
  name: 'SlashDropdownMenuList',
  props: {
    items: {
      type: Array as () => SuggestionItem[],
      required: true,
    },
    selectedIndex: {
      type: Number,
      required: true,
    },
    onSelect: {
      type: Function as PropType<(item: SuggestionItem) => void>,
      required: true,
    },
    config: {
      type: Object as () => SlashMenuConfig,
      default: undefined,
    },
  },
  render() {
    const rendered: any[] = []
    const showGroups = this.config?.showGroups !== false

    if (!showGroups) {
      this.items.forEach((item, index) => {
        rendered.push(
          h(SlashMenuItem, {
            key: `item-${index}-${item.title}`,
            item,
            isSelected: index === this.selectedIndex,
            onSelect: () => this.onSelect(item),
          })
        )
      })
    } else {
      const groups: {
        [groupLabel: string]: { items: SuggestionItem[]; indices: number[] }
      } = {}

      this.items.forEach((item, index) => {
        const groupLabel = item.group || ''
        if (!groups[groupLabel]) {
          groups[groupLabel] = { items: [], indices: [] }
        }
        groups[groupLabel].items.push(item)
        groups[groupLabel].indices.push(index)
      })

      Object.entries(groups).forEach(([groupLabel, groupData], groupIndex) => {
        if (groupIndex > 0) {
          rendered.push(
            h(Separator, {
              key: `separator-${groupIndex}`,
              orientation: 'horizontal',
            })
          )
        }

        const groupItems = groupData.items.map((item, itemIndex) => {
          const originalIndex = groupData.indices[itemIndex]
          return h(SlashMenuItem, {
            key: `item-${originalIndex}-${item.title}`,
            item,
            isSelected: originalIndex === this.selectedIndex,
            onSelect: () => this.onSelect(item),
          })
        })

        if (groupLabel) {
          rendered.push(
            h(
              CardItemGroup,
              { key: `group-${groupIndex}-${groupLabel}` },
              () => [
                h(CardGroupLabel, {}, () => groupLabel),
                h(ButtonGroup, {}, () => groupItems),
              ]
            )
          )
        } else {
          rendered.push(...groupItems)
        }
      })
    }

    if (!rendered.length) {
      return null
    }

    return h(
      Card,
      {
        class: 'tiptap-slash-card',
        style: {
          maxHeight: 'var(--suggestion-menu-max-height)',
        },
      },
      () => [h(CardBody, { class: 'tiptap-slash-card-body' }, () => rendered)]
    )
  },
})
</script>

<style scoped></style>
