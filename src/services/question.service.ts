import { prisma } from "../db/client";
import { Difficulty } from "../generated/prisma";

export const getQuestionByTopicId = async (TopicId: number) => {
  return await prisma.question.findMany({
    where: { topicId: TopicId },
  });
};

export const getQuestionByQuestionId = async (questionId: number) => {
  return await prisma.question.findUnique({
    where: { id: questionId },
  });
};
export const addQuestionByTopicId = async (
  adminId: string,
  TopicId: number,
  link: string,
  difficulty: Difficulty,
  questionName: string,
) => {
  return await prisma.question.create({
    data: {
      questionName,
      difficulty,
      link,
      topicId: TopicId,
      createdById: adminId,
      updatedById: adminId,
    },
  });
};

export const updateQuestion = async (
  questionData: questionData,
  questionId: number,
) => {
  return await prisma.question.update({
    where: { id: questionId },
    data: questionData,
  });
};

export const deleteQuestion = async (questionId: number) => {
  return await prisma.question.delete({
    where: { id: questionId },
  });
};
