// src/types/express.d.ts
import "express";
import { File as MulterFile } from "multer";
import { SupabaseClient } from "@supabase/supabase-js";

declare global {
  namespace Express {
    interface Request {
      /** Populated by multer.single(…) */
      file?: MulterFile;
      /** In case you ever use multer.fields(…) or .array(…) */
      files?: MulterFile[] | { [fieldname: string]: MulterFile[] };

      /** If you attach the admin’s ID in middleware */
      AdminId?: string;

      /** Only if you choose to inject supabase into `req` via middleware */
      supabase?: SupabaseClient;

      projectId ?: string;

      achievementId ?: string;
      
    }
  }
}
