import { SupabaseClient } from "@supabase/supabase-js";
import { v4 as uuidv4 } from "uuid";
import { ApiError } from "./apiError";

type MulterFile = Express.Multer.File;

function extractFilePathAndNameFromUrl(fileUrl: string): {
  filePath: string;
  fileName: string;
} {
  try {
    const url = new URL(fileUrl);
    const pathParts = url.pathname.split("/"); // ['', 'storage', 'v1', 'object', 'public', 'images', ...filePathParts]
    const filePath = pathParts.slice(6).join("/"); // 'images/...'
    if (!filePath) throw new Error("Invalid file URL");
    const fileName = filePath.split("/").pop() || "";
    return { filePath, fileName };
  } catch {
    throw new ApiError("Invalid file URL", 400);
  }
}

export async function uploadImage(
  supabase: SupabaseClient,
  file: MulterFile,
  folder: string,
  fileUrl?: string,
): Promise<string> {
  const mime = file.mimetype;
  if (!mime) throw new ApiError("File type is missing", 400);
  const allowedTypes = ["image/jpeg", "image/png", "image/gif", "image/webp"];
  if (!allowedTypes.includes(mime)) {
    throw new ApiError(
      "Invalid file type. Only JPEG, PNG, GIF, and WebP images are allowed.",
      400,
    );
  }
  const ext = mime.split("/")[1];

  
  if (fileUrl) {
    await deleteImage(supabase,fileUrl);
  }
  const filename:string =  `${uuidv4()}.${ext}`;

  const filePath = `${folder}/${filename}`;

  const { error: uploadError } = await supabase.storage
    .from("images")
    .upload(filePath, file.buffer, {
      contentType: file.mimetype,
      upsert: true,
    });

  if (uploadError) {
    throw new ApiError(`Image upload failed: ${uploadError.message}`, 500);
  }

  const { data: urlData } = supabase.storage
    .from("images")
    .getPublicUrl(filePath);

  if (!urlData?.publicUrl) {
    throw new ApiError("Failed to get public URL", 500);
  }

  return urlData.publicUrl;
}

export async function deleteImage(
  supabase: SupabaseClient,
  fileUrl: string,
): Promise<void> {
  const { filePath } = extractFilePathAndNameFromUrl(fileUrl);

  const { error: deleteError } = await supabase.storage
    .from("images")
    .remove([filePath]);

  if (deleteError) {
    throw new ApiError(`Image deletion failed: ${deleteError.message}`, 500);
  }
}
