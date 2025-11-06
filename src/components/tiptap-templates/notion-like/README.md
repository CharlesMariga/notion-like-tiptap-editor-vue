# NotionEditor Template

A complete, production-ready Notion-like rich text editor template for Vue 3, ported from the React reference implementation.

## Overview

This template provides a fully-featured rich text editor with real-time collaboration, similar to Notion's editing experience. It integrates all previously ported Tiptap extensions, UI components, and primitives into a cohesive editor interface.

## Components Created

### 1. **NotionEditor.vue** (Main Component)
The primary editor component that assembles all features and extensions.

**Key Features:**
- Full Tiptap extension integration (StarterKit, Collaboration, Typography, etc.)
- Custom node extensions (Image, ImageUpload, HorizontalRule, etc.)
- Real-time collaboration with Yjs and TiptapCollabProvider
- Emoji picker, mention system, slash commands
- Rich text formatting (bold, italic, underline, strike, code, sub, super)
- Text alignment, colors, highlights
- Task lists, blockquotes, code blocks
- Image upload with Supabase
- Loading state with spinner
- Dark/light theme support

**Props:**
- `room` (required): Unique room ID for collaboration
- `placeholder` (optional): Editor placeholder text (default: "Start writing...")

**Extensions Configured:**
- StarterKit (history disabled, custom dropcursor)
- HorizontalRule (custom node)
- Underline
- TextAlign (heading & paragraph)
- Collaboration + CollaborationCaret (with Yjs)
- Placeholder (with slash command styling)
- Mention
- Emoji (GitHub emojis, filtered)
- Mathematics (LaTeX support)
- Superscript, Subscript
- Color, TextStyle
- TaskList, TaskItem (nested)
- Highlight (multicolor)
- Image (custom node)
- ImageUploadNode (with Supabase upload)
- UniqueID (for anchors)
- Typography
- UiState (custom UI state management)

### 2. **NotionEditorHeader.vue**
Sticky header with editor controls and collaboration features.

**Features:**
- Undo/Redo buttons
- Theme toggle (dark/light mode)
- Collaboration users dropdown
- Separator components for visual organization
- Sticky positioning at top of editor

**Styling:** `notion-like-editor-header.scss`

### 3. **NotionEditorThemeToggle.vue**
Dark/light theme toggle button.

**Features:**
- Automatic detection of system preference
- Persistent theme state
- Smooth icon transition (Sun/Moon)
- Updates `document.documentElement` with `.dark` class

### 4. **NotionEditorCollaborationUsers.vue**
Displays active collaboration users with avatars.

**Features:**
- Avatar group with max 3 visible avatars
- Dropdown menu showing all active users
- Auto-generated avatar images via `getAvatar()` utility
- Fallback to user initials
- Color-coded user identities

### 5. **NotionEditorFloatingToolbar.vue**
Context toolbar that appears on text selection.

**Features:**
- Appears only on desktop (hidden on mobile)
- Auto-positioning with FloatingUI
- Text formatting buttons (bold, italic, strike, code)
- Link popover
- Color text popover
- Turn into dropdown (convert block types)
- Image node floating controls
- Hides during AI generation or commenting

**Visibility Logic:**
- Shows only when text is selected
- Hides when drag handle is locked
- Hides on mobile devices
- Hides during AI operations

### 6. **FloatingElement.vue** (Utility Component)
Reusable floating UI element with smart positioning.

**Location:** `src/components/tiptap-ui-utils/FloatingElement.vue`

**Features:**
- Automatic positioning relative to text selection
- FloatingUI integration (shift, flip, offset)
- Keyboard navigation (Escape to close)
- Focus management (blur handling)
- Mouse interaction handling
- Scroll and resize updates
- Drag event handling

**Props:**
- `editor`: Tiptap editor instance
- `shouldShow`: Control visibility
- `floatingOptions`: Custom FloatingUI options
- `zIndex`: Z-index for stacking (default: 50)
- `updateOnScroll`: Update position on scroll (default: true)
- `closeOnEscape`: Close on Escape key (default: true)
- `getBoundingClientRect`: Custom position calculator

### 7. **Spacer.vue** (Primitive Component)
Flexible spacer for layout.

**Location:** `src/components/tiptap-ui-primitive/spacer/Spacer.vue`

**Props:**
- `orientation`: 'horizontal' | 'vertical' (default: 'horizontal')
- `size`: Custom size (string | number)

## Styles

### notion-like-editor.scss
Main editor stylesheet with:
- Google Fonts import (DM Sans, Inter)
- CSS variables for theming
- Responsive layout (mobile breakpoints)
- Custom scrollbar styling
- Loading spinner animation
- Editor content layout (max-width: 768px)
- Padding and spacing

### notion-like-editor-header.scss
Header-specific styles with:
- Sticky positioning
- Theme-aware colors (light/dark)
- Flexbox layout
- Border styling

## Usage

```vue
<script setup lang="ts">
import { UserProvider } from '@/contexts/user-context'
import { AppProvider } from '@/contexts/app-context'
import { CollabProvider } from '@/contexts/collab-context'
import { AiProvider } from '@/contexts/ai-context'
import { NotionEditor } from '@/components/tiptap-templates/notion-like'

const roomId = 'my-document-123'
</script>

<template>
  <UserProvider>
    <AppProvider>
      <CollabProvider :room="roomId">
        <AiProvider>
          <NotionEditor
            :room="roomId"
            placeholder="Start typing..."
          />
        </AiProvider>
      </CollabProvider>
    </AppProvider>
  </UserProvider>
</template>
```

## Dependencies

### Tiptap Core Extensions
- @tiptap/vue-3
- @tiptap/starter-kit
- @tiptap/extension-mention
- @tiptap/extension-task-list
- @tiptap/extension-color
- @tiptap/extension-text-style
- @tiptap/extension-placeholder
- @tiptap/extension-collaboration
- @tiptap/extension-collaboration-caret
- @tiptap/extension-typography
- @tiptap/extension-highlight
- @tiptap/extension-superscript
- @tiptap/extension-subscript
- @tiptap/extension-text-align
- @tiptap/extension-mathematics
- @tiptap/extension-unique-id
- @tiptap/extension-emoji
- @tiptap/extension-underline

### Custom Extensions (Already Ported)
- HorizontalRule (`src/components/tiptap-node/horizontal-rule-node/`)
- Image (`src/components/tiptap-node/image-node/`)
- ImageUploadNode (`src/components/tiptap-node/image-upload-node/`)
- UiState (`src/components/tiptap-extension/ui-state-extension.ts`)

### UI Components Used
- MarkButton (bold, italic, strike, code)
- LinkPopover
- ColorTextPopover
- TurnIntoDropdown
- EmojiDropdownMenu
- MentionDropdownMenu
- SlashDropdownMenu
- UndoRedoButton
- ImageNodeFloating

### Primitives Used
- Toolbar, ToolbarGroup, ToolbarSeparator
- Button, ButtonGroup
- Avatar, AvatarImage, AvatarFallback, AvatarGroup
- Card, CardBody, CardItemGroup
- Separator
- Spacer
- DropdownMenu, DropdownMenuContentWrapper

### Composables Used
- useTiptapEditor
- useUiEditorState
- useMobile
- useFloatingToolbarVisibility
- useFloatingElement
- useScrollToHash

### Context Providers Required
- UserProvider (user identity)
- AppProvider (app state)
- CollabProvider (collaboration)
- AiProvider (AI features)

## File Structure

```
src/components/tiptap-templates/notion-like/
├── NotionEditor.vue                    # Main editor component
├── NotionEditorHeader.vue              # Sticky header
├── NotionEditorThemeToggle.vue         # Theme toggle button
├── NotionEditorCollaborationUsers.vue  # User avatars dropdown
├── NotionEditorFloatingToolbar.vue     # Selection toolbar
├── notion-like-editor.scss             # Main styles
├── notion-like-editor-header.scss      # Header styles
├── index.ts                            # Barrel exports
└── README.md                           # This file
```

## Configuration

### Environment Variables Required

```bash
# Tiptap Cloud (collaboration)
VITE_TIPTAP_COLLAB_DOC_PREFIX=orbiter
VITE_TIPTAP_COLLAB_APP_ID=<your-app-id>
VITE_TIPTAP_COLLAB_TOKEN=<jwt-token>

# Tiptap AI (optional)
VITE_TIPTAP_AI_APP_ID=<your-app-id>
VITE_TIPTAP_AI_TOKEN=<jwt-token>

# Supabase (image storage)
VITE_SUPABASE_URL=<your-supabase-url>
VITE_SUPABASE_ANON_KEY=<your-key>
```

### .npmrc Configuration

```
@tiptap-pro:registry=https://registry.tiptap.dev/
//registry.tiptap.dev/:_authToken=${TIPTAP_PRO_TOKEN}
```

## Features Included

- [x] Rich text formatting (bold, italic, underline, strike, code)
- [x] Headings (H1-H6)
- [x] Lists (bullet, numbered, task)
- [x] Text alignment (left, center, right, justify)
- [x] Text colors and highlights
- [x] Superscript and subscript
- [x] Blockquotes and code blocks
- [x] Horizontal rules
- [x] Links with popover editor
- [x] Image upload with Supabase
- [x] Emoji picker
- [x] @mention system
- [x] Slash commands (/)
- [x] Math equations (LaTeX)
- [x] Real-time collaboration
- [x] Collaboration user avatars
- [x] Undo/Redo
- [x] Dark/light theme toggle
- [x] Floating toolbar on text selection
- [x] Loading states
- [x] Responsive design
- [x] Keyboard shortcuts

## Features Not Yet Implemented

- [ ] AI-powered text improvement (ImproveDropdown component)
- [ ] Mobile toolbar
- [ ] Drag handles for block reordering
- [ ] AI menu (text generation)
- [ ] Comment threads
- [ ] Drag context menu

## Notes

1. **AI Features**: The AI extension and related components (ImproveDropdown, AiMenu) are commented out as they require the @tiptap-pro/extension-ai package and proper token configuration.

2. **Mobile Support**: The mobile toolbar component is not yet ported. The editor is responsive but lacks mobile-specific controls.

3. **Collaboration**: Requires proper Tiptap Cloud credentials. Gracefully falls back when collaboration is unavailable.

4. **Image Upload**: Uses Supabase for storage. Ensure `uploadImageToSupabase()` is properly configured in `src/lib/supabase.ts`.

5. **Theme**: Theme persistence is handled via `document.documentElement.classList`. You may want to add localStorage persistence.

## Testing

To test the editor:

1. Set up environment variables
2. Configure .npmrc with Tiptap Pro token
3. Install dependencies: `npm install`
4. Run dev server: `npm run dev`
5. Import and use NotionEditor in your app
6. Open multiple browser tabs to test collaboration

## Migration from React

This template was ported from:
`example/src/components/tiptap-templates/notion-like/`

Key conversions:
- React hooks → Vue composables
- React Context → Vue provide/inject
- TSX → Vue SFC (Composition API)
- useEffect → watch/onMounted
- useState → ref/reactive
- React.forwardRef → defineExpose
- createPortal → Teleport (for mobile toolbar)

## Future Enhancements

1. Port AI features (ImproveDropdown, AiMenu, AiAskButton)
2. Add mobile toolbar component
3. Implement drag handles for block reordering
4. Add comment threading system
5. Add drag context menu
6. Implement theme persistence in localStorage
7. Add comprehensive keyboard shortcut documentation
8. Add accessibility improvements (ARIA labels)
9. Add unit tests for components
10. Add E2E tests for collaboration features
