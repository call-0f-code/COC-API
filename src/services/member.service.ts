import { prisma } from "../db/client";
import { ApiError } from "../utils/apiError";
import { UpdateMemberPayload } from "../types/members";


export const checkAdmin = async (adminId: string) => {
  return await prisma.member.findUnique({
    where: {
      id: adminId,
      isManager: true,
    },
  });
};

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
  password: string,
  passoutYear: number,
) => {
  const newMember = await prisma.member.create({
    data: {
      email: email,
      name: name,
      passoutYear: new Date(passoutYear),
    },
  });

  await prisma.account.create({
    data: {
      provider: "credentials",
      providerAccountId: email,
      password: password,
      memberId: newMember.id,
    },
  });

  return newMember;
};

export const updateMember = async (
  id: string,
  payload: UpdateMemberPayload,
) => {
  const { name, ...rest } = payload;

  const member = await prisma.member.findUnique({
    where: {
      id: id,
    },
  });

  if (!member) {
    throw new ApiError("Member not found", 404);
  }

  const dataToUpdate = Object.fromEntries(
    Object.entries(rest).filter(([_, v]) => v !== undefined),
  );

  if(JSON.stringify(dataToUpdate) === '{}') throw new ApiError("No fields passed", 400)

  return await prisma.member.updateMany({
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
  const admin = await checkAdmin(adminId);
  console.log(admin);

  if (!admin) throw new ApiError("Forbidden access", 403);

  return await prisma.member.update({
    where: { id: memberId },
    data: {
      isApproved: isApproved,
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


export const deletePfp = async(id: string, image: string) => {
  return await prisma.member.update({
   where: { id },
    data: {
      profilePhoto: null,
    },
    select: {
      profilePhoto: true,
    },
  })
}