<script setup lang="ts">
import { computed } from 'vue'
import { useTiptapEditor } from '@/composables/useTiptapEditor'
import { getAvatar } from '@/lib/tiptap-collab-utils'
import Avatar from '@/components/tiptap-ui-primitive/avatar/Avatar.vue'
import AvatarFallback from '@/components/tiptap-ui-primitive/avatar/AvatarFallback.vue'
import AvatarGroup from '@/components/tiptap-ui-primitive/avatar/AvatarGroup.vue'
import AvatarImage from '@/components/tiptap-ui-primitive/avatar/AvatarImage.vue'
import Button from '@/components/tiptap-ui-primitive/button/Button.vue'
import ButtonGroup from '@/components/tiptap-ui-primitive/button/ButtonGroup.vue'
import Card from '@/components/tiptap-ui-primitive/card/Card.vue'
import CardBody from '@/components/tiptap-ui-primitive/card/CardBody.vue'
import CardItemGroup from '@/components/tiptap-ui-primitive/card/CardItemGroup.vue'
import DropdownMenu from '@/components/tiptap-ui-primitive/dropdown-menu/DropdownMenu.vue'
import DropdownMenuContentWrapper from '@/components/tiptap-ui-primitive/dropdown-menu/DropdownMenuContentWrapper.vue'

interface User {
  clientId: number
  id: string
  name: string
  color: string
}

const { editor } = useTiptapEditor()

const collaborationUsers = computed<User[]>(() => {
  if (!editor.value || !editor.value.storage.collaborationCaret) {
    return []
  }

  return editor.value.storage.collaborationCaret.users.map((user: any) => ({
    clientId: user.clientId,
    id: String(user.clientId),
    name: user.name || 'Anonymous',
    color: user.color || '#000000',
  }))
})
</script>

<template>
  <DropdownMenu v-if="collaborationUsers.length > 0">
    <template #trigger>
      <Button
        data-style="ghost"
        data-appearance="subdued"
        :style="{ padding: '0.25rem' }"
      >
        <AvatarGroup :max-visible="3">
          <Avatar
            v-for="user in collaborationUsers"
            :key="user.id"
            :user-color="user.color"
          >
            <AvatarImage :src="getAvatar(user.name)" />
            <AvatarFallback>{{ user.name?.toUpperCase()[0] }}</AvatarFallback>
          </Avatar>
        </AvatarGroup>
      </Button>
    </template>

    <template #content="{ close }">
      <DropdownMenuContentWrapper align="end">
        <Card>
          <CardBody>
            <CardItemGroup>
              <ButtonGroup>
                <Button
                  v-for="user in collaborationUsers"
                  :key="user.id"
                  data-style="ghost"
                  @click="close"
                >
                  <Avatar :user-color="user.color">
                    <AvatarImage :src="getAvatar(user.name)" />
                    <AvatarFallback>
                      {{ user.name?.toUpperCase()[0] }}
                    </AvatarFallback>
                  </Avatar>
                  <span class="tiptap-button-text">{{ user.name }}</span>
                </Button>
              </ButtonGroup>
            </CardItemGroup>
          </CardBody>
        </Card>
      </DropdownMenuContentWrapper>
    </template>
  </DropdownMenu>
</template>
