// Main component
export { default as AiMenu } from "./AiMenu.vue"

// Sub-components
export { default as AiMenuInput } from "./ai-menu-input/AiMenuInput.vue"
export { default as AiMenuItems } from "./ai-menu-items/AiMenuItems.vue"
export { default as AiMenuActions } from "./ai-menu-actions/AiMenuActions.vue"

// Types
export * from "./ai-menu-types"
export * from "./ai-menu-items/ai-menu-items-types"
export * from "./ai-menu-items/ai-menu-items-constants"
export * from "./ai-menu-input/ai-menu-input-types"

// Utils
export * from "./ai-menu-utils"

// Composables (re-export from composables directory)
export {
  useAiMenuState,
  useAiMenuStateProvider,
  useAiContentTracker,
  useTextSelectionTracker,
} from "@/composables/useAiMenu"
