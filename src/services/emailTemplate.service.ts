 import prisma from "../db/client";
import { ApiError } from "../utils/apiError";

export const createTemplate = async (
  name: string,
  subject: string,
  htmlBody: string,
  textBody?: string,
  createdById?: string,
) => {
  return await prisma.emailTemplate.create({
    data: { name, subject, htmlBody, textBody, createdById },
  });
};

export const listTemplates = async () => {
  return await prisma.emailTemplate.findMany({
    orderBy: { createdAt: "desc" },
  });
};

export const getTemplateById = async (id: number) => {
  return await prisma.emailTemplate.findUnique({ where: { id } });
};

export const updateTemplate = async (
  id: number,
  payload: Partial<{
    name: string;
    subject: string;
    htmlBody: string;
    textBody: string;
    updatedById: string;
  }>,
) => {
  const exists = await prisma.emailTemplate.findUnique({ where: { id } });
  if (!exists) throw new ApiError("Template not found", 404);

  return await prisma.emailTemplate.update({ where: { id }, data: payload });
};

export const deleteTemplate = async (id: number) => {
  const exists = await prisma.emailTemplate.findUnique({ where: { id } });
  if (!exists) throw new ApiError("Template not found", 404);

  return await prisma.emailTemplate.delete({ where: { id } });
};
