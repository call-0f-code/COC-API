import { NextFunction, Request, Response } from "express";
import * as achievementService from "../services/achievement.service";
import { ApiError } from "../utils/apiError";

export const getAchievements = async (req: Request, res: Response) => {
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


// export const createAchievement = async (req: Request, res: Response) => {
//   const { title, achievedAt, imageUrl} = req.body;

//   if (!title || !achievedAt ) {
//     throw new ApiError("title, achievedAt, and adminId are required", 400);
//   }

//   const newAchievement = await achievementService.createAchievement({
//     title,
//     achievedAt,
//     imageUrl,
//   });

//   res.status(201).json({
//     success: true,
//     data: newAchievement,
//   });
// };


export const createAchievement = async (req: Request, res: Response) => {
  const { title, achievedAt, imageUrl, memberIds } = req.body;

  if (!title || !achievedAt) {
    throw new ApiError("Title, achievedAt, and adminId are required", 400);
  }

  if (!Array.isArray(memberIds)) {
    throw new ApiError("memberIds must be an array", 400);
  }

  const achievement = await achievementService.createAchievement({
    title,
    achievedAt,
    imageUrl,
    memberIds,
  });

  res.status(201).json({
    success: true,
    data: achievement,
  });
};


// export const addMemberToAchievement = async (req: Request, res: Response) => {
//   const achievementId = parseInt(req.params.achievementId);
//   const { memberId } = req.body;

//   if (!achievementId || isNaN(achievementId)) {
//     throw new ApiError("Invalid achievement ID", 400);
//   }

//   if (!memberId) {
//     throw new ApiError("Member ID is required", 400);
//   }

//   const newLink = await achievementService.addMemberToAchievement({
//     achievementId,
//     memberId,
//   });

//   res.status(201).json({
//     success: true,
//     data: newLink,
//   });
// };


export const updateAchievementById = async (req: Request, res: Response) => {
  const achievementId = parseInt(req.params.achievementId);

  if (!achievementId || isNaN(achievementId)) {
    throw new ApiError("Invalid achievement ID", 400);
  }

  const { title, achievedAt, imageUrl, memberIds } = req.body;

  // if (!adminId) {
  //   return next(new ApiError("Admin ID is required", 400));
  // }


const existingAchievement = await achievementService.getAchievementById(achievementId);

  if (!existingAchievement) {
    throw new ApiError("Achievement not found", 404);
  }

  const updatedAchievement = await achievementService.updateAchievementById(achievementId, {
    title,
    achievedAt,
    imageUrl,
  });

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

  await achievementService.deleteAchievementById(achievementId);

  res.status(200).json({
    success: true,
    message: "Achievement deleted successfully",
  });
};


export const removeMemberFromAchievement = async (req: Request, res: Response, next: NextFunction) => {
  const achievementId = parseInt(req.params.achievementId);
  const { memberId } = req.body;

  if (!achievementId || isNaN(achievementId)) {
    return next(new ApiError("Invalid achievement ID", 400));
  }

  if (!memberId) {
    return next(new ApiError("Member ID is required", 400));
  }

  await achievementService.removeMemberFromAchievement(achievementId, memberId);

  res.status(200).json({
    success: true,
    message: "Member removed from achievement successfully",
  });
};
