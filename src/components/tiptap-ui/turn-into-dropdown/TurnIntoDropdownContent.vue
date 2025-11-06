<script setup lang="ts">
import { computed } from "vue";
import { getFilteredBlockTypeOptions } from "@/composables/useTurnIntoDropdown";
import { TextButton } from "@/components/tiptap-ui/text-button";
import { HeadingButton } from "@/components/tiptap-ui/heading-button";
import { ListButton } from "@/components/tiptap-ui/list-button";
import { BlockquoteButton } from "@/components/tiptap-ui/blockquote-button";
import { CodeBlockButton } from "@/components/tiptap-ui/code-block-button";
import { ButtonGroup } from "@/components/tiptap-ui-primitive/button";
import { DropdownMenuItem } from "@/components/tiptap-ui-primitive/dropdown-menu";
import {
  Card,
  CardBody,
  CardGroupLabel,
  CardItemGroup,
} from "@/components/tiptap-ui-primitive/card";

export interface TurnIntoDropdownContentProps {
  blockTypes?: string[];
  useCardLayout?: boolean;
}

const props = withDefaults(defineProps<TurnIntoDropdownContentProps>(), {
  useCardLayout: true,
});

const filteredOptions = computed(() =>
  getFilteredBlockTypeOptions(props.blockTypes)
);
</script>

<template>
  <Card v-if="useCardLayout">
    <CardBody>
      <CardItemGroup>
        <CardGroupLabel>Turn into</CardGroupLabel>
        <ButtonGroup>
          <template
            v-for="(option, index) in filteredOptions"
            :key="`${option.type}-${option.level ?? index}`"
          >
            <!-- Paragraph -->
            <DropdownMenuItem v-if="option.type === 'paragraph'" as-child>
              <TextButton :show-tooltip="false" :text="option.label" />
            </DropdownMenuItem>

            <!-- Heading -->
            <DropdownMenuItem
              v-else-if="option.type === 'heading' && option.level"
              as-child
            >
              <HeadingButton
                :level="option.level || 1"
                :show-tooltip="false"
                :text="option.label"
              />
            </DropdownMenuItem>

            <!-- Bullet List -->
            <DropdownMenuItem v-else-if="option.type === 'bulletList'" as-child>
              <ListButton
                type="bulletList"
                :show-tooltip="false"
                :text="option.label"
              />
            </DropdownMenuItem>

            <!-- Ordered List -->
            <DropdownMenuItem
              v-else-if="option.type === 'orderedList'"
              as-child
            >
              <ListButton
                type="orderedList"
                :show-tooltip="false"
                :text="option.label"
              />
            </DropdownMenuItem>

            <!-- Task List -->
            <DropdownMenuItem v-else-if="option.type === 'taskList'" as-child>
              <ListButton
                type="taskList"
                :show-tooltip="false"
                :text="option.label"
              />
            </DropdownMenuItem>

            <!-- Blockquote -->
            <DropdownMenuItem v-else-if="option.type === 'blockquote'" as-child>
              <BlockquoteButton :show-tooltip="false" :text="option.label" />
            </DropdownMenuItem>

            <!-- Code Block -->
            <DropdownMenuItem v-else-if="option.type === 'codeBlock'" as-child>
              <CodeBlockButton :show-tooltip="false" :text="option.label" />
            </DropdownMenuItem>
          </template>
        </ButtonGroup>
      </CardItemGroup>
    </CardBody>
  </Card>

  <ButtonGroup v-else>
    <template
      v-for="(option, index) in filteredOptions"
      :key="`${option.type}-${option.level ?? index}`"
    >
      <!-- Paragraph -->
      <DropdownMenuItem v-if="option.type === 'paragraph'" as-child>
        <TextButton :show-tooltip="false" :text="option.label" />
      </DropdownMenuItem>

      <!-- Heading -->
      <DropdownMenuItem
        v-else-if="option.type === 'heading' && option.level"
        as-child
      >
        <HeadingButton
          :level="option.level || 1"
          :show-tooltip="false"
          :text="option.label"
        />
      </DropdownMenuItem>

      <!-- Bullet List -->
      <DropdownMenuItem v-else-if="option.type === 'bulletList'" as-child>
        <ListButton
          type="bulletList"
          :show-tooltip="false"
          :text="option.label"
        />
      </DropdownMenuItem>

      <!-- Ordered List -->
      <DropdownMenuItem v-else-if="option.type === 'orderedList'" as-child>
        <ListButton
          type="orderedList"
          :show-tooltip="false"
          :text="option.label"
        />
      </DropdownMenuItem>

      <!-- Task List -->
      <DropdownMenuItem v-else-if="option.type === 'taskList'" as-child>
        <ListButton
          type="taskList"
          :show-tooltip="false"
          :text="option.label"
        />
      </DropdownMenuItem>

      <!-- Blockquote -->
      <DropdownMenuItem v-else-if="option.type === 'blockquote'" as-child>
        <BlockquoteButton :show-tooltip="false" :text="option.label" />
      </DropdownMenuItem>

      <!-- Code Block -->
      <DropdownMenuItem v-else-if="option.type === 'codeBlock'" as-child>
        <CodeBlockButton :show-tooltip="false" :text="option.label" />
      </DropdownMenuItem>
    </template>
  </ButtonGroup>
</template>
