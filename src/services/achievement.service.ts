import { prisma } from "../db/client";


export interface AchievementUpdateInput {
  title?: string;
  achievedAt?: string;
  imageUrl?: string | null;
}


export const getAchievements = async () => {
  return await prisma.achievement.findMany({
    orderBy: {
      achievedAt: "desc",
    },
  });
};

export const getAchievementById = async (achievementId : number) => {
  return await prisma.achievement.findFirst({
    where: {
      id: Number(achievementId),
    },
    select: {
      id: true,
      title: true,
      achievedAt: true,
      imageUrl: true,
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
    },
  });
};


export const updateAchievementById = async (achievementId : number, updateContent : AchievementUpdateInput) => {
  return await prisma.achievement.update({
    where: {
      id: Number(achievementId),
    },
    data: updateContent
  });
};

export const deleteAchievementById = async (achievementId: number) => {
  await prisma.achievement.delete({
    where: {
      id: achievementId,
    },
  });
};




