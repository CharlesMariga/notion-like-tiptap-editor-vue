<template>
  <div
    v-if="isMounted && show && editor"
    :ref="(el) => (refs.floating.value = el as HTMLElement)"
    :style="style"
    v-bind="getFloatingProps()"
    :data-selector="selector"
    class="tiptap-suggestion-menu"
    role="listbox"
    aria-label="Suggestions"
    @pointerdown.prevent
  >
    <slot
      :items="internalItems"
      :selectedIndex="selectedIndex"
      :onSelect="onSelect"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onBeforeUnmount } from 'vue'
import { flip, offset, shift, size } from '@floating-ui/vue'
import { PluginKey } from '@tiptap/pm/state'

import { useFloatingElement } from '@/composables/useFloatingElement'
import { useMenuNavigation } from '@/composables/useMenuNavigation'
import { useTiptapEditor } from '@/composables/useTiptapEditor'

import type { Range } from '@tiptap/vue-3'

import { Suggestion } from '@tiptap/suggestion'

import {
  SuggestionPluginKey,
  type SuggestionKeyDownProps,
  type SuggestionProps,
} from '@tiptap/suggestion'

import { calculateStartPosition } from './suggestion-menu-utils'
import type {
  SuggestionItem,
  SuggestionMenuProps,
} from './suggestion-menu-types'

const props = withDefaults(
  defineProps<SuggestionMenuProps>(),
  {
    selector: 'tiptap-suggestion-menu',
    maxHeight: 384,
    pluginKey: () => SuggestionPluginKey,
  }
)

const { editor } = useTiptapEditor(computed(() => {
  return props.editor ?? null
}))

// Filter out props that shouldn't be passed to Suggestion plugin
// We handle these separately or define our own implementations
const suggestionProps = computed(() => {
  const {
    editor: _,
    selector: __,
    maxHeight: ___,
    pluginKey: ____,
    command: _____,      // We define our own command implementation
    render: ______,      // We define our own render implementation
    ...suggestionOptions
  } = props
  return suggestionOptions
})

const show = ref<boolean>(false)
const internalClientRect = ref<DOMRect | null>(null)
const internalCommand = ref<((item: SuggestionItem) => void) | null>(null)
const internalItems = ref<SuggestionItem[]>([])
const internalQuery = ref<string>('')
const internalRange = ref<Range | null>(null)

const { isMounted, style, getFloatingProps, refs } = useFloatingElement(
  show,
  internalClientRect,
  1000,
  {
    placement: 'bottom-start',
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
            const maxHeightValue = props.maxHeight
              ? Math.min(props.maxHeight, availableHeight)
              : availableHeight

            elements.floating.style.setProperty(
              '--suggestion-menu-max-height',
              `${maxHeightValue}px`
            )
          }
        },
      }),
    ],
  }
)

const closePopup = () => {
  show.value = false
}

watch(
  editor,
  (currentEditor, oldEditor) => {
    if (!currentEditor || currentEditor.isDestroyed) {
      return
    }

    // Clean up old editor plugin if switching editors
    if (oldEditor && !oldEditor.isDestroyed) {
      try {
        oldEditor.unregisterPlugin(props.pluginKey)
      } catch (e) {
        // Plugin might not exist, ignore
      }
    }

    const existingPlugin = currentEditor.state.plugins.find(
      (plugin) => plugin.spec.key === props.pluginKey
    )
    if (existingPlugin) {
      currentEditor.unregisterPlugin(props.pluginKey)
    }

    const suggestion = Suggestion({
      pluginKey:
        props.pluginKey instanceof PluginKey
          ? props.pluginKey
          : new PluginKey(props.pluginKey as string),
      editor: currentEditor,

      command({ editor, range, props: commandProps }) {
        if (!range) {
          return
        }

        const { view, state } = editor
        const { selection } = state

        const isMention = editor.extensionManager.extensions.some(
          (extension) => {
            const name = extension.name
            return (
              name === 'mention' &&
              extension.options?.suggestion?.char === props.char
            )
          }
        )

        if (!isMention) {
          const cursorPosition = selection.$from.pos
          const previousNode = selection.$head?.nodeBefore

          const startPosition = previousNode
            ? calculateStartPosition(
                cursorPosition,
                previousNode,
                props.char
              )
            : selection.$from.start()

          const transaction = state.tr.deleteRange(startPosition, cursorPosition)
          view.dispatch(transaction)
        }

        const nodeAfter = view.state.selection.$to.nodeAfter
        const overrideSpace = nodeAfter?.text?.startsWith(' ')

        const rangeToUse = { ...range }

        if (overrideSpace) {
          rangeToUse.to += 1
        }

        commandProps.onSelect({ editor, range: rangeToUse, context: commandProps.context })
      },

      render: () => {
        return {
          onStart: (renderProps: SuggestionProps<SuggestionItem>) => {
            internalCommand.value = renderProps.command
            internalItems.value = renderProps.items
            internalQuery.value = renderProps.query
            internalRange.value = renderProps.range
            internalClientRect.value = renderProps.clientRect?.() ?? null
            show.value = true
          },

          onUpdate: (renderProps: SuggestionProps<SuggestionItem>) => {
            internalCommand.value = renderProps.command
            internalItems.value = renderProps.items
            internalQuery.value = renderProps.query
            internalRange.value = renderProps.range
            internalClientRect.value = renderProps.clientRect?.() ?? null
          },

          onKeyDown: (keyProps: SuggestionKeyDownProps) => {
            if (keyProps.event.key === 'Escape') {
              closePopup()
              return true
            }
            return false
          },

          onExit: () => {
            internalCommand.value = null
            internalItems.value = []
            internalQuery.value = ''
            internalRange.value = null
            internalClientRect.value = null
            show.value = false
          },
        }
      },
      ...suggestionProps.value,
    })

    currentEditor.registerPlugin(suggestion)
  },
  { immediate: true }
)

onBeforeUnmount(() => {
  if (editor.value && !editor.value.isDestroyed) {
    editor.value.unregisterPlugin(props.pluginKey)
  }
})

const onSelect = (item: SuggestionItem) => {
  closePopup()

  if (internalCommand.value) {
    internalCommand.value(item)
  }
}

const { selectedIndex } = useMenuNavigation({
  editor: editor,
  query: internalQuery,
  items: internalItems,
  onSelect,
})
</script>

<style scoped>
.tiptap-suggestion-menu {
  position: fixed;
}
</style>
