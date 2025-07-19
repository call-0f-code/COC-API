import { prisma } from "../db/client";
// import { UpdateAchievementInput, CreateAchievementInput } from "../types/acheivement.types";

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
      achievedAt: new Date(data.achievedAt),
      imageUrl: data.imageUrl,
      members: {
        create: data.memberIds.map((memberId) => ({
          memberId,
        })),
      },
    },
  });
};


export const getAchievementById = async (achievementId: number) => {
  return await prisma.achievement.findUnique({
    where: { id: achievementId },
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

export const updateAchievementById = async (
  achievementId: number,
  updateContent: UpdateAchievementInput) => {
  return await prisma.achievement.update({
    where: { id: achievementId },
    data: {
      ...updateContent,
      // achievedAt: updateContent.achievedAt ? new Date(updateContent.achievedAt) : undefined,
    },
  });
};

// export const addMemberToAchievement = async (data: { achievementId: number; memberId: string }) => {
//   return await prisma.memberAchievement.create({
//     data: {
//       achievementId: data.achievementId,
//       memberId: data.memberId,
//     },
//   });
// };


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




