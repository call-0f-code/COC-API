import { NextFunction, Request, Response } from "express";
import * as achievementService from "../services/achievement.service";
import { ApiError } from "../utils/apiError";

export const getAchievements = async (req: Request, res: Response, next: NextFunction) => {
  const achievements = await achievementService.getAchievements();

  if (!achievements || achievements.length === 0) {
    throw new ApiError("No achievements found", 404);
  }

  res.status(200).json({
    success: true,
    count: achievements.length,
    data: achievements,
  });
};


export const getAchievementById = async (req: Request, res: Response, next: NextFunction) => {
  const achievementId = parseInt(req.params.achievementId);

  const achievement = await achievementService.getAchievementById(achievementId);

  if (!achievement) {
    throw new ApiError("Achievement not found", 404);
  }

  res.status(200).json({
    success: true,
    data: achievement,
  });
};


export const updateAchievementById = async (req: Request, res: Response, next: NextFunction) => {
  const achievementId = parseInt(req.params.achievementId);

  if (!achievementId) {
    throw new ApiError("Invalid achievement ID", 400);
  }

  const { title, achievedAt, imageUrl} = req.body;

  const existingAchievement = await achievementService.getAchievementById(achievementId);

  if (!existingAchievement) {
    throw new ApiError("Achievement not found", 404);
  }

  const updatedAchievement = await achievementService.updateAchievementById(achievementId, {
    title,
    achievedAt,
    imageUrl,
  });

  res.status(200).json({
    success: true,
    data: updatedAchievement,
  });
};


export const deleteAchievementById = async (req: Request, res: Response, next: NextFunction) => {
  const achievementId = parseInt(req.params.achievementId);

  const existingAchievement = await achievementService.getAchievementById(achievementId);

  if (!existingAchievement) {
    throw new ApiError("Achievement not found", 404);
  }

  await achievementService.deleteAchievementById(achievementId);

  res.status(200).json({
    success: true,
    message: "Achievement deleted successfully",
  });
};

