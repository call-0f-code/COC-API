import { prisma } from "../db/client";
import { ApiError } from "../utils/apiError";

export const getUserByEmail = async(email: string) => {
  return await prisma.member.findUnique({
    where: {
      email: email
    },
    select: {
      id: true,
      isApproved: true,
      isManager: true,
      accounts: {
        select: {
          password: true
        }
      },
    }
  })
}

export const approvedMembers = async () => {
  return await prisma.member.findMany({
    where: {
      isApproved: true,
    },
  });
};

export const getDetails = async (memberId: string) => {
  return await prisma.member.findUnique({
    where: {
      id: memberId,
    },
  });
};

export const createMember = async (
  email: string,
  name: string,
  provider: "google" | "github" | "credentials",
  password?: string,
  passoutYear?: number,
  imageUrl?: string,
) => {
  const newMember = await prisma.member.create({
    data: {
      email,
      name,
      passoutYear: passoutYear === undefined ? "" :  new Date(passoutYear),
      profilePhoto: imageUrl,
    },
  });

  await prisma.account.create({
    data: {
      provider,
      providerAccountId: email,
      password: provider === "credentials" ? password : null,
      memberId: newMember.id,
    },
  });

  return newMember;
};

export const updateMember = async (
  id: string,
  payload: UpdateMemberPayload
) => {
  const { name, password, ...rest } = payload;

  if (password) {
    const account = await prisma.account.findFirst({
      where: { memberId: id },
    });

    if (!account) throw new ApiError("Associated account not found", 404);

    return await prisma.account.update({
      where: { id: account.id },
      data: { password }, 
    });
  }

  const dataToUpdate = Object.fromEntries(
    Object.entries({ name, ...rest }).filter(([_, v]) => v !== undefined)
  );

  if (JSON.stringify(dataToUpdate) === "{}" && !password) throw new ApiError("No fields passed", 400);

  return await prisma.member.update({
    where: { id },
    data: dataToUpdate,
  });
};

export const unapprovedMembers = async () => {
  return await prisma.member.findMany({
    where: { isApproved: false },
  });
};

export const approveRequest = async (
  isApproved: boolean,
  adminId: string,
  memberId: string,
) => {
  return await prisma.member.update({
    where: { id: memberId },
    data: {
      isApproved,
      approvedBy: { connect: { id: adminId } },
    },
  });
};

export const getAchievements = async (id: string) => {
  return await prisma.achievement.findMany({
    where: {
      members: {
        some: {
          memberId: id,
        },
      },
    },
  });
};

export const getProjects = async (id: string) => {
  return await prisma.project.findMany({
    where: {
      members: {
        some: {
          memberId: id,
        },
      },
    },
  });
};

export const getInterviews = async (id: string) => {
  return await prisma.interviewExperience.findMany({
    where: { memberId: id },
  });
};