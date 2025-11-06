<script setup lang="ts">
import { inject } from 'vue'
import type { Editor, Range } from '@tiptap/core'
import type { ShallowRef } from 'vue'
import type {
  SuggestionMenuProps,
  SuggestionMenuRenderProps,
} from '@/components/tiptap-ui-utils/suggestion-menu'
import SuggestionMenu from '@/components/tiptap-ui-utils/suggestion-menu/SuggestionMenu.vue'
import { ButtonGroup } from '@/components/tiptap-ui-primitive/button'
import { Card, CardBody } from '@/components/tiptap-ui-primitive/card'
import MentionItem from './MentionItem.vue'

interface User {
  id: number
  name: string
  position: string
  avatarUrl: string
}

type MentionDropdownMenuProps = Omit<SuggestionMenuProps, 'items' | 'children'>

const props = defineProps<MentionDropdownMenuProps>()

// Inject editor from parent if not provided as prop
const injectedEditor = inject<ShallowRef<Editor | null>>('editor')
const editor = props.editor ?? (injectedEditor as any)

const fetchUsers = async (query: string): Promise<User[]> => {
  const employeeData = [
    ['Emily Johnson', 'Marketing Manager'],
    ['Michael Thompson', 'Sales Manager'],
    ['Sophia Lee', 'Product Designer'],
    ['William Davis', 'IT Project Manager'],
    ['Olivia Wilson', 'HR Specialist'],
    ['Daniel Taylor', 'Financial Controller'],
    ['Isabella Anderson', 'Graphic Designer'],
    ['Jacob Martinez', 'Sales Representative'],
    ['Ava Hernandez', 'Marketing Assistant'],
    ['Alexander Diaz', 'IT Support'],
    ['Emma Ramirez', 'HR Specialist'],
    ['Ethan Flores', 'Product Manager'],
    ['Mia Morales', 'Graphic Designer'],
    ['Noah Reyes', 'Sales Manager'],
    ['Isabella Castillo', 'Marketing Manager'],
    ['Liam Gutierrez', 'IT Project Manager'],
    ['Avery Jimenez', 'HR Specialist'],
    ['Lucas Vargas', 'Product Designer'],
    ['Chloe Rojas', 'Graphic Designer'],
    ['Kai Zhang', 'Sales Representative'],
  ] as const

  const userData = {
    users: employeeData.map(([name, position], index) => {
      const id = index + 1
      const avatarNumber = id < 10 ? `0${id}` : `${id}`

      return {
        id,
        name,
        position,
        avatarUrl: `/avatars/memoji_${avatarNumber}.png`,
      }
    }),
  }

  if (!query) return userData.users

  return userData.users.filter(
    (user) =>
      user.name.toLowerCase().includes(query.toLowerCase()) ||
      user.position.toLowerCase().includes(query.toLowerCase())
  )
}

const handleItemSelect = (params: {
  editor: Editor
  range: Range
  context?: User
}) => {
  if (!params.editor || !params.range || !params.context) return

  params.editor
    .chain()
    .focus()
    .insertContentAt(params.range, [
      {
        type: 'mention',
        attrs: {
          id: params.context.id.toString(),
          label: params.context.name,
        },
      },
      {
        type: 'text',
        text: ' ',
      },
    ])
    .run()
}

const getSuggestionItems = async (params: { query: string }) => {
  const users = await fetchUsers(params.query)

  return users.map((user) => ({
    title: user.name,
    subtext: user.name,
    context: user,
    onSelect: handleItemSelect,
  }))
}
</script>

<template>
  <SuggestionMenu
    v-bind="props"
    :editor="editor"
    char="@"
    plugin-key="mentionDropdownMenu"
    decoration-class="tiptap-mention-decoration"
    selector="tiptap-mention-dropdown-menu"
    :items="getSuggestionItems"
  >
    <template #default="{ items, selectedIndex, onSelect }: SuggestionMenuRenderProps<User>">
      <Card
        v-if="items.length"
        :style="{
          maxHeight: 'var(--suggestion-menu-max-height)',
        }"
      >
        <CardBody>
          <ButtonGroup>
            <MentionItem
              v-for="(item, index) in items"
              :key="item.context?.id || item.title"
              :item="item"
              :is-selected="index === selectedIndex"
              @select="() => onSelect(item)"
            />
          </ButtonGroup>
        </CardBody>
      </Card>
    </template>
  </SuggestionMenu>
</template>
