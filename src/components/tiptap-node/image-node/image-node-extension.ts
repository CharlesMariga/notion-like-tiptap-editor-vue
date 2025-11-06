import { VueNodeViewRenderer } from "@tiptap/vue-3"
import type { ImageOptions } from "@tiptap/extension-image"
import { Image as TiptapImage } from "@tiptap/extension-image"
import ImageNodeView from "./image-node-view.vue"

export const Image = TiptapImage.extend<ImageOptions>({
  addAttributes() {
    return {
      ...this.parent?.(),
      "data-align": {
        default: null,
      },
    }
  },

  addNodeView() {
    return VueNodeViewRenderer(ImageNodeView as any, {
      stopEvent: (props) => {
        if (/dragstart|dragover|dragend|drop/.test(props.event.type))
          return false
        return !/mousedown|drag|drop/.test(props.event.type)
      },
    })
  },
})

export default Image
