import { Request, Response } from "express";
import * as memberService from "../services/member.service";
import { ApiError } from "../utils/apiError";
import { deleteImage, uploadImage } from "../utils/imageUtils";
import { SupabaseClient } from "@supabase/supabase-js";

// List all approved members
export const listAllApprovedMembers = async (req: Request, res: Response) => {
  
  const {email, password} = req.query;

  if(email && password) {

    const user = await memberService.getUserByEmail(email as string);

    if(!user) throw new ApiError('Incorrect email or password', 400);

    res.status(200).json({
      success: true,
      user
    })
  }
  else {  
  const user = await memberService.approvedMembers();
  res
    .status(200)
    .json({ user, success: true });
  }

};

// Get details of a single user
export const getUserDetails = async (req: Request, res: Response) => {
  const { memberId } = req.params;

  if (!memberId) throw new ApiError("No memberId provided", 400);

  const user = await memberService.getDetails(memberId);
  if (!user) throw new ApiError("No member found", 404);

  res.json({ success: true, user, message: "Fetched user details" });
};

// Create a new member
export const createAMember =
  (supabase: SupabaseClient) => async (req: Request, res: Response) => {
    const {email, name, password, passoutYear, provider} = req.body;

    if (!email || !name || !password || !passoutYear) {
      throw new ApiError("Required fields absent", 400);
    }

    let imageUrl: string | undefined;
    if (req.file) {
      imageUrl = await uploadImage(supabase, req.file, "members");
    }

    const user = await memberService.createMember(
      email,
      name,
      password,
      passoutYear,
      imageUrl,
      provider,
    );

    if (!user) throw new ApiError("Error creating user", 500);

    res.status(201).json({ success: true, user });
  };

// Update an existing member
export const updateAMember =
  (supabase: SupabaseClient) => async (req: Request, res: Response) => {
    const { memberId } = req.params;

    if(!memberId) throw new ApiError("No memberId provided", 400);

    const body = req.body;

    if (req.file) {
      const oldData = await memberService.getDetails(memberId);
      const oldImage = oldData?.profilePhoto;

      if(oldImage) await uploadImage(supabase, req.file, "members", oldImage);

      const imageUrl = await uploadImage(supabase, req.file, "members");
      body.profilePhoto = imageUrl;
    }

    await memberService.updateMember(memberId, body);

    const updatedData = await memberService.getDetails(memberId);
    res
      .status(200)
      .json({ success: true, user: updatedData });
  };

// Get all unapproved members
export const getUnapprovedMembers = async (req: Request, res: Response) => {
  const unapprovedMembers = await memberService.unapprovedMembers();
  res.status(200).json({ success: true, unapprovedMembers });
};

// Approve or reject member request
export const updateRequest = async (req: Request, res: Response) => {
  const { memberId } = req.params;
  const { isApproved, adminId } = req.body;

  if (!memberId || !adminId || isApproved === undefined) {
    throw new ApiError("No essential creds provided", 400);
  }

  if(!isApproved) throw new ApiError("Someone interrupting the backend flow", 400);

  const update = await memberService.approveRequest(
    isApproved,
    adminId,
    memberId,
  );

  res
    .status(200)
    .json({ success: true, update, message: "Approve Request Checked" });
};

// Get achievements of a member
export const getUserAchievements = async (req: Request, res: Response) => {
  const { memberId } = req.params;

  if (!memberId) throw new ApiError("No memberId provided", 400);

  const achievements = await memberService.getAchievements(memberId);
  res.status(200).json({ success: true, achievements });
};

// Get projects of a member
export const getUserProjects = async (req: Request, res: Response) => {
  const { memberId } = req.params;

  if (!memberId) throw new ApiError("No memberId provided", 400);

  const projects = await memberService.getProjects(memberId);
  res.status(200).json({ success: true, projects });
};

// Get interviews of a member
export const getUserInterviews = async (req: Request, res: Response) => {
  const { memberId } = req.params;

  if (!memberId) throw new ApiError("No memberId provided", 400);

  const interviews = await memberService.getInterviews(memberId);
  res.status(200).json({ success: true, interviews });
};