import { Request, Response } from "express";
import * as siteContentService from "../services/site-content.service";
import { uploadImage, deleteImage } from "../utils/imageUtils";
import { supabase } from "../utils/supabaseClient";
import { ApiError } from "../utils/apiError";

function parseSiteContentData(body: Record<string, unknown>) {
  let siteContentData = body.siteContentData ?? body;

  if (typeof siteContentData === "string") {
    try {
      siteContentData = JSON.parse(siteContentData);
    } catch {
      throw new ApiError("Invalid JSON in siteContentData field", 400);
    }
  }

  return siteContentData as Record<string, unknown>;
}

function parseActionData(body: Record<string, unknown>) {
  let actionData = body.actionData ?? body;

  if (typeof actionData === "string") {
    try {
      actionData = JSON.parse(actionData);
    } catch {
      throw new ApiError("Invalid JSON in actionData field", 400);
    }
  }

  return actionData as Record<string, unknown>;
}

function parsePhotoData(body: Record<string, unknown>) {
  let photoData = body.photoData ?? body;

  if (typeof photoData === "string") {
    try {
      photoData = JSON.parse(photoData);
    } catch {
      throw new ApiError("Invalid JSON in photoData field", 400);
    }
  }

  return photoData as Record<string, unknown>;
}

export const getSiteContent = async (_req: Request, res: Response) => {
  const content = await siteContentService.getSiteContent();

  res.status(200).json({
    success: true,
    data: content,
  });
};

export const updateSiteContent = async (req: Request, res: Response) => {
  const siteContentData = parseSiteContentData(req.body);
  const adminId = siteContentData.adminId as string | undefined;

  if (!adminId) {
    throw new ApiError("adminId is required", 400);
  }

  const file = req.file;
  let heroImageUrl: string | undefined;

  if (file) {
    const current = await siteContentService.getSiteContent();
    heroImageUrl = await uploadImage(
      supabase,
      file,
      "group-photos",
      current.hero.imageUrl ?? undefined,
    );
  }

  const content = await siteContentService.updateSitePageContent(adminId, {
    heroCaption: siteContentData.heroCaption as string | null | undefined,
    heroAltText: siteContentData.heroAltText as string | null | undefined,
    heroImageUrl,
  });

  res.status(200).json({
    success: true,
    data: content,
  });
};

export const updateSiteAction = async (req: Request, res: Response) => {
  const key = req.params.key;
  if (!key) {
    throw new ApiError("Action key is required", 400);
  }

  const actionData = parseActionData(req.body);
  const adminId = actionData.adminId as string | undefined;

  if (!adminId) {
    throw new ApiError("adminId is required", 400);
  }

  const content = await siteContentService.updateSiteAction(adminId, key, {
    label: actionData.label as string | null | undefined,
    url: actionData.url as string | null | undefined,
    isVisible: actionData.isVisible as boolean | undefined,
  });

  res.status(200).json({
    success: true,
    data: content,
  });
};

export const addGalleryPhoto = async (req: Request, res: Response) => {
  const file = req.file;
  if (!file) {
    throw new ApiError("Image file is required", 400);
  }

  const photoData = parsePhotoData(req.body);
  const adminId = photoData.adminId as string | undefined;

  if (!adminId) {
    throw new ApiError("adminId is required", 400);
  }

  const imageUrl = await uploadImage(supabase, file, "group-photos");
  if (!imageUrl) {
    throw new ApiError("Image URL is missing", 400);
  }

  const content = await siteContentService.addGalleryPhoto(adminId, {
    imageUrl,
    caption: photoData.caption as string | undefined,
    altText: photoData.altText as string | undefined,
    sortOrder: photoData.sortOrder as number | undefined,
  });

  res.status(201).json({
    success: true,
    data: content,
  });
};

export const updateGalleryPhoto = async (req: Request, res: Response) => {
  const photoId = req.params.photoId;
  if (!photoId) {
    throw new ApiError("Photo ID is required", 400);
  }

  const photoData = parsePhotoData(req.body);
  const adminId = photoData.adminId as string | undefined;

  if (!adminId) {
    throw new ApiError("adminId is required", 400);
  }

  const file = req.file;
  let imageUrl: string | undefined;

  if (file) {
    const existing = await siteContentService.getGalleryPhoto(adminId, photoId);
    imageUrl = await uploadImage(
      supabase,
      file,
      "group-photos",
      existing.imageUrl,
    );
  }

  const hasUpdate =
    imageUrl !== undefined ||
    photoData.caption !== undefined ||
    photoData.altText !== undefined ||
    photoData.sortOrder !== undefined;

  if (!hasUpdate) {
    throw new ApiError(
      "At least one field (image, caption, altText, or sortOrder) must be provided",
      400,
    );
  }

  const { content, previousImageUrl } =
    await siteContentService.updateGalleryPhoto(adminId, photoId, {
      imageUrl,
      caption: photoData.caption as string | null | undefined,
      altText: photoData.altText as string | null | undefined,
      sortOrder: photoData.sortOrder as number | undefined,
    });

  if (previousImageUrl) {
    await deleteImage(supabase, previousImageUrl);
  }

  res.status(200).json({
    success: true,
    data: content,
  });
};

export const deleteGalleryPhoto = async (req: Request, res: Response) => {
  const photoId = req.params.photoId;
  const adminId = req.body.adminId as string | undefined;

  if (!photoId) {
    throw new ApiError("Photo ID is required", 400);
  }

  if (!adminId) {
    throw new ApiError("adminId is required", 400);
  }

  const imageUrl = await siteContentService.deleteGalleryPhoto(adminId, photoId);
  await deleteImage(supabase, imageUrl);

  res.status(200).json({
    success: true,
    message: "Gallery photo deleted successfully",
  });
};
