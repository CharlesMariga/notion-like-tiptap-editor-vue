<script setup lang="ts">
import { ref, computed, watch, h, type VNode } from 'vue'
import type { Editor } from '@tiptap/vue-3'

// --- Composables ---
import { useMobile } from '@/composables/useMobile'
import { useWindowSize } from '@/composables/useWindowSize'
import { useTiptapEditor } from '@/composables/useTiptapEditor'
import { useCursorVisibility } from '@/composables/useCursorVisibility'
import { useRecentColors } from '@/composables/useRecentColors'
import { useMenuActionVisibility } from '@/composables/useDragContextMenu'
import { canSetLink } from '@/composables/useLinkPopover'

// --- Tiptap UI ---
import {
  ColorHighlightPopover,
  ColorHighlightPopoverButton,
  ColorHighlightPopoverContent,
} from '@/components/tiptap-ui/color-highlight-popover'
import ImageUploadButton from '@/components/tiptap-ui/image-upload-button/ImageUploadButton.vue'
import LinkPopover from '@/components/tiptap-ui/LinkPopover.vue'
import MarkButton from '@/components/tiptap-ui/mark-button/MarkButton.vue'
import TextAlignButton from '@/components/tiptap-ui/TextAlignButton.vue'
import SlashCommandTriggerButton from '@/components/tiptap-ui/slash-command-trigger-button/SlashCommandTriggerButton.vue'
import ResetAllFormattingButton from '@/components/tiptap-ui/reset-all-formatting-button/ResetAllFormattingButton.vue'
import DeleteNodeButton from '@/components/tiptap-ui/delete-node-button/DeleteNodeButton.vue'
import ImproveDropdown from '@/components/tiptap-ui/improve-dropdown/ImproveDropdown.vue'
import CopyAnchorLinkButton from '@/components/tiptap-ui/copy-anchor-link-button/CopyAnchorLinkButton.vue'
import { TurnIntoDropdownContent } from '@/components/tiptap-ui/turn-into-dropdown'
import {
  ColorTextButton,
  TEXT_COLORS,
} from '@/components/tiptap-ui/color-text-button'
import {
  canColorHighlight,
  ColorHighlightButton,
  HIGHLIGHT_COLORS,
} from '@/components/tiptap-ui/color-highlight-button'
import AiAskButton from '@/components/tiptap-ui/ai-ask-button/AiAskButton.vue'
import DuplicateButton from '@/components/tiptap-ui/duplicate-button/DuplicateButton.vue'
import CopyToClipboardButton from '@/components/tiptap-ui/copy-to-clipboard-button/CopyToClipboardButton.vue'

// --- Utils ---
import { getNodeDisplayName } from '@/lib/tiptap-collab-utils'

// --- Icons ---
import PaintBucketIcon from '@/components/tiptap-icons/PaintBucketIcon.vue'
import Repeat2Icon from '@/components/tiptap-icons/Repeat2Icon.vue'
import {
  Card,
  CardBody,
  CardGroupLabel,
  CardItemGroup,
} from '@/components/tiptap-ui-primitive/card'
import Spacer from '@/components/tiptap-ui-primitive/spacer/Spacer.vue'
import Separator from '@/components/tiptap-ui-primitive/separator/Separator.vue'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuPortal,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from '@/components/tiptap-ui-primitive/dropdown-menu'
import ArrowLeftIcon from '@/components/tiptap-icons/ArrowLeftIcon.vue'
import ChevronRightIcon from '@/components/tiptap-icons/ChevronRightIcon.vue'
import HighlighterIcon from '@/components/tiptap-icons/HighlighterIcon.vue'
import LinkIcon from '@/components/tiptap-icons/LinkIcon.vue'
import MoreVerticalIcon from '@/components/tiptap-icons/MoreVerticalIcon.vue'
import { Button, ButtonGroup } from '@/components/tiptap-ui-primitive/button'
import {
  Toolbar,
  ToolbarGroup,
  ToolbarSeparator,
} from '@/components/tiptap-ui-primitive/toolbar'
import MoveNodeButton from '@/components/tiptap-ui/move-node-button/MoveNodeButton.vue'
import ImageNodeFloating from '@/components/tiptap-node/image-node/image-node-floating.vue'

// =============================================================================
// Types & Constants
// =============================================================================

const TOOLBAR_VIEWS = {
  MAIN: 'main',
  HIGHLIGHTER: 'highlighter',
  LINK: 'link',
} as const

type ToolbarViewId = (typeof TOOLBAR_VIEWS)[keyof typeof TOOLBAR_VIEWS]

export interface ToolbarViewType {
  id: string
  title: string
  icon: VNode
  content: VNode
  mobileButton?: (onClick: () => void) => VNode
  desktopComponent?: VNode
  shouldShow?: (editor: Editor | null) => boolean
}

type ToolbarViewRegistry = Record<
  Exclude<ToolbarViewId, typeof TOOLBAR_VIEWS.MAIN>,
  ToolbarViewType
>

// =============================================================================
// Props
// =============================================================================

export interface MobileToolbarProps {
  editor?: Editor | null
}

const props = withDefaults(defineProps<MobileToolbarProps>(), {
  editor: null,
})

// =============================================================================
// Setup
// =============================================================================

const { editor } = useTiptapEditor(props.editor)
const isMobile = useMobile(480)
const toolbarRef = ref<HTMLDivElement | null>(null)
const viewId = ref<ToolbarViewId>(TOOLBAR_VIEWS.MAIN)

// Toolbar state
const isMainView = computed(() => viewId.value === TOOLBAR_VIEWS.MAIN)
const showMainView = () => {
  viewId.value = TOOLBAR_VIEWS.MAIN
}
const showView = (id: ToolbarViewId) => {
  viewId.value = id
}

// Reset to main view when switching to desktop
watch([isMobile, viewId], ([mobile, view]) => {
  if (!mobile && view !== TOOLBAR_VIEWS.MAIN) {
    viewId.value = TOOLBAR_VIEWS.MAIN
  }
})

// Window size and cursor position
const windowSize = useWindowSize()
const overlayHeight = computed(() => toolbarRef.value?.getBoundingClientRect().height ?? 0)
const rect = useCursorVisibility({
  editor: editor.value,
  overlayHeight: overlayHeight.value,
})

// =============================================================================
// Helper Functions
// =============================================================================

function hasTextSelection(editor: Editor | null): boolean {
  if (!editor || !editor.isEditable) return false

  const { selection } = editor.state
  return !selection.empty
}

// =============================================================================
// Toolbar View Registry
// =============================================================================

function createToolbarViewRegistry(): ToolbarViewRegistry {
  return {
    [TOOLBAR_VIEWS.HIGHLIGHTER]: {
      id: TOOLBAR_VIEWS.HIGHLIGHTER,
      title: 'Text Highlighter',
      icon: h(HighlighterIcon, { class: 'tiptap-button-icon' }),
      content: h(ColorHighlightPopoverContent),
      mobileButton: (onClick: () => void) => h(ColorHighlightPopoverButton, { onClick }),
      desktopComponent: h(ColorHighlightPopover),
      shouldShow(editor) {
        return canColorHighlight(editor)
      },
    },
    [TOOLBAR_VIEWS.LINK]: {
      id: TOOLBAR_VIEWS.LINK,
      title: 'Link Editor',
      icon: h(LinkIcon, { class: 'tiptap-button-icon' }),
      // For now, use a simple button for link in mobile view - full implementation would need LinkContent component
      content: h('div', {}, 'Link editor placeholder'),
      mobileButton: (onClick: () => void) =>
        h(
          Button,
          {
            onClick,
            'data-style': 'ghost',
          },
          { default: () => h(LinkIcon, { class: 'tiptap-button-icon' }) }
        ),
      desktopComponent: h(LinkPopover),
      shouldShow(editor) {
        return canSetLink(editor)
      },
    },
  }
}

const toolbarViews = createToolbarViewRegistry()

const currentView = computed(() => {
  if (isMainView.value) return null
  return toolbarViews[viewId.value as Exclude<ToolbarViewId, typeof TOOLBAR_VIEWS.MAIN>]
})

// =============================================================================
// Sub-Component Renderers (using render functions)
// =============================================================================

const renderAlignmentGroup = () => {
  return [
    h(
      ToolbarGroup,
      {},
      {
        default: () => [
          h(TextAlignButton, { align: 'left', hideWhenUnavailable: true }),
          h(TextAlignButton, { align: 'center', hideWhenUnavailable: true }),
          h(TextAlignButton, { align: 'right', hideWhenUnavailable: true }),
          h(TextAlignButton, { align: 'justify', hideWhenUnavailable: true }),
        ],
      }
    ),
    h(ToolbarSeparator),
  ]
}

const renderScriptGroup = () => {
  return [
    h(
      ToolbarGroup,
      {},
      {
        default: () => [
          h(MarkButton, { type: 'superscript', hideWhenUnavailable: true }),
          h(MarkButton, { type: 'subscript', hideWhenUnavailable: true }),
        ],
      }
    ),
    h(ToolbarSeparator),
  ]
}

const renderFormattingGroup = () => {
  return [
    h(
      ToolbarGroup,
      {},
      {
        default: () => [
          h(MarkButton, { type: 'bold', hideWhenUnavailable: true }),
          h(MarkButton, { type: 'italic', hideWhenUnavailable: true }),
          h(MarkButton, { type: 'strike', hideWhenUnavailable: true }),
          h(MarkButton, { type: 'code', hideWhenUnavailable: true }),
        ],
      }
    ),
    h(ToolbarSeparator),
  ]
}

const renderColorActionGroup = () => {
  const { recentColors, isInitialized, addRecentColor } = useRecentColors()

  const renderRecentColors = () => {
    if (!isInitialized.value || recentColors.value.length === 0) return null

    return [
      h(
        CardItemGroup,
        {},
        {
          default: () => [
            h(CardGroupLabel, {}, { default: () => 'Recent colors' }),
            h(
              ButtonGroup,
              {},
              {
                default: () =>
                  recentColors.value.map((colorObj) =>
                    h(
                      DropdownMenuItem,
                      { key: `${colorObj.type}-${colorObj.value}`, asChild: true },
                      {
                        default: () =>
                          colorObj.type === 'text'
                            ? h(ColorTextButton, {
                                textColor: colorObj.value,
                                label: colorObj.label,
                                text: colorObj.label,
                                tooltip: colorObj.label,
                                onApplied: ({ color, label }: { color: string; label: string }) =>
                                  addRecentColor({
                                    type: 'text',
                                    label,
                                    value: color,
                                  }),
                              })
                            : h(ColorHighlightButton, {
                                highlightColor: colorObj.value,
                                text: colorObj.label,
                                tooltip: colorObj.label,
                                onApplied: ({ color, label }: { color: string; label: string }) =>
                                  addRecentColor({
                                    type: 'highlight',
                                    label,
                                    value: color,
                                  }),
                              }),
                      }
                    )
                  ),
              }
            ),
          ],
        }
      ),
      h(Separator, { orientation: 'horizontal' }),
    ]
  }

  return h(
    DropdownMenuSub,
    {},
    {
      default: () => [
        h(
          DropdownMenuSubTrigger,
          { asChild: true },
          {
            default: () =>
              h(
                Button,
                { 'data-style': 'ghost' },
                {
                  default: () => [
                    h(PaintBucketIcon, { class: 'tiptap-button-icon' }),
                    h('span', { class: 'tiptap-button-text' }, 'Color'),
                    h(Spacer),
                    h(ChevronRightIcon, { class: 'tiptap-button-icon' }),
                  ],
                }
              ),
          }
        ),
        h(
          DropdownMenuPortal,
          {},
          {
            default: () =>
              h(
                DropdownMenuSubContent,
                {},
                {
                  default: () =>
                    h(
                      Card,
                      {},
                      {
                        default: () =>
                          h(
                            CardBody,
                            {},
                            {
                              default: () => [
                                renderRecentColors(),
                                h(
                                  CardItemGroup,
                                  {},
                                  {
                                    default: () => [
                                      h(CardGroupLabel, {}, { default: () => 'Text color' }),
                                      h(
                                        ButtonGroup,
                                        {},
                                        {
                                          default: () =>
                                            TEXT_COLORS.map((textColor) =>
                                              h(
                                                DropdownMenuItem,
                                                { key: textColor.value, asChild: true },
                                                {
                                                  default: () =>
                                                    h(ColorTextButton, {
                                                      textColor: textColor.value,
                                                      label: textColor.label,
                                                      text: textColor.label,
                                                      tooltip: textColor.label,
                                                      onApplied: ({
                                                        color,
                                                        label,
                                                      }: {
                                                        color: string
                                                        label: string
                                                      }) =>
                                                        addRecentColor({
                                                          type: 'text',
                                                          label,
                                                          value: color,
                                                        }),
                                                    }),
                                                }
                                              )
                                            ),
                                        }
                                      ),
                                    ],
                                  }
                                ),
                                h(Separator, { orientation: 'horizontal' }),
                                h(
                                  CardItemGroup,
                                  {},
                                  {
                                    default: () => [
                                      h(CardGroupLabel, {}, { default: () => 'Highlight color' }),
                                      h(
                                        ButtonGroup,
                                        {},
                                        {
                                          default: () =>
                                            HIGHLIGHT_COLORS.map((highlightColor) =>
                                              h(
                                                DropdownMenuItem,
                                                { key: highlightColor.value, asChild: true },
                                                {
                                                  default: () =>
                                                    h(ColorHighlightButton, {
                                                      highlightColor: highlightColor.value,
                                                      text: highlightColor.label,
                                                      tooltip: highlightColor.label,
                                                      onApplied: ({
                                                        color,
                                                        label,
                                                      }: {
                                                        color: string
                                                        label: string
                                                      }) =>
                                                        addRecentColor({
                                                          type: 'highlight',
                                                          label,
                                                          value: color,
                                                        }),
                                                    }),
                                                }
                                              )
                                            ),
                                        }
                                      ),
                                    ],
                                  }
                                ),
                              ],
                            }
                          ),
                      }
                    ),
                }
              ),
          }
        ),
      ],
    }
  )
}

const renderTransformActionGroup = () => {
  return h(
    DropdownMenuSub,
    {},
    {
      default: () => [
        h(
          DropdownMenuSubTrigger,
          { asChild: true },
          {
            default: () =>
              h(
                Button,
                { 'data-style': 'ghost' },
                {
                  default: () => [
                    h(Repeat2Icon, { class: 'tiptap-button-icon' }),
                    h('span', { class: 'tiptap-button-text' }, 'Turn into'),
                    h(Spacer),
                    h(ChevronRightIcon, { class: 'tiptap-button-icon' }),
                  ],
                }
              ),
          }
        ),
        h(
          DropdownMenuSubContent,
          {},
          {
            default: () => h(TurnIntoDropdownContent),
          }
        ),
      ],
    }
  )
}

const renderDropdownMenuActions = (editorProp: Editor | null) => {
  const editorRef = ref(editorProp) as any
  const { hasAnyActionGroups, hasColorActions, hasTransformActions, hasResetFormatting } =
    useMenuActionVisibility(editorRef)
  const isMobile = useMobile()

  return h(
    Card,
    {},
    {
      default: () =>
        h(
          CardBody,
          {},
          {
            default: () => [
              h(
                CardItemGroup,
                {},
                {
                  default: () => [
                    h(CardGroupLabel, {}, { default: () => getNodeDisplayName(editorProp) }),
                    h(
                      ButtonGroup,
                      {},
                      {
                        default: () => [
                          hasColorActions && renderColorActionGroup(),
                          hasTransformActions && renderTransformActionGroup(),
                          hasResetFormatting &&
                            h(
                              DropdownMenuItem,
                              { asChild: true },
                              {
                                default: () =>
                                  h(ResetAllFormattingButton, { text: 'Reset formatting' }),
                              }
                            ),
                        ],
                      }
                    ),
                  ],
                }
              ),
              hasAnyActionGroups && h(Separator, { orientation: 'horizontal' }),
              h(
                ButtonGroup,
                {},
                {
                  default: () => [
                    h(
                      DropdownMenuItem,
                      { asChild: true },
                      {
                        default: () =>
                          h(DuplicateButton, {
                            text: 'Duplicate node',
                            showShortcut: !isMobile.value,
                          }),
                      }
                    ),
                    h(
                      DropdownMenuItem,
                      { asChild: true },
                      {
                        default: () =>
                          h(CopyToClipboardButton, {
                            text: 'Copy to clipboard',
                            showShortcut: !isMobile.value,
                          }),
                      }
                    ),
                    h(
                      DropdownMenuItem,
                      { asChild: true },
                      {
                        default: () =>
                          h(CopyAnchorLinkButton, {
                            text: 'Copy anchor link',
                            showShortcut: !isMobile.value,
                          }),
                      }
                    ),
                  ],
                }
              ),
              h(Separator, { orientation: 'horizontal' }),
              h(
                ButtonGroup,
                {},
                {
                  default: () =>
                    h(
                      DropdownMenuItem,
                      { asChild: true },
                      {
                        default: () =>
                          h(AiAskButton, { text: 'Ask AI', showShortcut: !isMobile.value }),
                      }
                    ),
                }
              ),
              h(Separator, { orientation: 'horizontal' }),
              h(
                ButtonGroup,
                {},
                {
                  default: () =>
                    h(
                      DropdownMenuItem,
                      { asChild: true },
                      {
                        default: () =>
                          h(DeleteNodeButton, { text: 'Delete', showShortcut: !isMobile.value }),
                      }
                    ),
                }
              ),
            ],
          }
        ),
    }
  )
}

const renderMoreActionsDropdown = (editorProp: Editor | null) => {
  return h(
    DropdownMenu,
    { modal: true },
    {
      default: () => [
        h(
          DropdownMenuTrigger,
          { asChild: true },
          {
            default: () =>
              h(
                Button,
                { 'data-style': 'ghost', 'data-appearance': 'subdued' },
                {
                  default: () => h(MoreVerticalIcon, { class: 'tiptap-button-icon' }),
                }
              ),
          }
        ),
        h(
          DropdownMenuContent,
          { portal: true },
          {
            default: () => renderDropdownMenuActions(editorProp),
          }
        ),
      ],
    }
  )
}

const renderToolbarViewButton = (
  view: ToolbarViewType,
  isMobileProp: boolean,
  onViewChange: (viewId: ToolbarViewId) => void
) => {
  const viewIdLocal = view.id as Exclude<ToolbarViewId, typeof TOOLBAR_VIEWS.MAIN>

  if (isMobileProp) {
    return view.mobileButton
      ? view.mobileButton(() => onViewChange(viewIdLocal))
      : h(Button, { onClick: () => onViewChange(viewIdLocal) }, { default: () => view.icon })
  }

  return view.desktopComponent || null
}

const renderToolbarViewsGroup = (
  toolbarViewsProp: ToolbarViewRegistry,
  isMobileProp: boolean,
  onViewChange: (viewId: ToolbarViewId) => void,
  editorProp: Editor | null
) => {
  const visibleViews = Object.values(toolbarViewsProp).filter((view) => {
    if (!view.shouldShow) return true
    return view.shouldShow(editorProp)
  })

  if (visibleViews.length === 0) return null

  return [
    ...visibleViews.map((view) =>
      renderToolbarViewButton(view, isMobileProp, onViewChange)
    ),
    h(ToolbarSeparator),
  ]
}

const renderMainToolbarContent = (
  editorProp: Editor | null,
  isMobileProp: boolean,
  toolbarViewsProp: ToolbarViewRegistry,
  onViewChange: (viewId: ToolbarViewId) => void
) => {
  const hasSelection = hasTextSelection(editorProp)
  const hasContent = (editorProp?.getText().length ?? 0) > 0

  return [
    h(
      ToolbarGroup,
      {},
      {
        default: () => [
          h(SlashCommandTriggerButton),
          renderMoreActionsDropdown(editorProp),
          h(ToolbarSeparator),
        ],
      }
    ),
    (hasSelection || hasContent) && [
      h(
        ToolbarGroup,
        {},
        {
          default: () => h(ImproveDropdown, { portal: true, hideWhenUnavailable: true }),
        }
      ),
      h(ToolbarSeparator),
      renderFormattingGroup(),
      renderToolbarViewsGroup(toolbarViewsProp, isMobileProp, onViewChange, editorProp),
      h(ImageNodeFloating),
      renderScriptGroup(),
      renderAlignmentGroup(),
      h(
        ToolbarGroup,
        {},
        {
          default: () => [h(ImageUploadButton, { text: 'Add' }), h(ToolbarSeparator)],
        }
      ),
    ],
    h(
      ToolbarGroup,
      {},
      {
        default: () => [
          h(MoveNodeButton, { direction: 'down' }),
          h(MoveNodeButton, { direction: 'up' }),
        ],
      }
    ),
  ]
}

const renderSpecializedToolbarContent = (
  view: ToolbarViewType,
  onBack: () => void
) => {
  return [
    h(
      ToolbarGroup,
      {},
      {
        default: () =>
          h(
            Button,
            { 'data-style': 'ghost', onClick: onBack },
            {
              default: () => [h(ArrowLeftIcon, { class: 'tiptap-button-icon' }), view.icon],
            }
          ),
      }
    ),
    h(ToolbarSeparator),
    view.content,
  ]
}
</script>

<template>
  <Toolbar
    v-if="isMobile && editor && editor.isEditable"
    ref="toolbarRef"
    :style="{
      bottom: isMobile ? `calc(100% - ${windowSize.height - rect.y}px)` : undefined,
    }"
  >
    <component
      :is="
        () =>
          isMainView
            ? renderMainToolbarContent(editor, isMobile, toolbarViews, showView)
            : currentView
              ? renderSpecializedToolbarContent(currentView, showMainView)
              : null
      "
    />
  </Toolbar>
</template>
