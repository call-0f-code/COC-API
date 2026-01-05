import  prisma  from "../db/client";

export const getTopics = async () => {
  return await prisma.topic.findMany();
};

export const createTopics = async (
  title: string,
  description: string,
  adminId: string,
) => {
  return await prisma.topic.create({
    data: {
      title,
      description,
      createdById: adminId,
      updatedById: adminId,
    },
  });
};

export const updateTopic = async (
  topicId: number,
  updateData: topicData,
  adminId: string,
) => {
  updateData.updatedById = adminId;
  return await prisma.topic.update({
    where: { id: topicId },
    data: updateData,
  });
};

export const deleteTopic = async (topicId: number) => {
  return await prisma.topic.delete({
    where: { id: topicId },
  });
};
