import {
  getSiteContent,
  updateSiteContent,
  updateSiteAction,
  addGalleryPhoto,
  deleteGalleryPhoto,
} from "../src/controllers/site-content.controller";
import * as siteContentService from "../src/services/site-content.service";
import { uploadImage, deleteImage } from "../src/utils/imageUtils";
import { ApiError } from "../src/utils/apiError";

jest.mock("../src/utils/supabaseClient", () => ({
  supabase: {
    storage: {
      from: jest.fn(() => ({
        upload: jest
          .fn()
          .mockResolvedValue({ data: { path: "fake-path" }, error: null }),
        remove: jest.fn().mockResolvedValue({ data: null, error: null }),
      })),
    },
  },
}));

jest.mock("../src/db/client", () => ({
  __esModule: true,
  default: {
    member: {
      findUnique: jest.fn(),
    },
    sitePageContent: {
      findUniqueOrThrow: jest.fn(),
      update: jest.fn(),
    },
    siteAction: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
    },
  },
}));

jest.mock("../src/utils/imageUtils", () => ({
  uploadImage: jest.fn(),
  deleteImage: jest.fn(),
}));

const mockedUploadImage = uploadImage as jest.Mock;
const mockedDeleteImage = deleteImage as jest.Mock;

afterEach(() => {
  jest.restoreAllMocks();
});

const mockContent: SiteContentResponse = {
  actions: [
    {
      key: "recruitment",
      isVisible: true,
      url: "https://forms.example.com/recruit",
      label: "Join Us",
    },
  ],
  hero: {
    imageUrl: "https://example.com/hero.jpg",
    caption: "Our team",
    altText: "Group photo",
  },
  gallery: [
    {
      id: "photo-1",
      imageUrl: "https://example.com/gallery-1.jpg",
      caption: "Event 2025",
      sortOrder: 0,
    },
  ],
};

describe("getSiteContent", () => {
  it("should return site content", async () => {
    const req: any = {};
    const res: any = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    jest
      .spyOn(siteContentService, "getSiteContent")
      .mockResolvedValue(mockContent);

    await getSiteContent(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      success: true,
      data: mockContent,
    });
  });
});

describe("updateSiteContent", () => {
  it("should update hero content for a manager", async () => {
    const req: any = {
      body: {
        siteContentData: {
          adminId: "manager-1",
          heroCaption: "Our team",
          heroAltText: "Group photo",
        },
      },
    };
    const res: any = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    jest
      .spyOn(siteContentService, "updateSitePageContent")
      .mockResolvedValue(mockContent);

    await updateSiteContent(req, res);

    expect(siteContentService.updateSitePageContent).toHaveBeenCalledWith(
      "manager-1",
      {
        heroCaption: "Our team",
        heroAltText: "Group photo",
        heroImageUrl: undefined,
      },
    );
    expect(res.status).toHaveBeenCalledWith(200);
  });

  it("should throw when adminId is missing", async () => {
    const req: any = {
      body: {
        siteContentData: {
          heroCaption: "Our team",
        },
      },
    };
    const res: any = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    await expect(updateSiteContent(req, res)).rejects.toThrow(
      new ApiError("adminId is required", 400),
    );
  });
});

describe("updateSiteAction", () => {
  it("should update a site action", async () => {
    const req: any = {
      params: { key: "recruitment" },
      body: {
        actionData: {
          adminId: "manager-1",
          isVisible: true,
          url: "https://forms.example.com/recruit",
          label: "Join Us",
        },
      },
    };
    const res: any = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    jest
      .spyOn(siteContentService, "updateSiteAction")
      .mockResolvedValue(mockContent);

    await updateSiteAction(req, res);

    expect(siteContentService.updateSiteAction).toHaveBeenCalledWith(
      "manager-1",
      "recruitment",
      {
        isVisible: true,
        url: "https://forms.example.com/recruit",
        label: "Join Us",
      },
    );
    expect(res.status).toHaveBeenCalledWith(200);
  });
});

describe("addGalleryPhoto", () => {
  it("should add a gallery photo and return updated content", async () => {
    const req: any = {
      file: {
        originalname: "event.png",
        buffer: Buffer.from("test"),
      },
      body: {
        photoData: {
          adminId: "manager-1",
          caption: "Hackathon",
          sortOrder: 1,
        },
      },
    };
    const res: any = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    mockedUploadImage.mockResolvedValue("https://example.com/event.jpg");
    jest
      .spyOn(siteContentService, "addGalleryPhoto")
      .mockResolvedValue(mockContent);

    await addGalleryPhoto(req, res);

    expect(siteContentService.addGalleryPhoto).toHaveBeenCalledWith(
      "manager-1",
      {
        imageUrl: "https://example.com/event.jpg",
        caption: "Hackathon",
        altText: undefined,
        sortOrder: 1,
      },
    );
    expect(res.status).toHaveBeenCalledWith(201);
  });
});

describe("deleteGalleryPhoto", () => {
  it("should delete a gallery photo and its image", async () => {
    const req: any = {
      params: { photoId: "photo-1" },
      body: { adminId: "manager-1" },
    };
    const res: any = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    jest
      .spyOn(siteContentService, "deleteGalleryPhoto")
      .mockResolvedValue("https://example.com/gallery-1.jpg");
    mockedDeleteImage.mockResolvedValue(undefined);

    await deleteGalleryPhoto(req, res);

    expect(siteContentService.deleteGalleryPhoto).toHaveBeenCalledWith(
      "manager-1",
      "photo-1",
    );
    expect(mockedDeleteImage).toHaveBeenCalledWith(
      expect.anything(),
      "https://example.com/gallery-1.jpg",
    );
    expect(res.status).toHaveBeenCalledWith(200);
  });
});

describe("site-content service guards", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should reject non-manager adminId", async () => {
    const prisma = (await import("../src/db/client")).default;

    (prisma.member.findUnique as jest.Mock).mockResolvedValue({
      isManager: false,
    });

    await expect(
      siteContentService.updateSiteAction("user-1", "recruitment", {
        isVisible: true,
        url: "https://example.com",
      }),
    ).rejects.toThrow(new ApiError("Forbidden: manager access required", 403));
  });

  it("should reject visible action without URL", async () => {
    const prisma = (await import("../src/db/client")).default;

    (prisma.member.findUnique as jest.Mock).mockResolvedValue({
      isManager: true,
    });
    (prisma.siteAction.findUnique as jest.Mock).mockResolvedValue({
      key: "recruitment",
      label: null,
      url: null,
      isVisible: false,
    });

    await expect(
      siteContentService.updateSiteAction("manager-1", "recruitment", {
        isVisible: true,
      }),
    ).rejects.toThrow(
      new ApiError("url is required when action is visible", 400),
    );
  });
});
