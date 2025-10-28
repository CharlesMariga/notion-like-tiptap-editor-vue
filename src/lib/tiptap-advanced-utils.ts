import type { Editor } from "@tiptap/vue-3";
import { findNodePosition, isValidPosition } from "./tiptap-utils";
import type { Node } from "@tiptap/pm/model";

/**
 * Helper function to check if there's content above the current position
 */
export function hasContentAbove(editor: Editor | null): {
  hasContent: boolean;
  content: string;
} {
  if (!editor) return { hasContent: false, content: "" };

  const { state } = editor;
  const { $from } = state.selection;

  for (let i = $from.index(0) - 1; i >= 0; i--) {
    const node = state.doc.child(i);
    const content = node.textContent.trim();

    if (content) {
      return { hasContent: true, content };
    }
  }

  return { hasContent: false, content: "" };
}

/**
 * Finds the position of a node in the editor selection
 * @param params Object containing editor, node (optional), and nodePos (optional)
 * @returns The position of the node in the selection or null if not found
 */
export function findSelectionPosition(params: {
  editor: Editor;
  node?: Node | null;
  nodePos?: number | null;
}): number | null {
  const { editor, node, nodePos } = params;

  if (isValidPosition(nodePos)) return nodePos;

  if (node) {
    const found = findNodePosition({ editor, node });
    if (found) return found.pos;
  }

  const { selection } = editor.state;
  if (!selection.empty) return null;

  const resolvedPos = selection.$anchor;
  const nodeDepth = 1;
  const selectedNode = resolvedPos.node(nodeDepth);

  return selectedNode ? resolvedPos.before(nodeDepth) : null;
}
