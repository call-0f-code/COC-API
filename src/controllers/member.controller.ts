import { Request, Response, NextFunction } from "express";
import * as memberService from "../services/member.service";
import { ApiError } from "../utils/apiError";
import { SupabaseClient } from "@supabase/supabase-js";
import { uploadImage } from "../utils/imageUtils";
import { deleteImage } from "../utils/imageUtils";

export const listAllApprovedMembers = async (req: Request, res: Response) => {
  const user = await memberService.approvedMembers();
  res
    .status(200)
    .json({ user, success: true, message: "Fetched approved users" });
};


export const getUserDetails = async (req: Request, res: Response) => {
  const { memberId } = req.params;

  if (!memberId) throw new ApiError("No memberId provided", 400);

  const user = await memberService.getDetails(memberId);
  res.json({ success: true, user, message: "Fetched user details" });
};


export const createAMember = async (req: Request, res: Response) => {
  const { email, name, password, passoutYear } = req.body;
  if (!email || !name || !password || !passoutYear) {
    throw new ApiError("Required fields absent", 402);
  }

  const user = await memberService.createMember(
    email,
    name,
    password,
    passoutYear,
  );

  if (!user) {
    throw new ApiError("Error creating user", 500);
  }

  res.status(200).json({ success: true, user });
};


export const updateAMember = async (req: Request, res: Response) => {
  const { memberId } = req.params;
  await memberService.updateMember(memberId, req.body);

  res
    .status(200)
    .json({ success: true, message: "Updated member details succesfully" });
};


export const getUnapprovedMembers = async (req: Request, res: Response) => {
  const unapprovedMembers = await memberService.unapprovedMembers();
  res.status(200).json({ success: true, unapprovedMembers });
};


export const updateRequest = async (req: Request, res: Response) => {
  const { memberId } = req.params;
  const { isApproved, adminId } = req.body;

  if (!memberId || !adminId || isApproved === "undefined")
    throw new ApiError("No essential creds provided", 400);

  const update = await memberService.approveRequest(
    isApproved,
    adminId,
    memberId,
  );

  await memberService.updateMember(memberId, {approvedBy: adminId})

  res
    .status(200)
    .json({ success: true, update, message: "Approve Request Checked" });
};


export const getUserAchievements = async (req: Request, res: Response) => {
  const { memberId } = req.params;

  if (!memberId) throw new ApiError("No memberId provided", 400);

  const achievements = await memberService.getAchievements(memberId);
  res.status(200).json({ success: true, achievements });
};


export const getUserProjects = async (req: Request, res: Response) => {
  const { memberId } = req.params;

  if (!memberId) throw new ApiError("No memberId provided", 400);

  const projects = await memberService.getProjects(memberId);
  res.status(200).json({ success: true, projects });
};


export const getUserInterviews = async (req: Request, res: Response) => {
  const { memberId } = req.params;

  if (!memberId) throw new ApiError("No memberId provided", 400);

  const interviews = await memberService.getInterviews(memberId);
  res.status(200).json({ success: true, interviews });
};


export const uploadProfilePicture = async (
  req: Request,
  res: Response,
  next: NextFunction,
  supabase: SupabaseClient,
) => {
  const { memberId } = req.params;

  if (!memberId) throw new ApiError("No memberId provided", 400);
  if (!req.file) throw new ApiError("No image file provided", 400);

  const oldData = await memberService.getDetails(memberId);
  const oldImage = oldData?.profilePhoto;

  if(oldImage) {
    memberService.deletePfp(memberId, oldImage);
  }

    const imageUrl = await uploadImage(supabase, req.file, "members");
    await memberService.updateMember(memberId, { profilePhoto: imageUrl });

  res
    .status(200)
    .json({ success: true, message: "Image uploaded succesfully" });
};

export const deleteProfilePicture = async (
  req: Request,
  res: Response,
  next: NextFunction,
  supabase: SupabaseClient
) => {
  const { memberId } = req.params;

  if(!memberId) throw new ApiError("MemberId not provided", 400);

  const data = await memberService.getDetails(memberId);
  const image = data?.profilePhoto;
  
  if(!image) throw new ApiError("Please add profile picture first", 400);

  await deleteImage(supabase, image);
  await memberService.deletePfp(memberId, image);

  res.json({
    success: true,
    message: "Profile picture deleted succesfully"
  })
}
