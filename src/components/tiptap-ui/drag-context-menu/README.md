# DragContextMenu Component

## Status: BLOCKED - Missing Dependencies

The DragContextMenu component is one of the most complex components in the Tiptap editor. It provides a context menu for the drag handle that appears next to blocks, allowing users to:

- Transform blocks (turn into heading, list, etc.)
- Apply colors (text color, highlight)
- Duplicate, copy, delete blocks
- Copy anchor links
- Download images
- Reset formatting
- AI actions (when available)

## Missing Primitive Components

The following primitive components need to be ported before DragContextMenu can be implemented:

### 1. Menu Component
**Location:** `src/components/tiptap-ui-primitive/menu/`
**React Source:** `example/src/components/tiptap-ui-primitive/menu/`

This is a complex component built on Ariakit's Menu component. It provides:
- Menu container with trigger
- MenuContent with portal support
- MenuItem with custom render props
- MenuButton
- MenuGroup and MenuGroupLabel
- Submenu support with placement options

### 2. Combobox Component
**Location:** `src/components/tiptap-ui-primitive/combobox/`
**React Source:** `example/src/components/tiptap-ui-primitive/combobox/`

Built on Ariakit's Combobox, provides:
- Combobox container
- ComboboxList for rendering items
- Search/filter functionality

### 3. Spacer Component
**Location:** `src/components/tiptap-ui-primitive/spacer/`
**React Source:** `example/src/components/tiptap-ui-primitive/spacer/`

Simple flex spacer component for layout.

## Additional Dependencies

### Tiptap Extension
- `@tiptap/extension-drag-handle-react` needs Vue equivalent
- Or use `@tiptap/extension-drag-handle-vue` if available

### Hook Dependencies
The following composables are needed (some already exist):
- ✅ `useTiptapEditor`
- ✅ `useUiEditorState`
- ✅ `useDuplicate`
- ✅ `useCopyToClipboard`
- ✅ `useDeleteNode`
- ✅ `useCopyAnchorLink`
- ✅ `useResetAllFormatting`
- ✅ `useColorText`
- ✅ `useColorHighlight`
- ✅ `useText`
- ✅ `useHeading`
- ✅ `useList`
- ✅ `useBlockquote`
- ✅ `useCodeBlock`
- ✅ `useImageDownload`
- ❌ `useAiAsk` (AI feature, can be skipped initially)
- ❌ `useIsMobile` (needs porting)
- ❌ `useRecentColors` (needs porting)

### UI Component Dependencies
All of these already exist:
- ✅ SlashCommandTriggerButton
- ✅ Button, ButtonGroup
- ✅ Separator
- ✅ All icon components

## Implementation Plan

### Phase 1: Port Missing Primitives
1. Port Menu component from Ariakit React to Radix Vue or similar
2. Port Combobox component
3. Create Spacer component (trivial)

### Phase 2: Port Missing Composables
1. `useIsMobile` - detects mobile viewport
2. `useRecentColors` - localStorage-based recent color tracking

### Phase 3: Implement DragContextMenu
Once all dependencies are ready:
1. Create sub-components:
   - BaseMenuItem
   - SubMenuTrigger
   - TextColorMenuItem
   - HighlightColorMenuItem
   - RecentColorMenuItem
   - ColorActionGroup
   - TransformActionGroup
   - ResetFormattingAction
   - ImageActionGroup
   - CoreActionGroup
   - AIActionGroup (optional)
   - DeleteActionGroup

2. Create main DragContextMenu component with:
   - DragHandle integration
   - Dynamic positioning with floating-ui
   - Node selection handling
   - Menu state management
   - All action groups

## Component Structure

```
drag-context-menu/
├── README.md (this file)
├── drag-context-menu-types.ts ✅
├── DragContextMenu.vue ❌ (blocked)
├── index.ts ❌ (blocked)
└── composables:
    └── useDragContextMenu.ts ✅
```

## References

- React implementation: `example/src/components/tiptap-ui/drag-context-menu/drag-context-menu.tsx`
- Type definitions: `drag-context-menu-types.ts` ✅
- Hooks: `drag-context-menu-hooks.ts` (ported to `useDragContextMenu.ts`) ✅
