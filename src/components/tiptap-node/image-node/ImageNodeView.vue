<script setup lang="ts">
import type { Editor, NodeViewProps } from "@tiptap/vue-3";
import { NodeViewWrapper } from "@tiptap/vue-3";
import { ref, onMounted, onUnmounted, computed } from "vue";
import "./image-node-view.scss";

export interface ResizeParams {
  handleUsed: "left" | "right";
  initialWidth: number;
  initialClientX: number;
}

interface Props {
  editor: Editor;
  node: NodeViewProps["node"];
  updateAttributes: (attrs: Record<string, any>) => void;
}

const props = defineProps<Props>();

const resizeParams = ref<ResizeParams | undefined>(undefined);
const width = ref<number | undefined>(props.node.attrs.width);
const showHandles = ref<boolean>(false);

const wrapperRef = ref<HTMLDivElement | null>(null);
const leftResizeHandleRef = ref<HTMLDivElement | null>(null);
const rightResizeHandleRef = ref<HTMLDivElement | null>(null);
const imageRef = ref<HTMLImageElement | null>(null);

const src = computed(() => props.node.attrs.src);
const alt = computed(() => props.node.attrs.alt || "");
const align = computed(() => props.node.attrs["data-align"] || "left");
const minWidth = 96;
const maxWidth = 800;

const windowMouseMoveHandler = (event: MouseEvent): void => {
  if (!resizeParams.value || !props.editor) {
    return;
  }

  let newWidth: number;

  if (align.value === "center") {
    if (resizeParams.value.handleUsed === "left") {
      newWidth =
        resizeParams.value.initialWidth +
        (resizeParams.value.initialClientX - event.clientX) * 2;
    } else {
      newWidth =
        resizeParams.value.initialWidth +
        (event.clientX - resizeParams.value.initialClientX) * 2;
    }
  } else {
    if (resizeParams.value.handleUsed === "left") {
      newWidth =
        resizeParams.value.initialWidth +
        resizeParams.value.initialClientX -
        event.clientX;
    } else {
      newWidth =
        resizeParams.value.initialWidth +
        event.clientX -
        resizeParams.value.initialClientX;
    }
  }

  const effectiveMinWidth = minWidth;
  const effectiveMaxWidth =
    props.editor.view.dom?.firstElementChild?.clientWidth || maxWidth;

  const newCalculatedWidth = Math.min(
    Math.max(newWidth, effectiveMinWidth),
    effectiveMaxWidth
  );

  width.value = newCalculatedWidth;
  if (wrapperRef.value) {
    wrapperRef.value.style.width = `${newCalculatedWidth}px`;
  }
};

const windowMouseUpHandler = (event: MouseEvent): void => {
  if (!props.editor) {
    return;
  }

  if (
    (!event.target ||
      !wrapperRef.value?.contains(event.target as Node) ||
      !props.editor.isEditable) &&
    showHandles.value
  ) {
    showHandles.value = false;
  }

  if (!resizeParams.value) {
    return;
  }

  resizeParams.value = undefined;

  if (width.value !== undefined) {
    props.updateAttributes({ width: width.value });
  }
};

const leftResizeHandleMouseDownHandler = (event: MouseEvent): void => {
  event.preventDefault();

  resizeParams.value = {
    handleUsed: "left",
    initialWidth: wrapperRef.value?.clientWidth || Number.MAX_VALUE,
    initialClientX: event.clientX,
  };
};

const rightResizeHandleMouseDownHandler = (event: MouseEvent): void => {
  event.preventDefault();

  resizeParams.value = {
    handleUsed: "right",
    initialWidth: wrapperRef.value?.clientWidth || Number.MAX_VALUE,
    initialClientX: event.clientX,
  };
};

const wrapperMouseEnterHandler = (): void => {
  if (props.editor && props.editor.isEditable) {
    showHandles.value = true;
  }
};

const wrapperMouseLeaveHandler = (event: MouseEvent): void => {
  if (
    event.relatedTarget === leftResizeHandleRef.value ||
    event.relatedTarget === rightResizeHandleRef.value
  ) {
    return;
  }

  if (resizeParams.value) {
    return;
  }

  if (props.editor && props.editor.isEditable) {
    showHandles.value = false;
  }
};

onMounted(() => {
  window.addEventListener("mousemove", windowMouseMoveHandler);
  window.addEventListener("mouseup", windowMouseUpHandler);
});

onUnmounted(() => {
  window.removeEventListener("mousemove", windowMouseMoveHandler);
  window.removeEventListener("mouseup", windowMouseUpHandler);
});
</script>

<template>
  <NodeViewWrapper
    :data-align="align"
    :data-width="width"
    class="tiptap-image"
    :contenteditable="false"
    @mouseenter="wrapperMouseEnterHandler"
    @mouseleave="wrapperMouseLeaveHandler"
  >
    <div
      ref="wrapperRef"
      class="tiptap-image-container"
      :style="{
        width: width ? `${width}px` : 'fit-content',
      }"
    >
      <div class="tiptap-image-content">
        <img
          ref="imageRef"
          :src="src"
          :alt="alt"
          class="tiptap-image-img"
          :contenteditable="false"
          :draggable="false"
          :style="{ pointerEvents: 'none' }"
        />

        <template v-if="showHandles && editor && editor.isEditable">
          <div
            ref="leftResizeHandleRef"
            class="tiptap-image-handle tiptap-image-handle-left"
            @mousedown="leftResizeHandleMouseDownHandler"
          />
          <div
            ref="rightResizeHandleRef"
            class="tiptap-image-handle tiptap-image-handle-right"
            @mousedown="rightResizeHandleMouseDownHandler"
          />
        </template>
      </div>
    </div>
  </NodeViewWrapper>
</template>

<style lang="scss">
@use "./image-node-view.scss";
</style>
