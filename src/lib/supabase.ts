import { createClient } from '@supabase/supabase-js'
import { v4 as uuidv4 } from 'uuid'

export const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

/**
 * Uploads an image file to Supabase storage
 * @param file - The image file to upload
 * @returns Promise resolving to the public URL of the uploaded image
 */
export async function uploadImageToSupabase(file: File): Promise<string> {
  const fileExt = file.name.split('.').pop()
  const fileName = `${uuidv4()}.${fileExt}`
  const filePath = `images/${fileName}`

  const { error: uploadError } = await supabase.storage
    .from('images')
    .upload(filePath, file)

  if (uploadError) {
    throw uploadError
  }

  const { data } = supabase.storage.from('images').getPublicUrl(filePath)

  return data.publicUrl
}
