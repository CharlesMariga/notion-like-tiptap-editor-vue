<script setup lang="ts">
import { ref, computed } from "vue"
import type { NodeViewProps } from "@tiptap/vue-3"
import { NodeViewWrapper } from "@tiptap/vue-3"
import Button from "@/components/tiptap-ui-primitive/button/Button.vue"
import CloseIcon from "@/components/tiptap-icons/close-icon.vue"
import "@/components/tiptap-node/image-upload-node/image-upload-node.scss"
import { focusNextNode, isValidPosition } from "@/lib/tiptap-utils"

export interface FileItem {
  /**
   * Unique identifier for the file item
   */
  id: string
  /**
   * The actual File object being uploaded
   */
  file: File
  /**
   * Current upload progress as a percentage (0-100)
   */
  progress: number
  /**
   * Current status of the file upload process
   * @default "uploading"
   */
  status: "uploading" | "success" | "error"

  /**
   * URL to the uploaded file, available after successful upload
   * @optional
   */
  url?: string
  /**
   * Controller that can be used to abort the upload process
   * @optional
   */
  abortController?: AbortController
}

export interface UploadOptions {
  /**
   * Maximum allowed file size in bytes
   */
  maxSize: number
  /**
   * Maximum number of files that can be uploaded
   */
  limit: number
  /**
   * String specifying acceptable file types (MIME types or extensions)
   * @example ".jpg,.png,image/jpeg" or "image/*"
   */
  accept: string
  /**
   * Function that handles the actual file upload process
   * @param {File} file - The file to be uploaded
   * @param {Function} onProgress - Callback function to report upload progress
   * @param {AbortSignal} signal - Signal that can be used to abort the upload
   * @returns {Promise<string>} Promise resolving to the URL of the uploaded file
   */
  upload: (
    file: File,
    onProgress: (event: { progress: number }) => void,
    signal: AbortSignal
  ) => Promise<string>
  /**
   * Callback triggered when a file is uploaded successfully
   * @param {string} url - URL of the successfully uploaded file
   * @optional
   */
  onSuccess?: (url: string) => void
  /**
   * Callback triggered when an error occurs during upload
   * @param {Error} error - The error that occurred
   * @optional
   */
  onError?: (error: Error) => void
}

/**
 * Composable for managing multiple file uploads with progress tracking and cancellation
 */
function useFileUpload(options: UploadOptions) {
  const fileItems = ref<FileItem[]>([])

  const uploadFile = async (file: File): Promise<string | null> => {
    if (file.size > options.maxSize) {
      const error = new Error(
        `File size exceeds maximum allowed (${options.maxSize / 1024 / 1024}MB)`
      )
      options.onError?.(error)
      return null
    }

    const abortController = new AbortController()
    const fileId = crypto.randomUUID()

    const newFileItem: FileItem = {
      id: fileId,
      file,
      progress: 0,
      status: "uploading",
      abortController,
    }

    fileItems.value = [...fileItems.value, newFileItem]

    try {
      if (!options.upload) {
        throw new Error("Upload function is not defined")
      }

      const url = await options.upload(
        file,
        (event: { progress: number }) => {
          fileItems.value = fileItems.value.map((item) =>
            item.id === fileId ? { ...item, progress: event.progress } : item
          )
        },
        abortController.signal
      )

      if (!url) throw new Error("Upload failed: No URL returned")

      if (!abortController.signal.aborted) {
        fileItems.value = fileItems.value.map((item) =>
          item.id === fileId
            ? { ...item, status: "success" as const, url, progress: 100 }
            : item
        )
        options.onSuccess?.(url)
        return url
      }

      return null
    } catch (error) {
      if (!abortController.signal.aborted) {
        fileItems.value = fileItems.value.map((item) =>
          item.id === fileId
            ? { ...item, status: "error" as const, progress: 0 }
            : item
        )
        options.onError?.(
          error instanceof Error ? error : new Error("Upload failed")
        )
      }
      return null
    }
  }

  const uploadFiles = async (files: File[]): Promise<string[]> => {
    if (!files || files.length === 0) {
      options.onError?.(new Error("No files to upload"))
      return []
    }

    if (options.limit && files.length > options.limit) {
      options.onError?.(
        new Error(
          `Maximum ${options.limit} file${options.limit === 1 ? "" : "s"} allowed`
        )
      )
      return []
    }

    // Upload all files concurrently
    const uploadPromises = files.map((file) => uploadFile(file))
    const results = await Promise.all(uploadPromises)

    // Filter out null results (failed uploads)
    return results.filter((url): url is string => url !== null)
  }

  const removeFileItem = (fileId: string) => {
    const fileToRemove = fileItems.value.find((item) => item.id === fileId)
    if (fileToRemove?.abortController) {
      fileToRemove.abortController.abort()
    }
    if (fileToRemove?.url) {
      URL.revokeObjectURL(fileToRemove.url)
    }
    fileItems.value = fileItems.value.filter((item) => item.id !== fileId)
  }

  const clearAllFiles = () => {
    fileItems.value.forEach((item) => {
      if (item.abortController) {
        item.abortController.abort()
      }
      if (item.url) {
        URL.revokeObjectURL(item.url)
      }
    })
    fileItems.value = []
  }

  return {
    fileItems,
    uploadFiles,
    removeFileItem,
    clearAllFiles,
  }
}

interface Props extends NodeViewProps {}

const props = defineProps<Props>()

const accept = computed(() => props.node.attrs.accept)
const limit = computed(() => props.node.attrs.limit)
const maxSize = computed(() => props.node.attrs.maxSize)

const inputRef = ref<HTMLInputElement | null>(null)

const uploadOptions: UploadOptions = {
  get maxSize() {
    return maxSize.value
  },
  get limit() {
    return limit.value
  },
  get accept() {
    return accept.value
  },
  upload: props.extension.options.upload,
  onSuccess: props.extension.options.onSuccess,
  onError: props.extension.options.onError,
}

const { fileItems, uploadFiles, removeFileItem, clearAllFiles } =
  useFileUpload(uploadOptions)

const handleUpload = async (files: File[]) => {
  const urls = await uploadFiles(files)

  if (urls.length > 0) {
    const pos = props.getPos()

    if (isValidPosition(pos)) {
      const imageNodes = urls.map((url, index) => {
        const filename =
          files[index]?.name.replace(/\.[^/.]+$/, "") || "unknown"
        return {
          type: props.extension.options.type,
          attrs: {
            ...props.extension.options,
            src: url,
            alt: filename,
            title: filename,
          },
        }
      })

      props.editor
        .chain()
        .focus()
        .deleteRange({ from: pos, to: pos + props.node.nodeSize })
        .insertContentAt(pos, imageNodes)
        .run()

      focusNextNode(props.editor as any)
    }
  }
}

const handleChange = (e: Event) => {
  const target = e.target as HTMLInputElement
  const files = target.files
  if (!files || files.length === 0) {
    props.extension.options.onError?.(new Error("No file selected"))
    return
  }
  handleUpload(Array.from(files))
}

const handleClick = () => {
  if (inputRef.value && fileItems.value.length === 0) {
    inputRef.value.value = ""
    inputRef.value.click()
  }
}

const hasFiles = computed(() => fileItems.value.length > 0)

const formatFileSize = (bytes: number) => {
  if (bytes === 0) return "0 Bytes"
  const k = 1024
  const sizes = ["Bytes", "KB", "MB", "GB"]
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`
}

// Drag and drop state
const isDragOver = ref(false)
const isDragActive = ref(false)

const handleDragEnter = (e: DragEvent) => {
  e.preventDefault()
  e.stopPropagation()
  isDragActive.value = true
}

const handleDragLeave = (e: DragEvent) => {
  e.preventDefault()
  e.stopPropagation()
  const target = e.currentTarget as HTMLElement
  if (!target.contains(e.relatedTarget as Node)) {
    isDragActive.value = false
    isDragOver.value = false
  }
}

const handleDragOver = (e: DragEvent) => {
  e.preventDefault()
  e.stopPropagation()
  isDragOver.value = true
}

const handleDrop = (e: DragEvent) => {
  e.preventDefault()
  e.stopPropagation()
  isDragActive.value = false
  isDragOver.value = false

  const files = Array.from(e.dataTransfer?.files || [])
  if (files.length > 0) {
    handleUpload(files)
  }
}
</script>

<template>
  <NodeViewWrapper
    class="tiptap-image-upload"
    tabindex="0"
    @click="handleClick"
  >
    <!-- Drag Area when no files -->
    <div
      v-if="!hasFiles"
      :class="[
        'tiptap-image-upload-drag-area',
        { 'drag-active': isDragActive, 'drag-over': isDragOver }
      ]"
      @dragenter="handleDragEnter"
      @dragleave="handleDragLeave"
      @dragover="handleDragOver"
      @drop="handleDrop"
    >
      <!-- Dropzone Content -->
      <div class="tiptap-image-upload-dropzone">
        <!-- File Icon -->
        <svg
          width="43"
          height="57"
          viewBox="0 0 43 57"
          fill="currentColor"
          class="tiptap-image-upload-dropzone-rect-primary"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M0.75 10.75C0.75 5.64137 4.89137 1.5 10 1.5H32.3431C33.2051 1.5 34.0317 1.84241 34.6412 2.4519L40.2981 8.10876C40.9076 8.71825 41.25 9.5449 41.25 10.4069V46.75C41.25 51.8586 37.1086 56 32 56H10C4.89137 56 0.75 51.8586 0.75 46.75V10.75Z"
            fill="currentColor"
            fill-opacity="0.11"
            stroke="currentColor"
            stroke-width="1.5"
          />
        </svg>

        <!-- File Corner Icon -->
        <svg
          width="10"
          height="10"
          class="tiptap-image-upload-dropzone-rect-secondary"
          viewBox="0 0 10 10"
          fill="currentColor"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M0 0.75H0.343146C1.40401 0.75 2.42143 1.17143 3.17157 1.92157L8.82843 7.57843C9.57857 8.32857 10 9.34599 10 10.4069V10.75H4C1.79086 10.75 0 8.95914 0 6.75V0.75Z"
            fill="currentColor"
          />
        </svg>

        <!-- Cloud Upload Icon -->
        <div class="tiptap-image-upload-icon-container">
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            class="tiptap-image-upload-icon"
            fill="currentColor"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M11.1953 4.41771C10.3478 4.08499 9.43578 3.94949 8.5282 4.02147C7.62062 4.09345 6.74133 4.37102 5.95691 4.83316C5.1725 5.2953 4.50354 5.92989 4.00071 6.68886C3.49788 7.44783 3.17436 8.31128 3.05465 9.2138C2.93495 10.1163 3.0222 11.0343 3.3098 11.8981C3.5974 12.7619 4.07781 13.5489 4.71463 14.1995C5.10094 14.5942 5.09414 15.2274 4.69945 15.6137C4.30476 16 3.67163 15.9932 3.28532 15.5985C2.43622 14.731 1.79568 13.6816 1.41221 12.5299C1.02875 11.3781 0.91241 10.1542 1.07201 8.95084C1.23162 7.74748 1.66298 6.59621 2.33343 5.58425C3.00387 4.57229 3.89581 3.72617 4.9417 3.10998C5.98758 2.4938 7.15998 2.1237 8.37008 2.02773C9.58018 1.93176 10.7963 2.11243 11.9262 2.55605C13.0561 2.99968 14.0703 3.69462 14.8919 4.58825C15.5423 5.29573 16.0585 6.11304 16.4177 7.00002H17.4999C18.6799 6.99991 19.8288 7.37933 20.7766 8.08222C21.7245 8.78515 22.4212 9.7743 22.7637 10.9036C23.1062 12.0328 23.0765 13.2423 22.6788 14.3534C22.2812 15.4644 21.5367 16.4181 20.5554 17.0736C20.0962 17.3803 19.4752 17.2567 19.1684 16.7975C18.8617 16.3382 18.9853 15.7172 19.4445 15.4105C20.069 14.9934 20.5427 14.3865 20.7958 13.6794C21.0488 12.9724 21.0678 12.2027 20.8498 11.4841C20.6318 10.7655 20.1885 10.136 19.5853 9.6887C18.9821 9.24138 18.251 8.99993 17.5001 9.00002H15.71C15.2679 9.00002 14.8783 8.70973 14.7518 8.28611C14.4913 7.41374 14.0357 6.61208 13.4195 5.94186C12.8034 5.27164 12.0427 4.75043 11.1953 4.41771Z"
              fill="currentColor"
            />
            <path
              d="M11 14.4142V21C11 21.5523 11.4477 22 12 22C12.5523 22 13 21.5523 13 21V14.4142L15.2929 16.7071C15.6834 17.0976 16.3166 17.0976 16.7071 16.7071C17.0976 16.3166 17.0976 15.6834 16.7071 15.2929L12.7078 11.2936C12.7054 11.2912 12.703 11.2888 12.7005 11.2864C12.5208 11.1099 12.2746 11.0008 12.003 11L12 11L11.997 11C11.8625 11.0004 11.7343 11.0273 11.6172 11.0759C11.502 11.1236 11.3938 11.1937 11.2995 11.2864C11.297 11.2888 11.2946 11.2912 11.2922 11.2936L7.29289 15.2929C6.90237 15.6834 6.90237 16.3166 7.29289 16.7071C7.68342 17.0976 8.31658 17.0976 8.70711 16.7071L11 14.4142Z"
              fill="currentColor"
            />
          </svg>
        </div>
      </div>

      <div class="tiptap-image-upload-content">
        <span class="tiptap-image-upload-text">
          <em>Click to upload</em> or drag and drop
        </span>
        <span class="tiptap-image-upload-subtext">
          Maximum {{ limit }} file{{ limit === 1 ? "" : "s" }}, {{ maxSize / 1024 / 1024 }}MB
          each.
        </span>
      </div>
    </div>

    <!-- File Previews when uploading -->
    <div v-if="hasFiles" class="tiptap-image-upload-previews">
      <div v-if="fileItems.length > 1" class="tiptap-image-upload-header">
        <span>Uploading {{ fileItems.length }} files</span>
        <Button
          type="button"
          data-style="ghost"
          @click.stop="clearAllFiles"
        >
          Clear All
        </Button>
      </div>

      <div
        v-for="fileItem in fileItems"
        :key="fileItem.id"
        class="tiptap-image-upload-preview"
      >
        <div
          v-if="fileItem.status === 'uploading'"
          class="tiptap-image-upload-progress"
          :style="{ width: `${fileItem.progress}%` }"
        />

        <div class="tiptap-image-upload-preview-content">
          <div class="tiptap-image-upload-file-info">
            <div class="tiptap-image-upload-file-icon">
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                class="tiptap-image-upload-icon"
                fill="currentColor"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M11.1953 4.41771C10.3478 4.08499 9.43578 3.94949 8.5282 4.02147C7.62062 4.09345 6.74133 4.37102 5.95691 4.83316C5.1725 5.2953 4.50354 5.92989 4.00071 6.68886C3.49788 7.44783 3.17436 8.31128 3.05465 9.2138C2.93495 10.1163 3.0222 11.0343 3.3098 11.8981C3.5974 12.7619 4.07781 13.5489 4.71463 14.1995C5.10094 14.5942 5.09414 15.2274 4.69945 15.6137C4.30476 16 3.67163 15.9932 3.28532 15.5985C2.43622 14.731 1.79568 13.6816 1.41221 12.5299C1.02875 11.3781 0.91241 10.1542 1.07201 8.95084C1.23162 7.74748 1.66298 6.59621 2.33343 5.58425C3.00387 4.57229 3.89581 3.72617 4.9417 3.10998C5.98758 2.4938 7.15998 2.1237 8.37008 2.02773C9.58018 1.93176 10.7963 2.11243 11.9262 2.55605C13.0561 2.99968 14.0703 3.69462 14.8919 4.58825C15.5423 5.29573 16.0585 6.11304 16.4177 7.00002H17.4999C18.6799 6.99991 19.8288 7.37933 20.7766 8.08222C21.7245 8.78515 22.4212 9.7743 22.7637 10.9036C23.1062 12.0328 23.0765 13.2423 22.6788 14.3534C22.2812 15.4644 21.5367 16.4181 20.5554 17.0736C20.0962 17.3803 19.4752 17.2567 19.1684 16.7975C18.8617 16.3382 18.9853 15.7172 19.4445 15.4105C20.069 14.9934 20.5427 14.3865 20.7958 13.6794C21.0488 12.9724 21.0678 12.2027 20.8498 11.4841C20.6318 10.7655 20.1885 10.136 19.5853 9.6887C18.9821 9.24138 18.251 8.99993 17.5001 9.00002H15.71C15.2679 9.00002 14.8783 8.70973 14.7518 8.28611C14.4913 7.41374 14.0357 6.61208 13.4195 5.94186C12.8034 5.27164 12.0427 4.75043 11.1953 4.41771Z"
                  fill="currentColor"
                />
                <path
                  d="M11 14.4142V21C11 21.5523 11.4477 22 12 22C12.5523 22 13 21.5523 13 21V14.4142L15.2929 16.7071C15.6834 17.0976 16.3166 17.0976 16.7071 16.7071C17.0976 16.3166 17.0976 15.6834 16.7071 15.2929L12.7078 11.2936C12.7054 11.2912 12.703 11.2888 12.7005 11.2864C12.5208 11.1099 12.2746 11.0008 12.003 11L12 11L11.997 11C11.8625 11.0004 11.7343 11.0273 11.6172 11.0759C11.502 11.1236 11.3938 11.1937 11.2995 11.2864C11.297 11.2888 11.2946 11.2912 11.2922 11.2936L7.29289 15.2929C6.90237 15.6834 6.90237 16.3166 7.29289 16.7071C7.68342 17.0976 8.31658 17.0976 8.70711 16.7071L11 14.4142Z"
                  fill="currentColor"
                />
              </svg>
            </div>
            <div class="tiptap-image-upload-details">
              <span class="tiptap-image-upload-text">
                {{ fileItem.file.name }}
              </span>
              <span class="tiptap-image-upload-subtext">
                {{ formatFileSize(fileItem.file.size) }}
              </span>
            </div>
          </div>
          <div class="tiptap-image-upload-actions">
            <span
              v-if="fileItem.status === 'uploading'"
              class="tiptap-image-upload-progress-text"
            >
              {{ fileItem.progress }}%
            </span>
            <Button
              type="button"
              data-style="ghost"
              @click.stop="removeFileItem(fileItem.id)"
            >
              <CloseIcon class="tiptap-button-icon" />
            </Button>
          </div>
        </div>
      </div>
    </div>

    <!-- Hidden file input -->
    <input
      ref="inputRef"
      name="file"
      :accept="accept"
      type="file"
      :multiple="limit > 1"
      @change="handleChange"
      @click.stop
    />
  </NodeViewWrapper>
</template>
