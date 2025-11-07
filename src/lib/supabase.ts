import { createClient } from "@supabase/supabase-js";
import { v4 as uuidv4 } from "uuid";

export const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

/**
 * Uploads an image file to Supabase storage with progress tracking
 * @param file - The image file to upload
 * @param onProgress - Optional callback for upload progress
 * @param abortSignal - Optional signal to abort the upload
 * @returns Promise resolving to the public URL of the uploaded image
 */
export async function uploadImageToSupabase(
  file: File,
  onProgress?: (event: { progress: number }) => void,
  abortSignal?: AbortSignal
): Promise<string> {
  const fileExt = file.name.split(".").pop();
  const fileName = `${uuidv4()}.${fileExt}`;
  const filePath = `${supabaseUrl}/storage/v1/object/public/tiptap/${fileName}`;

  // Report initial progress
  onProgress?.({ progress: 20 })

  // Check if aborted
  if (abortSignal?.aborted) {
    throw new Error('Upload cancelled')
  }

  // Simulate smooth progress during upload (Supabase JS client doesn't expose progress)
  let currentProgress = 20
  const progressInterval = setInterval(() => {
    if (currentProgress < 80) {
      // Increment by 5-15% each tick, slowing down as we approach 80%
      const increment = Math.random() * 10 + 5
      currentProgress = Math.min(80, currentProgress + increment)
      onProgress?.({ progress: Math.floor(currentProgress) })
    }
  }, 300)

  try {
    const { error: uploadError } = await supabase.storage
      .from("tiptap")
      .upload(fileName, file);

    clearInterval(progressInterval)

    if (uploadError) {
      throw uploadError;
    }

    // Report near completion
    onProgress?.({ progress: 90 })

    return filePath;
  } catch (error) {
    clearInterval(progressInterval)
    throw error
  }
}
