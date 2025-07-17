import { prisma } from "../db/client"
import { InterviewCreateInput, InterviewUpdateInput } from "../types/interview.types";

export const getInterviews = async () => {
  return await prisma.interviewExperience.findMany({
    orderBy: {
      id: "desc",
    },
  });
};

export const getInterviewById = async (interviewId: number) => {
  return await prisma.interviewExperience.findUnique({
    where: {
      id: interviewId,
    },
  });
};

export const createInterview = async (memberId: string, interviewData: InterviewCreateInput) => {
  const interview = await prisma.interviewExperience.create({
    data: {
      company: interviewData.company,
      role: interviewData.role,
      verdict: interviewData.verdict,
      content: interviewData.content,
      isAnonymous: interviewData.isAnonymous,
      memberId: memberId,
    },
  });

  return interview;
};

export const updateInterviewById = async (interviewId: number, updateData: InterviewUpdateInput) => {
  const { memberId, ...fieldsToUpdate } = updateData;

  const updatedInterview = await prisma.interviewExperience.update({
    where: {
      id: interviewId,
    },
    data: fieldsToUpdate,
  });

  return updatedInterview;
};

export const deleteInterviewById = async (interviewId: number) => {
  await prisma.interviewExperience.delete({
    where: {
      id: interviewId,
    },
  });
};


