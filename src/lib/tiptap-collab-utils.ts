import type { Editor } from "@tiptap/vue-3";

export const TIPTAP_AI_APP_ID = import.meta.env.VITE_TIPTAP_AI_APP_ID || "";

export const TIPTAP_AI_TOKEN = import.meta.env.VITE_TIPTAP_AI_TOKEN || "";

/**
 * Determines if an element is overflowing its container (top or bottom)
 * @param element The element to check
 * @param container The container to check overflow within
 * @returns "top" if element is above visible area, "bottom" if below, null if visible
 */
export function getElementOverflowPosition(
  element: HTMLElement,
  container: HTMLElement
): "top" | "bottom" | null {
  const elementRect = element.getBoundingClientRect();
  const containerRect = container.getBoundingClientRect();

  // Element is above the visible area
  if (elementRect.top < containerRect.top) {
    return "top";
  }

  // Element is below the visible area
  if (elementRect.bottom > containerRect.bottom) {
    return "bottom";
  }

  // Element is fully visible
  return null;
}

/**
 * Checks if the current selection in the editor is valid for showing UI
 * @param editor The Tiptap editor instance
 * @returns True if the selection is valid (non-empty and editable)
 */
export function isSelectionValid(editor: Editor | null): boolean {
  if (!editor || !editor.isEditable) {
    return false;
  }

  const { state } = editor;
  const { selection } = state;
  const { empty, from, to } = selection;

  // Selection must not be empty
  if (empty) {
    return false;
  }

  // Selection must have different from and to positions
  if (from === to) {
    return false;
  }

  return true;
}

/**
 * Gets the bounding rectangle of the current selection
 * @param editor The Tiptap editor instance
 * @returns DOMRect of the selection, or null if no valid selection
 */
export function getSelectionBoundingRect(
  editor: Editor | null
): DOMRect | null {
  if (!editor) {
    return null;
  }

  const { state, view } = editor;
  const { selection } = state;
  const { from, to } = selection;

  // Get the DOM coordinates for the selection
  const start = view.coordsAtPos(from);
  const end = view.coordsAtPos(to);

  if (!start || !end) {
    return null;
  }

  // Create a DOMRect-like object for the selection range
  const top = Math.min(start.top, end.top);
  const bottom = Math.max(start.bottom, end.bottom);
  const left = Math.min(start.left, end.left);
  const right = Math.max(start.right, end.right);

  return new DOMRect(left, top, right - left, bottom - top);
}
