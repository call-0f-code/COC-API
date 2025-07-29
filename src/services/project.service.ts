import { prisma } from "../db/client";

export const getProjects = async () => {
  return await prisma.project.findMany({
      include : {
        members : {
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
        }
      }
  });
};

export const getProjectById = async (projectId: number) => {
  return await prisma.project.findFirst({
    where: {
      id: projectId,
    },
  });
};

export const createProject = async ( projectContent : projectContent ) => {

    return await prisma.project.create({
        data : {
            name : projectContent.name,
            imageUrl : projectContent.imageUrl,
            githubUrl : projectContent.githubUrl,
            deployUrl : projectContent.deployUrl,
            createdById :  projectContent.AdminId,
        },
    })
   };

export const updateProjects = async (payload: updateContent,  projectId: number ) => {
  const data = payload;
  return await prisma.project.update({
    where: {
      id: projectId,
    },
    data,
  });
};

export const deleteProjects = async (projectId: number) => {
  return await prisma.project.delete({
    where: {
      id: projectId,
    },
  });
};

export const getMembersByProjectId = async (projectId: number) => {
  return await prisma.memberProject.findMany({
    where: {
      projectId,
    },
  });
};

export const addMembers = async ( addMembersData : addMembersData ) => {

    return await prisma.memberProject.createMany({
        data : addMembersData,
        skipDuplicates : true
    })
}


export const removeMembers = async (removedMemberData: removedMemberData) => {
  return await prisma.memberProject.delete({
    where: {
      memberId_projectId: {
        projectId: removedMemberData.projectId,
        memberId: removedMemberData.memberId,
      },
    },
  });
};
