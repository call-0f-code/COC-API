import { Request, Response, NextFunction } from "express";
import { SupabaseClient } from "@supabase/supabase-js";
import { uploadProfilePicture } from "./member.controller";

export const injectSupabase = (supabase: SupabaseClient, folder: string) => {
    return async (req: Request, res: Response, next: NextFunction) => {
        if(folder === 'member')await uploadProfilePicture(req, res, next, supabase);
    };
}


//Your route should look like this
//router.post('/photo/:memberId',
//    upload.single("file"),
//    injectSupabase(supabase, "member")

//  );
//USE AS A REFERENCE  

//export const uploadProfilePicture = async(req: Request, res: Response, next: NextFunction, supabase: SupabaseClient) => {
//     const { memberId } = req.params;

//     if(!memberId) throw new ApiError('No memberId provided', 400);
//     if (!req.file) throw new ApiError("No image file provided", 400);
    
//     const imageUrl = await uploadImage(supabase, req.file, "members");
//     await memberService.updateMember(memberId, {profilePhoto: imageUrl});

//     res.status(200).json({success: true, message: "Image uploaded succesfully"});
// }