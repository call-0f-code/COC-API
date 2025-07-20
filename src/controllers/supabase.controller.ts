import { Request, Response, NextFunction } from "express";
import { SupabaseClient } from "@supabase/supabase-js";
import { deleteProfilePicture, uploadProfilePicture } from "./member.controller";

export const injectSupabase = (supabase: SupabaseClient, folder: string, operation: "update" | "delete") => {
  return async (req: Request, res: Response, next: NextFunction) => {

    switch(operation === 'update') {
      case (folder === 'members') :
        await uploadProfilePicture(req, res, next, supabase);

    }

    switch(operation === 'delete') {
      case(folder == 'members'): 
        await deleteProfilePicture(req, res, next, supabase);

    }
    
  };
};

