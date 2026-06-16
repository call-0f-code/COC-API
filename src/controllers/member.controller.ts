import { Request, Response } from "express";
import * as memberService from "../services/member.service";
import { ApiError } from "../utils/apiError";
import { uploadImage } from "../utils/imageUtils";
import { SupabaseClient } from "@supabase/supabase-js";
import { Role } from "../generated/prisma/client";

// List all approved members
export const listAllApprovedMembers = async (req: Request, res: Response) => {
  
  const {email} = req.query;

  if(email) {

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

    if (!email || !name || !password || !passoutYear || !provider) {
      throw new ApiError("Required fields absent", 400);
    }

    let imageUrl: string | undefined;
    if (req.file) {
      imageUrl = await uploadImage(supabase, req.file, "members");
    }

    const user = await memberService.createMember(
      email,
      name,
      provider,
      password,
      passoutYear,
      imageUrl,
    );

    if (!user) throw new ApiError("Error creating user", 500);

    res.status(201).json({ success: true, user });
  };

// Update an existing member
export const updateAMember =
  (supabase: SupabaseClient) => async (req: Request, res: Response) => {

   const { memberId } = req.params;
  
    if(!memberId) throw new ApiError("No memberId provided", 400);

    const parsedBody = JSON.parse(req.body.memberData);
    let imageUrl: undefined | string;

    if (req.file) {
      const oldData = await memberService.getDetails(memberId);
      const oldImage = oldData?.profilePhoto;

      if(oldImage) imageUrl = await uploadImage(supabase, req.file, "members", oldImage);
      else imageUrl = await uploadImage(supabase, req.file, "members");
    }
    if (imageUrl) parsedBody.profilePhoto = imageUrl;

    if(parsedBody.password) await memberService.updatePassword(memberId, parsedBody.password);
    else await memberService.updateMember(memberId, parsedBody);

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

// Update a member's role (SUPER_ADMIN only)
export const updateMemberRole = async (req: Request, res: Response) => {
  const { memberId } = req.params;
  const { adminId, role } = req.body;

  if (!memberId || !adminId || !role) {
    throw new ApiError("memberId, adminId, and role are required", 400);
  }

  const validRoles = Object.values(Role);
  if (!validRoles.includes(role)) {
    throw new ApiError(
      `Invalid role. Must be one of: ${validRoles.join(", ")}`,
      400,
    );
  }

  const updated = await memberService.updateMemberRole(adminId, memberId, role as Role);

  res.status(200).json({
    success: true,
    user: updated,
    message: `Role updated to ${role}`,
  });
};

// Ghost or unghost a member (Dead Zone) — ADMIN & SUPER_ADMIN only
export const ghostMember = async (req: Request, res: Response) => {
  const { memberId } = req.params;
  const { adminId, ghost = true } = req.body;

  if (!memberId || !adminId) {
    throw new ApiError("memberId and adminId are required", 400);
  }

  if (typeof ghost !== "boolean") {
    throw new ApiError('"ghost" must be a boolean', 400);
  }

  const updated = await memberService.ghostMember(adminId, memberId, ghost);

  const action = ghost ? "ghosted" : "unghosted";
  res.status(200).json({
    success: true,
    user: updated,
    message: `Member ${action} and moved to Dead Zone`,
  });
};

// Get all ghosted members (Dead Zone audit list) — ADMIN & SUPER_ADMIN only
export const getDeadZoneMembers = async (req: Request, res: Response) => {
  const members = await memberService.deadZoneMembers();
  res.status(200).json({ success: true, members });
};
