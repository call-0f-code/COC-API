import { Request, Response } from "express";
import * as emailTemplateService from "../services/emailTemplate.service";
import { ApiError } from "../utils/apiError";

// GET /email/templates
export const listTemplates = async (_req: Request, res: Response) => {
  const templates = await emailTemplateService.listTemplates();
  res.status(200).json({ success: true, templates });
};

// GET /email/templates/:id
export const getTemplate = async (req: Request, res: Response) => {
  const id = Number(req.params.id);
  if (isNaN(id)) throw new ApiError("Invalid template id", 400);

  const template = await emailTemplateService.getTemplateById(id);
  if (!template) throw new ApiError("Template not found", 404);

  res.status(200).json({ success: true, template });
};

// POST /email/templates
export const createTemplate = async (req: Request, res: Response) => {
  const { name, subject, htmlBody, textBody, createdById } = req.body;

  if (!name || !subject || !htmlBody) {
    throw new ApiError("name, subject and htmlBody are required", 400);
  }

  const template = await emailTemplateService.createTemplate(
    name,
    subject,
    htmlBody,
    textBody,
    createdById,
  );

  res.status(201).json({ success: true, template });
};

// PATCH /email/templates/:id
export const updateTemplate = async (req: Request, res: Response) => {
  const id = Number(req.params.id);
  if (isNaN(id)) throw new ApiError("Invalid template id", 400);

  const { name, subject, htmlBody, textBody, updatedById } = req.body;

  const template = await emailTemplateService.updateTemplate(id, {
    name,
    subject,
    htmlBody,
    textBody,
    updatedById,
  });

  res.status(200).json({ success: true, template });
};

// DELETE /email/templates/:id
export const deleteTemplate = async (req: Request, res: Response) => {
  const id = Number(req.params.id);
  if (isNaN(id)) throw new ApiError("Invalid template id", 400);

  await emailTemplateService.deleteTemplate(id);
  res.status(200).json({ success: true, message: "Template deleted" });
};
