export const TIPTAP_AI_APP_ID = import.meta.env.VITE_TIPTAP_AI_APP_ID || "";

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
