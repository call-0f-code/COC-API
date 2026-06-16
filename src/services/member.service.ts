import prisma  from "../db/client";
import { ApiError } from "../utils/apiError";
import { Role } from "../generated/prisma/client";

const GHOST_ALLOWED_ROLES: Role[] = [Role.ADMIN, Role.SUPER_ADMIN];

export const getUserByEmail = async(email: string) => {
  return await prisma.member.findUnique({
    where: {
      email: email
    },
    select: {
      id: true,
      isApproved: true,
      role: true,
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
      isGhosted: false,
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
  const { name, ...rest } = payload;

  const dataToUpdate = Object.fromEntries(
    Object.entries({ name, ...rest }).filter(([_, v]) => v !== undefined)
  );

  if (JSON.stringify(dataToUpdate) === "{}") throw new ApiError("No fields passed", 400);

  return await prisma.member.update({
    where: { id },
    data: dataToUpdate,
  });
};

export const updatePassword = async(id: string, password: string) => {
  const account = await prisma.account.findFirst({
      where: { memberId: id },
    });

    if (!account) throw new ApiError("Associated account not found", 404);

    return await prisma.account.update({
      where: { id: account.id },
      data: { password }, 
    });
}

export const unapprovedMembers = async () => {
  return await prisma.member.findMany({
    where: { isApproved: false, isGhosted: false },
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

export const updateMemberRole = async (
  superAdminId: string,
  memberId: string,
  newRole: Role,
) => {
  // Verify the requester is a SUPER_ADMIN
  const requester = await prisma.member.findUnique({
    where: { id: superAdminId },
    select: { role: true },
  });

  if (!requester || requester.role !== Role.SUPER_ADMIN) {
    throw new ApiError("Forbidden: only Super Admins can assign roles", 403);
  }

  // Prevent modifying own role
  if (superAdminId === memberId) {
    throw new ApiError("Cannot modify your own role", 400);
  }

  return await prisma.member.update({
    where: { id: memberId },
    data: { role: newRole },
  });
};

/**
 * Ghost or unghost a member request (Dead Zone).
 * Only ADMIN and SUPER_ADMIN are allowed to perform this action.
 */
export const ghostMember = async (
  adminId: string,
  memberId: string,
  ghost: boolean,
) => {
  // Verify requester exists and has the right role
  const requester = await prisma.member.findUnique({
    where: { id: adminId },
    select: { role: true },
  });

  if (!requester || !GHOST_ALLOWED_ROLES.includes(requester.role)) {
    throw new ApiError("Forbidden: only Admins and Super Admins can ghost members", 403);
  }

  // Prevent self-ghosting
  if (adminId === memberId) {
    throw new ApiError("Cannot ghost yourself", 400);
  }

  return await prisma.member.update({
    where: { id: memberId },
    data: {
      isGhosted: ghost,
      ghostedBy: ghost ? { connect: { id: adminId } } : { disconnect: true },
    },
  });
};

/**
 * Retrieve all members currently in the Dead Zone (ghosted).
 */
export const deadZoneMembers = async () => {
  return await prisma.member.findMany({
    where: { isGhosted: true },
    include: {
      ghostedBy: {
        select: { id: true, name: true, email: true, role: true },
      },
    },
  });
};