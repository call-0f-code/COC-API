import 'express'
import { SupabaseClient } from '@supabase/supabase-js'
import { File as MulterFile } from 'multer'
import { v4 as uuidv4 } from 'uuid'
import { ApiError } from '../utils/apiError'

/**
 * Uploads an image buffer to the 'images' bucket in the given folder and returns its public URL.
 *
 * @param supabase  - Initialized Supabase client
 * @param file      - Multer file object ({ buffer, mimetype, originalname, ... })
 * @param folder    - The folder path inside the 'images' bucket (e.g. 'profile-photos')
 * @returns         - Public URL of the uploaded image
 */
export async function uploadImage(
  supabase: SupabaseClient,
  file: MulterFile,
  folder: string
): Promise<string> {
  // 1) Determine file extension
  const mime = file.mimetype // e.g. 'image/jpeg'
  const ext = mime.split('/')[1] ?? 'jpeg'

  // 2) Create a unique filename
  const filename = `${uuidv4()}.${ext}`

  // 3) Build full path inside the bucket
  const filePath = `${folder}/${filename}`

  // 4) Perform the upload (upsert: true will overwrite same path if it exists)
  const { error: uploadError } = await supabase
    .storage
    .from('images')
    .upload(filePath, file.buffer, {
      contentType: file.mimetype,
      upsert: true,
    })

  if (uploadError) {
    throw new ApiError(`Image upload failed: ${uploadError.message}`, 500)
  }

  // 5) Generate a public URL
  const { data: urlData } = supabase
    .storage
    .from('images')
    .getPublicUrl(filePath)

  if (!urlData?.publicUrl) {
    throw new ApiError('Failed to get public URL', 500)
  }

  return urlData.publicUrl
}