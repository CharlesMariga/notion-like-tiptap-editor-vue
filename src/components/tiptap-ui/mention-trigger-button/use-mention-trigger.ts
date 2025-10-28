import type { Editor } from "@tiptap/vue-3";
import {
  findNodePosition,
  isNodeTypeSelected,
  isValidPosition,
} from "../../../lib/tiptap-utils";
import type { Node } from "@tiptap/pm/model";

/**
 * Checks if a mention can be inserted in the current editor state
 */
export function canInsertMention(
  editor: Editor | null,
  node?: Node | null,
  nodePos?: number | null
): boolean {
  if (!editor || !editor.isEditable) return false;
  if (isNodeTypeSelected(editor, ["image"])) return false;

  if (node || isValidPosition(nodePos)) {
    if (isValidPosition(nodePos) && nodePos! >= 0) return true;

    if (node) {
      const foundPos = findNodePosition({ editor, node });
      return foundPos !== null;
    }
  }

  return true;
}

/**
 * Inserts a trigger in a block node at a specified position or after the current selection
 */
function insertTriggerInBlockNode(
  editor: Editor,
  trigger: string,
  node?: Node | null,
  nodePos?: number | null
): boolean {
  if ((node !== undefined && node !== null) || isValidPosition(nodePos)) {
    const foundPos = findNodePosition({
      editor,
      node: node || undefined,
      nodePos: nodePos || undefined,
    });

    if (!foundPos) {
      return false;
    }

    const isEmpty =
      foundPos.node.type.name === "paragraph" &&
      foundPos.node.content.size === 0;
    const insertPos = isEmpty
      ? foundPos.pos
      : foundPos.pos + foundPos.node.nodeSize;

    const triggerLength = trigger.length + 1; // +1 for the space after the trigger
    const focusPos = isEmpty
      ? foundPos.pos + triggerLength
      : foundPos.pos + foundPos.node.nodeSize + triggerLength;

    return editor
      .chain()
      .insertContentAt(isEmpty ? foundPos.pos : insertPos, {
        type: "paragraph",
        content: [{ type: "text", text: trigger }],
      })
      .focus(focusPos)
      .run();
  }

  const { $from } = editor.state.selection;

  return editor
    .chain()
    .insertContentAt($from.after(), {
      type: "paragraph",
      content: [{ type: "text", text: trigger }],
    })
    .focus()
    .run();
}

/**
 * Inserts a trigger in a text node at the current selection
 */
function insertTriggerInTextNode(
  editor: Editor,
  trigger: string,
  node?: Node | null,
  nodePos?: number | null
): boolean {
  if ((node !== undefined && node !== null) || isValidPosition(nodePos)) {
    const foundPos = findNodePosition({
      editor,
      node: node || undefined,
      nodePos: nodePos || undefined,
    });

    if (!foundPos) {
      return false;
    }

    const isEmpty =
      foundPos.node.type.name === "paragraph" &&
      foundPos.node.content.size === 0;
    const insertPos = isEmpty
      ? foundPos.pos
      : foundPos.pos + foundPos.node.nodeSize;

    editor.view.dispatch(
      editor.view.state.tr
        .scrollIntoView()
        .insertText(trigger, insertPos, insertPos)
    );

    const triggerLength = trigger.length + 1; // +1 for the space after the trigger
    const focusPos = isEmpty
      ? foundPos.pos + triggerLength
      : foundPos.pos + foundPos.node.nodeSize + triggerLength;
    editor.commands.focus(focusPos);

    return true;
  }

  const { $from } = editor.state.selection;
  const currentNode = $from.node();
  const hasContentBefore =
    $from.parentOffset > 0 &&
    currentNode.textContent[$from.parentOffset - 1] !== " ";

  return editor
    .chain()
    .insertContent({
      type: "text",
      text: hasContentBefore ? ` ${trigger}` : trigger,
    })
    .focus()
    .run();
}

/**
 * Adds a mention trigger at the current selection or specified node position
 */
export function addMentionTrigger(
  editor: Editor | null,
  trigger: string = "@",
  node?: Node | null,
  nodePos?: number | null
): boolean {
  if (!editor || !editor.isEditable) return false;
  if (!canInsertMention(editor, node, nodePos)) return false;

  try {
    const { $from } = editor.state.selection;
    const currentNode = $from.node();
    const isBlockNode = currentNode.isBlock && !currentNode.isTextblock;

    if (isBlockNode) {
      return insertTriggerInBlockNode(editor, trigger, node, nodePos);
    }

    return insertTriggerInTextNode(editor, trigger, node, nodePos);
  } catch {
    return false;
  }
}
