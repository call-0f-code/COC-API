import { Request, Response } from "express";
import * as achievementService from "../services/achievement.service";
import { uploadImage, deleteImage } from "../utils/imageUtils";
import { supabase } from "../app";
import { ApiError } from "../utils/apiError";

export const getAchievements = async (req: Request, res: Response) => {
  const achievements = await achievementService.getAchievements();

  res.status(200).json({
    success: true,
    count: achievements.length,
    data: achievements,
  });
};


export const getAchievementById = async (req: Request, res: Response) => {
  const achievementId = parseInt(req.params.achievementId);

  if (!achievementId || isNaN(achievementId)) {
    throw new ApiError("Invalid achievement ID", 400);
  }

  const achievement = await achievementService.getAchievementById(achievementId);

  if (!achievement) {
    throw new ApiError("Achievement not found", 404);
  }

  res.status(200).json({
    success: true,
    data: achievement,
  });
};

export const createAchievement = async (req: Request, res: Response) => {
  const file = req.file;
  if (!file) {
    throw new ApiError('Image file is not found', 400);
  }

  const imageUrl = await uploadImage(supabase, file, 'achievements');
  if (!imageUrl) {
    throw new ApiError('Image URL is missing', 400);
  }

  const { title, description, achievedAt, memberIds, createdById } = req.body.achievementData;

  if (!title || !description || !achievedAt || !createdById) {
    throw new ApiError('Title, description, achievedAt, and createdById are required', 400);
  }

  if (!Array.isArray(memberIds)) {
    throw new ApiError('memberIds must be an array', 400);
  }

  const achievement = await achievementService.createAchievement({
    title,
    description,
    achievedAt,
    imageUrl,
    memberIds,
    createdById,
  });

  res.status(201).json({
    success: true,
    data: achievement,
  });
};


export const updateAchievementById = async (req: Request, res: Response) => {
  const achievementId = parseInt(req.params.achievementId);

  if (!achievementId || isNaN(achievementId)) {
    throw new ApiError("Invalid achievement ID", 400);
  }

  const file = req.file;
  let imageUrl: string | undefined;

  let achievementData = req.body.achievementData;
  if (typeof achievementData === "string") {
    try {
      achievementData = JSON.parse(achievementData);
    } catch (e) {
      throw new ApiError("Invalid JSON in achievementData field", 400);
    }
  }

  const { title, description, achievedAt, updatedById, memberIds } = achievementData;

  if (!updatedById) {
    throw new ApiError("updatedById is required", 400);
  }

  const existingAchievement = await achievementService.getAchievementById(achievementId);
  if (!existingAchievement) {
    throw new ApiError("Achievement not found", 404);
  }

  if (file) {
    imageUrl = await uploadImage(supabase, file, "achievements", existingAchievement.imageUrl);
  }

  const { memberIds: _, ...updatePayload } = achievementData;

  if (imageUrl) {
    updatePayload.imageUrl = imageUrl;
  }

  const hasSomethingToUpdate =
    title || description || achievedAt || imageUrl || (Array.isArray(memberIds) && memberIds.length > 0);

  if (!hasSomethingToUpdate) {
    throw new ApiError("At least one field (title, description, achievedAt, image, or memberIds) must be provided for update", 400);
  }

  const updatedAchievement = await achievementService.updateAchievementById(
    achievementId,
    updatePayload
  );

  if (Array.isArray(memberIds) && memberIds.length > 0) {
    await achievementService.addMembersToAchievement(achievementId, memberIds);
  }

  res.status(200).json({
    success: true,
    data: updatedAchievement,
  });
};


export const deleteAchievementById = async (req: Request, res: Response) => {
  const achievementId = parseInt(req.params.achievementId);

  if (!achievementId || isNaN(achievementId)) {
    throw new ApiError("Invalid achievement ID", 400);
  }

  const existingAchievement = await achievementService.getAchievementById(achievementId);
  if (!existingAchievement) {
    throw new ApiError("Achievement not found", 404);
  }

  if (existingAchievement.imageUrl) {
    await deleteImage(supabase, existingAchievement.imageUrl);
  }

  await achievementService.deleteAchievementById(achievementId);

  res.status(200).json({
    success: true,
    message: "Achievement deleted successfully",
  });
};


export const removeMemberFromAchievement = async (req: Request, res: Response) => {
  const achievementId = parseInt(req.params.achievementId);
  const memberId = req.params.memberId;

  if (!achievementId || isNaN(achievementId)) {
    throw new ApiError("Invalid achievement ID", 400);
  }

  if (!memberId) {
    throw new ApiError("Member ID is required", 400);
  }

  await achievementService.removeMemberFromAchievement(achievementId, memberId);

  res.status(200).json({
    success: true,
    message: "Member removed from achievement successfully",
  });
};

