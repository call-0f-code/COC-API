import express from "express";
import * as memberCtrl from "../controllers/member.controller";
import { supabase } from "../app";
import { Multer } from "multer";
import { SupabaseClient } from "@supabase/supabase-js";
import { injectSupabase } from "../controllers/supabase.controller";

export default function membersRouter(
  upload: Multer,
  supabase: SupabaseClient,
) {
  const router = express.Router();

  /**
   * @api {get} /api/members/details/:memberId Get a member's details
   * @apiName GetUserDetails
   * @apiGroup Member
   *
   * @apiParam (URL Params) {String} memberId Member's unique ID.
   *
   * @apiSuccess {Object} user Member object.
   * @apiError (Error 400) BadRequest No memberId provided.
   */
  router.get("/details/:memberId", memberCtrl.getUserDetails);

  /**
   * @api {get} /api/members List all approved members
   * @apiName ListAllApprovedMembers
   * @apiGroup Member
   *
   * @apiSuccess {Object[]} user List of approved members.
   */
  router.get("/", memberCtrl.listAllApprovedMembers);

  /**
   * @api {post} /api/members Create a new member
   * @apiName CreateAMember
   * @apiGroup Member
   *
   * @apiBody {String} email Email of the member.
   * @apiBody {String} name Full name of the member.
   * @apiBody {String} password Member's password.
   * @apiBody {String} passoutYear Graduation year.
   *
   * @apiSuccess {Object} user Created member object.
   * @apiError (Error 402) ValidationError Required fields missing.
   */
  router.post("/", memberCtrl.createAMember);

  /**
   * @api {patch} /api/members/:memberId Update member information
   * @apiName UpdateAMember
   * @apiGroup Member
   *
   * @apiParam (URL Params) {String} memberId Member ID.
   * @apiBody {Object} fields Fields to update.
   *
   * @apiSuccess {String} message Member updated successfully.
   * @apiError (Error 400) BadRequest Invalid member ID.
   */
  router.patch("/:memberId", memberCtrl.updateAMember);

  /**
   * @api {get} /api/members/unapproved Get unapproved members
   * @apiName GetUnapprovedMembers
   * @apiGroup Member
   *
   * @apiSuccess {Object[]} unapprovedMembers List of unapproved members.
   */
  router.get("/unapproved", memberCtrl.getUnapprovedMembers);

  /**
   * @api {patch} /api/members/approve/:memberId Approve/reject a member
   * @apiName UpdateApprovalRequest
   * @apiGroup Member
   *
   * @apiParam (URL Params) {String} memberId Member ID.
   * @apiBody {Boolean} isApproved Approval status.
   * @apiBody {String} adminId Admin who approved.
   *
   * @apiSuccess {Object} update Approval status updated.
   * @apiError (Error 400) BadRequest Missing required fields.
   */
  router.patch("/approve/:memberId", memberCtrl.updateRequest);

  /**
   * @api {get} /api/members/achievements/:memberId Get member's achievements
   * @apiName GetUserAchievements
   * @apiGroup Member
   *
   * @apiParam (URL Params) {String} memberId Member ID.
   *
   * @apiSuccess {Object[]} achievements List of achievements.
   */
  router.get("/achievements/:memberId", memberCtrl.getUserAchievements);

  /**
   * @api {get} /api/members/projects/:memberId Get member's projects
   * @apiName GetUserProjects
   * @apiGroup Member
   *
   * @apiParam (URL Params) {String} memberId Member ID.
   *
   * @apiSuccess {Object[]} projects List of projects.
   */
  router.get("/projects/:memberId", memberCtrl.getUserProjects);

  /**
   * @api {get} /api/members/interviews/:memberId Get member's interviews
   * @apiName GetUserInterviews
   * @apiGroup Member
   *
   * @apiParam (URL Params) {String} memberId Member ID.
   *
   * @apiSuccess {Object[]} interviews List of interviews.
   */
  router.get("/interviews/:memberId", memberCtrl.getUserInterviews);

  /**
   * @api {post} /api/members/photo/upload/:memberId Upload profile photo
   * @apiName UploadProfilePhoto
   * @apiGroup Member
   *
   * @apiParam (URL Params) {String} memberId Member ID.
   * @apiBody {File} file Profile picture file.
   *
   * @apiSuccess {String} message Image uploaded successfully.
   * @apiError (Error 400) BadRequest No file or invalid memberId.
   */
  router.post(
    "/photo/upload/:memberId",
    upload.single("file"),
    injectSupabase(supabase, "members", "update"),
  );

  /**
   * @api {patch} /api/members/photo/update/:memberId Update profile photo
   * @apiName UpdateProfilePhoto
   * @apiGroup Member
   *
   * @apiParam (URL Params) {String} memberId Member ID.
   * @apiBody {File} file New profile picture file.
   *
   * @apiSuccess {String} message Profile picture updated.
   * @apiError (Error 400) BadRequest Missing or invalid file.
   */
  router.patch(
    "/photo/update/:memberId",
    upload.single("file"),
    injectSupabase(supabase, "members", "update"),
  );

  /**
   * @api {patch} /api/members/photo/delete/:memberId Delete profile photo
   * @apiName DeleteProfilePhoto
   * @apiGroup Member
   *
   * @apiParam (URL Params) {String} memberId Member ID.
   *
   * @apiSuccess {String} message Profile picture deleted.
   * @apiError (Error 400) BadRequest No profile picture found.
   */
  router.patch(
    "/photo/delete/:memberId",
    upload.single("file"),
    injectSupabase(supabase, "members", "delete"),
  );


  return router;
}
