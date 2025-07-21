import { prisma } from "../db/client";

export const getAchievements = async () => {
  return await prisma.achievement.findMany({
    orderBy: {
      achievedAt: "desc",
    },
  });
};


export const createAchievement = async (data: CreateAchievementInput) => {
  return await prisma.achievement.create({
    data: {
      title: data.title,
      description: data.description,
      achievedAt: new Date(data.achievedAt),
      imageUrl: data.imageUrl,
      createdById: data.createdById,
      members: {
        create: data.memberIds.map((memberId) => ({ memberId })),
      },
    },
    include: {
      members: {
        select: {
          memberId: true,
        },
      },
    },
  });
};


export const getAchievementById = async (achievementId: number) => {
  return await prisma.achievement.findUnique({
    where: { id: achievementId },
    include: {

      members: {
        select: {
          member: {
            select: {
              id: true,
              name: true,
              email: true,
              profilePhoto: true,
            },
          },
        },
      },

      createdBy: {
        select: {
          id: true,
          name: true,
        },
      },
      updatedBy: {
        select: {
          id: true,
          name: true,
        },
      },
    },
  });
};


export const updateAchievementById = async (
  achievementId: number,
  updateContent: UpdateAchievementInput) => {
  return await prisma.achievement.update({
    where: { id: achievementId },
    data: {
      ...updateContent,
    },
    include: {
      updatedBy: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
    },
  });
};


export const addMembersToAchievement = async (achievementId: number, memberIds: string[]) => {
  if (!Array.isArray(memberIds) || memberIds.length === 0) return;

  await prisma.memberAchievement.createMany({
    data: memberIds.map((memberId) => ({
      memberId,
      achievementId,
    })),
    skipDuplicates: true,
  });
};


export const deleteAchievementById = async (achievementId: number) => {
  return await prisma.achievement.delete({
    where: { id: achievementId },
  });
};


export const removeMemberFromAchievement = async (achievementId: number, memberId: string) => {
  return await prisma.memberAchievement.delete({
    where: {
      memberId_achievementId: {
        memberId,
        achievementId,
      },
    },
  });
};




