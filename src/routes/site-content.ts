import express from "express";
import { Multer } from "multer";
import { Request, Response, NextFunction } from "express";
import * as siteContentCtrl from "../controllers/site-content.controller";

function parseSiteContentData(req: Request, res: Response, next: NextFunction) {
  if (req.body.siteContentData) {
    try {
      req.body.siteContentData = JSON.parse(req.body.siteContentData);
    } catch {
      return res
        .status(400)
        .json({ message: "Invalid JSON in siteContentData field" });
    }
  }
  next();
}

function parsePhotoData(req: Request, res: Response, next: NextFunction) {
  if (req.body.photoData) {
    try {
      req.body.photoData = JSON.parse(req.body.photoData);
    } catch {
      return res.status(400).json({ message: "Invalid JSON in photoData field" });
    }
  }
  next();
}

function parseActionData(req: Request, res: Response, next: NextFunction) {
  if (req.body.actionData) {
    try {
      req.body.actionData = JSON.parse(req.body.actionData);
    } catch {
      return res.status(400).json({ message: "Invalid JSON in actionData field" });
    }
  }
  next();
}

export default function siteContentRouter(upload: Multer) {
  const router = express.Router();

  /**
   * @api {get} /site-content Get published site content
   * @apiName getSiteContent
   * @apiGroup SiteContent
   *
   * @apiSuccess {Boolean} success Request status
   * @apiSuccess {Object} data Site content including actions, hero, and gallery
   * @apiError (500) InternalServerError Failed to fetch site content
   */
  router.get("/", siteContentCtrl.getSiteContent);

  /**
   * @api {patch} /site-content Update site content
   * @apiName updateSiteContent
   * @apiGroup SiteContent
   *
   * @apiBody (FormData) {File} [image] Optional hero image file
   * @apiBody (FormData) {String} siteContentData JSON string of fields:
   *   - adminId: string (required)
   *   - heroCaption?: string
   *   - heroAltText?: string
   *
   * @apiSuccess {Boolean} success Request status
   * @apiSuccess {Object} data Updated site content
   * @apiError (400) BadRequest Missing or invalid data
   * @apiError (403) Forbidden Manager access required
   * @apiError (500) InternalServerError Server error
   */
  router.patch(
    "/",
    upload.single("image"),
    parseSiteContentData,
    siteContentCtrl.updateSiteContent,
  );

  /**
   * @api {patch} /site-content/actions/:key Update a site action
   * @apiName updateSiteAction
   * @apiGroup SiteContent
   *
   * @apiParam (Path Params) {String} key Action key (e.g. recruitment)
   * @apiBody {String} adminId ID of the manager (required)
   * @apiBody {String} [label] Button label
   * @apiBody {String} [url] Action URL
   * @apiBody {Boolean} [isVisible] Whether the action is visible
   *
   * @apiSuccess {Boolean} success Request status
   * @apiSuccess {Object} data Updated site content
   * @apiError (400) BadRequest Missing or invalid data
   * @apiError (403) Forbidden Manager access required
   * @apiError (404) NotFound Site action not found
   * @apiError (500) InternalServerError Server error
   */
  router.patch(
    "/actions/:key",
    parseActionData,
    siteContentCtrl.updateSiteAction,
  );

  /**
   * @api {post} /site-content/gallery Add a gallery photo
   * @apiName addGalleryPhoto
   * @apiGroup SiteContent
   *
   * @apiBody (FormData) {File} image Image file
   * @apiBody (FormData) {String} photoData JSON string of fields:
   *   - adminId: string (required)
   *   - caption?: string
   *   - altText?: string
   *   - sortOrder?: number
   *
   * @apiSuccess {Boolean} success Request status
   * @apiSuccess {Object} data Updated site content
   * @apiError (400) BadRequest Missing or invalid data
   * @apiError (403) Forbidden Manager access required
   * @apiError (500) InternalServerError Server error
   */
  router.post(
    "/gallery",
    upload.single("image"),
    parsePhotoData,
    siteContentCtrl.addGalleryPhoto,
  );

  /**
   * @api {patch} /site-content/gallery/:photoId Update a gallery photo
   * @apiName updateGalleryPhoto
   * @apiGroup SiteContent
   *
   * @apiParam (Path Params) {String} photoId Gallery photo ID
   * @apiBody (FormData) {File} [image] Optional new image
   * @apiBody (FormData) {String} photoData JSON string of fields:
   *   - adminId: string (required)
   *   - caption?: string
   *   - altText?: string
   *   - sortOrder?: number
   *
   * @apiSuccess {Boolean} success Request status
   * @apiSuccess {Object} data Updated site content
   * @apiError (400) BadRequest Missing or invalid data
   * @apiError (403) Forbidden Manager access required
   * @apiError (404) NotFound Gallery photo not found
   * @apiError (500) InternalServerError Server error
   */
  router.patch(
    "/gallery/:photoId",
    upload.single("image"),
    parsePhotoData,
    siteContentCtrl.updateGalleryPhoto,
  );

  /**
   * @api {delete} /site-content/gallery/:photoId Delete a gallery photo
   * @apiName deleteGalleryPhoto
   * @apiGroup SiteContent
   *
   * @apiParam (Path Params) {String} photoId Gallery photo ID
   * @apiBody {String} adminId ID of the manager performing the delete
   *
   * @apiSuccess {Boolean} success Request status
   * @apiSuccess {String} message Deletion confirmation
   * @apiError (400) BadRequest Missing or invalid data
   * @apiError (403) Forbidden Manager access required
   * @apiError (404) NotFound Gallery photo not found
   * @apiError (500) InternalServerError Server error
   */
  router.delete("/gallery/:photoId", siteContentCtrl.deleteGalleryPhoto);

  return router;
}
