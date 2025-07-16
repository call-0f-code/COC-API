import { Request, Response, NextFunction } from "express";
import { SupabaseClient } from "@supabase/supabase-js";
import { updateMember } from "../services/member.service";
import { uploadImage } from "../services/upload.service";
import { ApiError } from "../utils/apiError";
import { supabase } from "../app";


export const uploadPicture = async(req: Request, res: Response, next: NextFunction, supabase: SupabaseClient) => {
    const { memberId } = req.params;

    if(!memberId) throw new ApiError('No memberId provided', 400);
    if (!req.file) throw new ApiError("No image file provided", 400);
    
    const imageUrl = await uploadImage(supabase, req.file, "members");
    const updatedPfp = await updateMember(memberId, {profilePhoto: imageUrl});

    res.status(200).json(updatedPfp);
}


export const injectSupabase = (supabase: SupabaseClient) => {
    return async (req: Request, res: Response, next: NextFunction) => {
        await uploadPicture(req, res, next, supabase);
    };
}