# Tiptap Vue Editor

A **production-ready** Vue 3 + TypeScript port of a Notion-like rich text editor built with Tiptap. This project demonstrates a complete, feature-rich editor with real-time collaboration, AI-powered text improvements, drag-and-drop block reordering, and extensive formatting options.

🎉 **Status: 100% Feature Complete!** All features from the React reference implementation have been successfully ported to Vue.

## Features

### ✨ Rich Text Editing
- **Text Formatting**: Bold, italic, underline, strikethrough, code, subscript, superscript
- **Headings**: H1-H6 with anchor link support
- **Lists**: Bullet lists, numbered lists, task lists with checkboxes
- **Block Types**: Blockquotes, code blocks, horizontal rules
- **Text Alignment**: Left, center, right, justify
- **Colors**: Text colors and highlights with recent colors tracking
- **Links**: Link editor with popover interface
- **Images**: Upload, resize, align, and download images
- **Math Equations**: LaTeX support with mathematics extension
- **Emoji**: Inline emoji picker with search (`:emoji`)
- **Mentions**: User mentions with autocomplete (`@mention`)

### 🚀 Advanced Features
- **Slash Commands**: Quick block insertion with `/` key
- **Drag Handles**: Reorder blocks via drag-and-drop
- **Floating Toolbar**: Context-sensitive toolbar on text selection
- **Mobile Toolbar**: Touch-optimized controls for mobile devices
- **AI Integration**: Text improvement suggestions (requires Tiptap Pro)
- **Real-time Collaboration**: Multi-user editing with Yjs + TiptapCollabProvider
- **Theme Toggle**: Dark/light mode with CSS variables
- **Keyboard Shortcuts**: Comprehensive keyboard support with visual hints

### 🎨 UI Components
- **35 UI Components**: Fully functional editor components
- **74 Icon Components**: Complete icon set
- **16 Primitive Components**: Reusable UI building blocks using Radix Vue
- **8 Custom Node Extensions**: Enhanced Tiptap nodes with custom styling

## Quick Start

### Prerequisites
- Node.js 18+ and npm
- (Optional) Tiptap Pro token for AI features
- (Optional) Tiptap Cloud credentials for collaboration
- (Optional) Supabase project for image uploads

### Installation

```bash
# Clone the repository
git clone <repository-url>
cd tiptap-vue-editor

# Install dependencies
npm install

# Start development server
npm run dev
```

The editor will be available at `http://localhost:5173/` (or the next available port).

### Build for Production

```bash
# Type check and build
npm run build

# Preview production build
npm run preview
```

## Configuration

### Environment Variables

Create a `.env` file in the project root:

```bash
# Tiptap Cloud (collaboration & AI) - Optional
VITE_TIPTAP_COLLAB_DOC_PREFIX=orbiter
VITE_TIPTAP_COLLAB_APP_ID=<your-app-id>
VITE_TIPTAP_COLLAB_TOKEN=<jwt-token>
VITE_TIPTAP_AI_APP_ID=<your-app-id>
VITE_TIPTAP_AI_TOKEN=<jwt-token>

# Supabase (image storage) - Optional
VITE_SUPABASE_URL=<your-supabase-url>
VITE_SUPABASE_ANON_KEY=<your-key>
```

### Tiptap Pro Setup

For AI features and Tiptap Cloud collaboration, configure `.npmrc`:

```
@tiptap-pro:registry=https://registry.tiptap.dev/
//registry.tiptap.dev/:_authToken=${TIPTAP_PRO_TOKEN}
```

Set the `TIPTAP_PRO_TOKEN` environment variable with your Tiptap Pro authentication token.

**Note:** The editor works perfectly without these credentials, with graceful fallbacks:
- Collaboration features work in offline mode
- AI menu buttons are hidden when tokens are unavailable
- Images can be inserted via URLs without Supabase

## Architecture

### Project Structure

```
src/
├── components/
│   ├── tiptap-extension/          # Custom Tiptap extensions (1)
│   ├── tiptap-node/               # Custom node types with styling (8)
│   ├── tiptap-ui/                 # Editor UI components (35)
│   ├── tiptap-ui-primitive/       # Base primitives (16)
│   ├── tiptap-ui-utils/           # Utility components
│   ├── tiptap-icons/              # Icon components (74)
│   └── tiptap-templates/          # Complete editor templates (1)
├── composables/                   # Vue composables (33)
├── contexts/                      # Provide/inject context (4)
├── lib/                           # Utilities and helpers
└── styles/                        # Global SCSS variables
```

### Component Hierarchy

**3-Tier System:**

1. **Primitives** (16 components)
   - Base UI building blocks using Radix Vue
   - Examples: Button, Dropdown, Popover, Tooltip, Menu, Combobox, Sidebar

2. **UI Components** (35 components)
   - Editor-specific features built on primitives
   - Examples: ColorPicker, LinkPopover, EmojiMenu, MarkButton, DragContextMenu

3. **Templates** (1 complete template)
   - Full editor implementations
   - NotionEditor: Complete Notion-style editor with all features

### State Management

**4 Context Providers** (using Vue's provide/inject):

1. **UserContext** - User identity with avatars and localStorage persistence
2. **AiContext** - AI token management and feature availability
3. **CollabContext** - Real-time collaboration via Yjs + TiptapCollabProvider
4. **AppContext** - Global UI state for threads and comments

### Custom Extensions

**UI State Extension** (`tiptap-extension/ui-state-extension.ts`):
- Manages UI state within Tiptap editor
- Tracks active menus, floating elements, drag state
- Commands for showing/hiding UI elements

**Custom Nodes** (8 types with SCSS):
- Blockquote, CodeBlock, Heading, HorizontalRule
- Image (with alignment and resizing)
- ImageUpload (with drag-and-drop and progress)
- List (Bullet, Ordered, Task with custom styling)
- Paragraph

## Development

### Key Technologies

- **Vue 3** - Composition API with `<script setup>` syntax
- **TypeScript** - Strict type checking enabled
- **Vite** - Fast build tool with HMR
- **Tiptap** - Headless editor framework
- **Radix Vue** - Accessible component primitives
- **SCSS** - Styling with CSS modules
- **Yjs** - CRDT for real-time collaboration

### Vue Conversion Patterns

This project demonstrates best practices for porting React to Vue:

1. **React Context → Vue provide/inject**
   - Context providers → `provide*Context()` functions
   - Context consumers → `use*()` composables

2. **React Hooks → Vue Composables**
   - `useState` → `ref` / `reactive`
   - `useEffect` → `watch` / `watchEffect` / lifecycle hooks
   - `useMemo` → `computed`
   - Custom hooks → Composables in `composables/` directory

3. **Radix UI React → Radix Vue**
   - Same component hierarchy, Vue-specific bindings
   - Adapted event handling and prop passing

### Code Quality

The project maintains high code quality standards:

- ✅ **0 TypeScript errors** - Strict mode enabled
- ✅ **0 unused imports** - Clean codebase with no dead code
- ✅ **Type-safe** - Full TypeScript coverage across all components
- ✅ **Production-ready** - Optimized builds with code splitting

### Bundle Size

Production build with optimized code splitting:

```
dist/assets/tiptap-extensions.js    875.54 kB │ gzip: 185.19 kB
dist/assets/index.js                517.62 kB │ gzip: 142.66 kB
dist/assets/tiptap-core.js          355.91 kB │ gzip: 115.44 kB
dist/assets/radix-ui.js              96.12 kB │ gzip:  29.05 kB
dist/assets/collab.js                70.21 kB │ gzip:  21.00 kB
```

**Optimizations:**
- Manual chunk splitting for better caching
- Vendor code separated from application code
- Logical grouping of related libraries
- Bundle analyzer included (`dist/stats.html`)

## Testing

### Manual Testing Checklist

**Text Formatting:**
- [ ] Bold, italic, underline, strikethrough
- [ ] Code, subscript, superscript
- [ ] Headings H1-H6
- [ ] Text colors and highlights

**Block Types:**
- [ ] Paragraphs, blockquotes, code blocks
- [ ] Bullet lists, numbered lists, task lists
- [ ] Horizontal rules

**Advanced Features:**
- [ ] Slash commands (`/` key)
- [ ] Emoji picker (`:emoji`)
- [ ] Mentions (`@username`)
- [ ] Image upload and manipulation
- [ ] Drag handles for block reordering
- [ ] Floating toolbar on text selection
- [ ] Link editor popover

**UI/UX:**
- [ ] Keyboard shortcuts work correctly
- [ ] Theme toggle (dark/light mode)
- [ ] Mobile toolbar on small screens
- [ ] Drag context menu with all actions

**Collaboration (if configured):**
- [ ] Multiple users can edit simultaneously
- [ ] User cursors visible with colors
- [ ] Changes sync in real-time

## Comparison with React Version

This Vue port maintains **100% feature parity** with the React reference implementation located in the `example/` directory.

### What's Preserved
- ✅ Identical component hierarchy and naming
- ✅ Exact SCSS styles (copied 1:1)
- ✅ Same business logic and behavior
- ✅ Equivalent props and events where possible
- ✅ Same TypeScript interfaces

### Vue-Specific Adaptations
- Event handling: Vue `emit` vs React callbacks
- Refs: Vue `ref` with `.value` vs React `useRef`
- Reactivity: Vue's reactivity system vs React's useState
- Templates: Vue SFCs vs React JSX/TSX
- Composition: Vue `<script setup>` vs React hooks

## Reference Implementation

The React version is available in the `example/` directory and can be run for comparison:

```bash
cd example
npm install
npm run dev
```

React version runs on `http://localhost:5173/` (or next available port).

## Contributing

When contributing to this project:

1. Maintain feature parity with the React version in `example/`
2. Follow Vue 3 Composition API best practices
3. Use TypeScript with strict type checking
4. Keep SCSS styles identical to React version
5. Write clean, documented code with no unused imports
6. Test all features before submitting

## Documentation

- **CLAUDE.md** - Detailed project overview and porting guidelines for AI assistants
- **Project Structure** - See `src/` directory organization above
- **React Reference** - Check `example/src/` for React implementation

## License

[Your License Here]

## Acknowledgments

- **Tiptap** - Excellent headless editor framework
- **Radix Vue** - Accessible component primitives
- **Vue.js Team** - Amazing framework and developer experience
- **React Reference Implementation** - Original design and architecture

---

**Built with ❤️ using Vue 3, TypeScript, and Tiptap**
