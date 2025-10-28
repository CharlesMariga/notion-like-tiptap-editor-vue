<script setup lang="ts">
import { ref, computed, watch, onUnmounted, toRefs } from "vue";
import { flip, offset, shift, size } from "@floating-ui/vue";
import { PluginKey } from "@tiptap/pm/state";

// --- Composables ---
import { useFloatingElement } from "../../../composables/useFloatingElement";
import { useTiptapEditor } from "../../../composables/useTiptapEditor";

// --- Tiptap Editor ---
import type { Range } from "@tiptap/vue-3";

// --- Tiptap UI ---
import { Suggestion } from "@tiptap/suggestion";
import {
  SuggestionPluginKey,
  type SuggestionKeyDownProps,
  type SuggestionProps,
} from "@tiptap/suggestion";

import { calculateStartPosition } from "./suggestion-menu-utils";
import type {
  SuggestionItem,
  SuggestionMenuProps,
} from "./suggestion-menu-types";

/**
 * A component that renders a suggestion menu for Tiptap editors.
 * Displays a floating menu when a trigger character is typed.
 */
const props = withDefaults(defineProps<SuggestionMenuProps>(), {
  selector: "tiptap-suggestion-menu",
  maxHeight: 384,
  pluginKey: () => SuggestionPluginKey,
});

const {
  editor: providedEditor,
  floatingOptions,
  selector,
  maxHeight,
  pluginKey,
  ...internalSuggestionProps
} = toRefs(props);

const { editor } = useTiptapEditor(providedEditor);

const show = ref<boolean>(false);
const internalClientRect = ref<DOMRect | null>(null);
const internalCommand = ref<((item: SuggestionItem) => void) | null>(null);
const internalItems = ref<SuggestionItem[]>([]);
const internalQuery = ref<string>("");
const internalRange = ref<Range | null>(null);

const floatingOptionsValue = computed(() => ({
  placement: "bottom-start" as const,
  middleware: [
    offset(10),
    flip({
      mainAxis: true,
      crossAxis: false,
    }),
    shift(),
    size({
      apply({ availableHeight, elements }) {
        if (elements.floating) {
          const maxHeightValue = maxHeight.value
            ? Math.min(maxHeight.value, availableHeight)
            : availableHeight;

          elements.floating.style.setProperty(
            "--suggestion-menu-max-height",
            `${maxHeightValue}px`
          );
        }
      },
    }),
  ],
  onOpenChange(open: boolean) {
    if (!open) {
      show.value = false;
    }
  },
  ...floatingOptions?.value,
}));

const { floatingRef, style } = useFloatingElement(
  show,
  internalClientRect,
  1000,
  floatingOptionsValue
);

const closePopup = () => {
  show.value = false;
};

// Watch for editor and plugin key changes to register/unregister plugin
watch(
  [editor, pluginKey],
  ([currentEditor, currentPluginKey]) => {
    if (!currentEditor || currentEditor.isDestroyed) {
      return;
    }

    // Unregister existing plugin if it exists
    const existingPlugin = currentEditor.state.plugins.find(
      (plugin) => plugin.spec.key === currentPluginKey
    );
    if (existingPlugin) {
      currentEditor.unregisterPlugin(currentPluginKey);
    }

    const suggestionOptions = Object.fromEntries(
      Object.entries(internalSuggestionProps).map(([key, ref]) => [
        key,
        ref.value,
      ])
    );

    const pluginKeyInstance = currentPluginKey instanceof PluginKey
      ? currentPluginKey
      : new PluginKey(currentPluginKey as string);

    const suggestion = Suggestion({
      pluginKey: pluginKeyInstance,
      editor: currentEditor,
      ...suggestionOptions,

      command({ editor, range, props }) {
        if (!range) {
          return;
        }

        const { view, state } = editor;
        const { selection } = state;

        const isMention = editor.extensionManager.extensions.some(
          (extension) => {
            const name = extension.name;
            return (
              name === "mention" &&
              extension.options?.suggestion?.char ===
                internalSuggestionProps.char?.value
            );
          }
        );

        if (!isMention) {
          const cursorPosition = selection.$from.pos;
          const previousNode = selection.$head?.nodeBefore;

          const startPosition = previousNode
            ? calculateStartPosition(
                cursorPosition,
                previousNode,
                internalSuggestionProps.char?.value
              )
            : selection.$from.start();

          const transaction = state.tr.deleteRange(
            startPosition,
            cursorPosition
          );
          view.dispatch(transaction);
        }

        const nodeAfter = view.state.selection.$to.nodeAfter;
        const overrideSpace = nodeAfter?.text?.startsWith(" ");

        const rangeToUse = { ...range };

        if (overrideSpace) {
          rangeToUse.to += 1;
        }

        props.onSelect({ editor, range: rangeToUse, context: props.context });
      },

      render: () => {
        return {
          onStart: (props: SuggestionProps<SuggestionItem>) => {
            internalCommand.value = props.command;
            internalItems.value = props.items;
            internalQuery.value = props.query;
            internalRange.value = props.range;
            internalClientRect.value = props.clientRect?.() ?? null;
            show.value = true;
          },

          onUpdate: (props: SuggestionProps<SuggestionItem>) => {
            internalCommand.value = props.command;
            internalItems.value = props.items;
            internalQuery.value = props.query;
            internalRange.value = props.range;
            internalClientRect.value = props.clientRect?.() ?? null;
          },

          onKeyDown: (props: SuggestionKeyDownProps) => {
            if (internalItems.value.length === 0) {
              return false;
            }

            switch (props.event.key) {
              case "ArrowUp":
                props.event.preventDefault();
                movePrev();
                return true;

              case "ArrowDown":
                props.event.preventDefault();
                moveNext();
                return true;

              case "Enter":
                // Enter is handled by the SuggestionEnterFix extension
                // This handler is kept for backwards compatibility
                if ((props.event as any).isComposing) return false;
                return false;

              case "Escape":
                closePopup();
                return true;

              default:
                return false;
            }
          },

          onExit: () => {
            internalCommand.value = null;
            internalItems.value = [];
            internalQuery.value = "";
            internalRange.value = null;
            internalClientRect.value = null;
            show.value = false;
          },
        };
      },
    });

    currentEditor.registerPlugin(suggestion);
  },
  { immediate: true }
);

// Cleanup on unmount
onUnmounted(() => {
  if (editor.value && !editor.value.isDestroyed) {
    editor.value.unregisterPlugin(pluginKey.value);
  }
});

const onSelect = (item: SuggestionItem) => {
  if (internalCommand.value) {
    internalCommand.value(item);
  }

  closePopup();
};

const selectedIndex = ref<number>(0);

// Expose handler for external use (e.g., from keyboard shortcuts)
const handleEnterKey = () => {
  if (!show.value || internalItems.value.length === 0) {
    return false;
  }

  const selectedItem = internalItems.value[selectedIndex.value];

  if (selectedItem && internalCommand.value) {
    internalCommand.value(selectedItem);
    return true;
  }

  return false;
};

// Store handlers globally for access from extensions
// Use a map keyed by plugin key to support multiple suggestion menus
const ensureHandlersMap = (ed: any) => {
  if (!ed.__suggestionMenuEnterHandlers) {
    ed.__suggestionMenuEnterHandlers = new Map();
  }
};

if (editor.value) {
  ensureHandlersMap(editor.value);
  (editor.value as any).__suggestionMenuEnterHandlers.set(pluginKey.value, handleEnterKey);
}

watch([editor, pluginKey], ([newEditor, newPluginKey]) => {
  if (newEditor) {
    ensureHandlersMap(newEditor);
    (newEditor as any).__suggestionMenuEnterHandlers.set(newPluginKey, handleEnterKey);
  }
});

// Cleanup handler on unmount
onUnmounted(() => {
  if (editor.value) {
    (editor.value as any).__suggestionMenuEnterHandlers?.delete(pluginKey.value);
  }
});

const moveNext = () => {
  if (internalItems.value.length === 0) return;
  selectedIndex.value = (selectedIndex.value + 1) % internalItems.value.length;
};

const movePrev = () => {
  if (internalItems.value.length === 0) return;
  selectedIndex.value =
    (selectedIndex.value - 1 + internalItems.value.length) %
    internalItems.value.length;
};

// Reset selectedIndex when query changes
watch(internalQuery, () => {
  selectedIndex.value = 0;
});

// Reset selectedIndex when items change
watch(internalItems, () => {
  selectedIndex.value = 0;
});

const isVisible = computed(() => show.value && editor.value);
</script>

<template>
  <Teleport to="body">
    <div
      v-if="isVisible"
      ref="floatingRef"
      :style="style"
      :data-selector="selector"
      class="tiptap-suggestion-menu"
      role="listbox"
      aria-label="Suggestions"
      @pointerdown.prevent
    >
      <slot
        :items="internalItems"
        :selected-index="selectedIndex"
        :on-select="onSelect"
      />
    </div>
  </Teleport>
</template>
