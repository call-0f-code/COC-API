import { v4 as uuidv4 } from "uuid";
import prisma from "../db/client";
import { ApiError } from "../utils/apiError";
import { Prisma } from "../generated/prisma/client";

const PAGE_CONTENT_ID = 1;

function toGalleryJson(gallery: GalleryPhoto[]): Prisma.InputJsonValue {
  return gallery as unknown as Prisma.InputJsonValue;
}

async function assertManager(adminId: string) {
  const member = await prisma.member.findUnique({
    where: { id: adminId },
    select: { isManager: true },
  });

  if (!member?.isManager) {
    throw new ApiError("Forbidden: manager access required", 403);
  }
}

function parseGalleryPhotos(value: unknown): GalleryPhoto[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value
    .filter(
      (item): item is GalleryPhoto =>
        typeof item === "object" &&
        item !== null &&
        typeof (item as GalleryPhoto).id === "string" &&
        typeof (item as GalleryPhoto).imageUrl === "string" &&
        typeof (item as GalleryPhoto).sortOrder === "number",
    )
    .sort((a, b) => a.sortOrder - b.sortOrder);
}

function toSiteContentResponse(
  page: {
    heroImageUrl: string | null;
    heroCaption: string | null;
    heroAltText: string | null;
    galleryPhotos: unknown;
  },
  actions: {
    key: string;
    label: string | null;
    url: string | null;
    isVisible: boolean;
  }[],
): SiteContentResponse {
  return {
    actions: actions.map(({ key, label, url, isVisible }) => ({
      key,
      label,
      url,
      isVisible,
    })),
    hero: {
      imageUrl: page.heroImageUrl,
      caption: page.heroCaption,
      altText: page.heroAltText,
    },
    gallery: parseGalleryPhotos(page.galleryPhotos),
  };
}

async function getPageContent() {
  return prisma.sitePageContent.findUniqueOrThrow({
    where: { id: PAGE_CONTENT_ID },
  });
}

async function getActions() {
  return prisma.siteAction.findMany({
    orderBy: { key: "asc" },
  });
}

async function buildSiteContentResponse(): Promise<SiteContentResponse> {
  const [page, actions] = await Promise.all([getPageContent(), getActions()]);
  return toSiteContentResponse(page, actions);
}

export async function getSiteContent(): Promise<SiteContentResponse> {
  return buildSiteContentResponse();
}

export async function updateSitePageContent(
  adminId: string,
  data: Omit<UpdateSitePageContentInput, "updatedById">,
) {
  await assertManager(adminId);

  const page = await prisma.sitePageContent.update({
    where: { id: PAGE_CONTENT_ID },
    data: {
      heroCaption: data.heroCaption,
      heroAltText: data.heroAltText,
      heroImageUrl: data.heroImageUrl,
      updatedById: adminId,
    },
  });

  const actions = await getActions();
  return toSiteContentResponse(page, actions);
}

export async function updateSiteAction(
  adminId: string,
  key: string,
  data: Omit<UpdateSiteActionInput, "updatedById">,
) {
  await assertManager(adminId);

  const current = await prisma.siteAction.findUnique({ where: { key } });
  if (!current) {
    throw new ApiError("Site action not found", 404);
  }

  const isVisible = data.isVisible ?? current.isVisible;
  const url = data.url !== undefined ? data.url : current.url;

  if (isVisible && !url) {
    throw new ApiError("url is required when action is visible", 400);
  }
  console.log(key)
  await prisma.siteAction.update({
    where: { key },
    data: {
      label: data.label,
      url: data.url,
      isVisible: data.isVisible,
      updatedById: adminId,
    },
  });

  return buildSiteContentResponse();
}

export async function addGalleryPhoto(
  adminId: string,
  data: Omit<CreateGalleryPhotoInput, "createdById">,
) {
  await assertManager(adminId);

  const current = await getPageContent();
  const gallery = parseGalleryPhotos(current.galleryPhotos);

  const photo: GalleryPhoto = {
    id: uuidv4(),
    imageUrl: data.imageUrl,
    caption: data.caption,
    altText: data.altText,
    sortOrder:
      data.sortOrder ??
      (gallery.length > 0
        ? Math.max(...gallery.map((p) => p.sortOrder)) + 1
        : 0),
  };

  await prisma.sitePageContent.update({
    where: { id: PAGE_CONTENT_ID },
    data: {
      galleryPhotos: toGalleryJson([...gallery, photo]),
      updatedById: adminId,
    },
  });

  return buildSiteContentResponse();
}

export async function updateGalleryPhoto(
  adminId: string,
  photoId: string,
  data: Omit<UpdateGalleryPhotoInput, "updatedById">,
) {
  await assertManager(adminId);

  const current = await getPageContent();
  const gallery = parseGalleryPhotos(current.galleryPhotos);
  const index = gallery.findIndex((photo) => photo.id === photoId);

  if (index === -1) {
    throw new ApiError("Gallery photo not found", 404);
  }

  const existing = gallery[index];
  gallery[index] = {
    ...existing,
    imageUrl: data.imageUrl ?? existing.imageUrl,
    caption:
      data.caption !== undefined ? (data.caption ?? undefined) : existing.caption,
    altText:
      data.altText !== undefined ? (data.altText ?? undefined) : existing.altText,
    sortOrder: data.sortOrder ?? existing.sortOrder,
  };

  await prisma.sitePageContent.update({
    where: { id: PAGE_CONTENT_ID },
    data: {
      galleryPhotos: toGalleryJson(
        gallery.sort((a, b) => a.sortOrder - b.sortOrder),
      ),
      updatedById: adminId,
    },
  });

  return {
    content: await buildSiteContentResponse(),
    previousImageUrl:
      data.imageUrl && data.imageUrl !== existing.imageUrl
        ? existing.imageUrl
        : undefined,
  };
}

export async function deleteGalleryPhoto(adminId: string, photoId: string) {
  await assertManager(adminId);

  const current = await getPageContent();
  const gallery = parseGalleryPhotos(current.galleryPhotos);
  const photo = gallery.find((item) => item.id === photoId);

  if (!photo) {
    throw new ApiError("Gallery photo not found", 404);
  }

  await prisma.sitePageContent.update({
    where: { id: PAGE_CONTENT_ID },
    data: {
      galleryPhotos: toGalleryJson(gallery.filter((item) => item.id !== photoId)),
      updatedById: adminId,
    },
  });

  return photo.imageUrl;
}

export async function getGalleryPhoto(adminId: string, photoId: string) {
  await assertManager(adminId);

  const current = await getPageContent();
  const gallery = parseGalleryPhotos(current.galleryPhotos);
  const photo = gallery.find((item) => item.id === photoId);

  if (!photo) {
    throw new ApiError("Gallery photo not found", 404);
  }

  return photo;
}
