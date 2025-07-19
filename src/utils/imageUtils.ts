import { SupabaseClient } from '@supabase/supabase-js'
import { v4 as uuidv4 } from 'uuid'
import { ApiError } from './apiError'

type MulterFile = Express.Multer.File

export async function uploadImage(
  supabase: SupabaseClient,
  file: MulterFile,
  folder: string, 
  fileName?: string
): Promise<string> {
  // 1) Determine file extension
    const mime = file.mimetype // e.g. 'image/jpeg'
    if (!mime) {
        throw new ApiError('File type is missing', 400)
    }
  // Validate MIME type against allowed image types
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp']
    if (!allowedTypes.includes(mime)) {
        throw new ApiError('Invalid file type. Only JPEG, PNG, GIF, and WebP images are allowed.', 400)
    }
  
  const ext = mime.split('/')[1]

  // 2) Create filename
const filename = fileName ? fileName : `${uuidv4()}.${ext}`

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

export async function deleteImage(
  supabase: SupabaseClient,
  fileUrl: string
): Promise<void> {
  const url = new URL(fileUrl);
  const pathParts = url.pathname.split('/'); // ['', 'storage', 'v1', 'object', 'public', 'images', ...filePathParts]
  const filePath = pathParts.slice(6).join('/'); // 'images/...'
  if (!filePath) {
    throw new ApiError('Invalid file URL', 400)
  }
  const { error: deleteError } = await supabase
    .storage
    .from('images')
    .remove([filePath])

  if (deleteError) {
    throw new ApiError(`Image deletion failed: ${deleteError.message}`, 500)
  }
}