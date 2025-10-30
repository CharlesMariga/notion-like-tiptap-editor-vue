<script setup lang="ts">
import type { Component } from "vue";

// --- UI Primitives ---
import Button from "@/components/tiptap-ui-primitive/button/Button.vue";
import ButtonGroup from "@/components/tiptap-ui-primitive/button/ButtonGroup.vue";
import Popover from "@/components/tiptap-ui-primitive/popover/popover.vue";
import PopoverContent from "@/components/tiptap-ui-primitive/popover/PopoverContent.vue";
import PopoverTrigger from "@/components/tiptap-ui-primitive/popover/PopoverTrigger.vue";
import Card from "@/components/tiptap-ui-primitive/card/Card.vue";
import CardBody from "@/components/tiptap-ui-primitive/card/CardBody.vue";

// --- Icons ---
import ChevronRightIcon from "@/components/tiptap-icons/ChevronRightIcon.vue";

export interface SubMenuItem {
  value: string;
  label: string;
  icon?: Component;
  onClick: () => void;
}

export interface SubMenuAction {
  icon: Component;
  label: string;
  items: SubMenuItem[];
}

interface SubMenuDropdownProps {
  action: SubMenuAction;
}

defineProps<SubMenuDropdownProps>();
</script>

<template>
  <Popover>
    <PopoverTrigger as-child>
      <Button data-style="ghost" type="button">
        <component :is="action.icon" class="tiptap-button-icon" />
        <span class="tiptap-button-text">{{ action.label }}</span>
        <ChevronRightIcon class="tiptap-button-icon-sub" />
      </Button>
    </PopoverTrigger>

    <PopoverContent side="right" align="start">
      <Card>
        <CardBody>
          <ButtonGroup class="flex-col">
            <Button
              v-for="item in action.items"
              :key="item.value"
              type="button"
              data-style="ghost"
              class="justify-start"
              @click="item.onClick"
            >
              <component
                v-if="item.icon"
                :is="item.icon"
                class="tiptap-button-icon"
              />
              <span class="tiptap-button-text">{{ item.label }}</span>
            </Button>
          </ButtonGroup>
        </CardBody>
      </Card>
    </PopoverContent>
  </Popover>
</template>

<style scoped>
.flex-col {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.justify-start {
  justify-content: flex-start;
}

.tiptap-button-icon {
  width: 1rem;
  height: 1rem;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

.tiptap-button-icon-sub {
  width: 1rem;
  height: 1rem;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  margin-left: auto;
}

.tiptap-button-text {
  text-align: left;
}
</style>
