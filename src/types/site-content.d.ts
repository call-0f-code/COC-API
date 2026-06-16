export {};

declare global {
  interface GalleryPhoto {
    id: string;
    imageUrl: string;
    caption?: string;
    altText?: string;
    sortOrder: number;
  }

  interface SiteActionItem {
    key: string;
    label: string | null;
    url: string | null;
    isVisible: boolean;
  }

  interface SiteContentResponse {
    actions: SiteActionItem[];
    hero: {
      imageUrl: string | null;
      caption: string | null;
      altText: string | null;
    };
    gallery: GalleryPhoto[];
  }

  interface UpdateSitePageContentInput {
    heroCaption?: string | null;
    heroAltText?: string | null;
    heroImageUrl?: string | null;
    updatedById: string;
  }

  interface UpdateSiteActionInput {
    label?: string | null;
    url?: string | null;
    isVisible?: boolean;
    updatedById: string;
  }

  interface CreateGalleryPhotoInput {
    imageUrl: string;
    caption?: string;
    altText?: string;
    sortOrder?: number;
    createdById: string;
  }

  interface UpdateGalleryPhotoInput {
    imageUrl?: string;
    caption?: string | null;
    altText?: string | null;
    sortOrder?: number;
    updatedById: string;
  }
}
