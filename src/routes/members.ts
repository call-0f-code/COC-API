import express from "express";
import * as memberCtrl from "../controllers/member.controller";
import { Multer } from "multer";
import { supabase } from "../app";
import { SupabaseClient } from "@supabase/supabase-js";

export default function membersRouter(
  upload: Multer,
  supabase: SupabaseClient,
) {
  const router = express.Router();

  /**
   * @api {get} /members/unapproved Get unapproved members
   * @apiName GetUnapprovedMembers
   * @apiGroup Member
   *
   * @apiSuccess {Object[]} unapprovedMembers List of unapproved members.
   */
  router.get("/unapproved", memberCtrl.getUnapprovedMembers);
  
  /**
   * @api {get} /members/:memberId Get a member's details
   * @apiName GetUserDetails
   * @apiGroup Member
   *
   * @apiParam (URL Params) {String} memberId Member's unique ID.
   *
   * @apiSuccess {Object} user Member object.
   * @apiError (Error 400) BadRequest No memberId provided.
   */
  router.get("/:memberId", memberCtrl.getUserDetails);

  /**
   * @api {get} /members List all approved members or get member by email
   * @apiName ListAllApprovedMembers
   * @apiGroup Member
   *
   *  @apiDescription
   * - Returns a list of all approved members if no email query parameter is provided.
   * - If `email` query parameter is provided, returns the member associated with that email.
   *
   *  @apiQuery {String} [email] Optional email to fetch a specific member.
   *
   * @apiSuccess {Object} user Single user object when email provided.
+  * @apiSuccess {Object[]} user Array of approved members when no email provided.
   * @apiSuccess {String} [message] Message in case of full list fetch.
   *
   * @apiError (400) IncorrectEmail The provided email does not match any user.
   */
  router.get("/", memberCtrl.listAllApprovedMembers);

  /**
   * @api {post} /members Create a new member
   * @apiName CreateAMember
   * @apiGroup Member
   *
   * @apiBody {String} email Email of the member.
   * @apiBody {String} name Full name of the member.
   * @apiBody {String} password Member's password.
   * @apiBody {String} passoutYear Graduation year.
   * @apiBody {String}  imageUrl profile photo of the member.
   *
   * @apiSuccess {Object} user Created member object.
   * @apiError (Error 402) ValidationError Required fields missing.
   */
  router.post("/", upload.single("file"), memberCtrl.createAMember(supabase));

  /**
   * @api {patch} /members/:memberId Update a member
   * @apiName UpdateAMember
   * @apiGroup Member
   *
   * @apiParam {String} memberId Member's unique ID.
   *
   * @apiBody {File} [file] Profile photo file (field name: "file").
   * @apiBody {String} [name] Full name of the member.
   * @apiBody {String} [email] Email address.
   * @apiBody {String} [phone] Phone number.
   * @apiBody {String} [bio] Short bio.
   * @apiBody {String} [github] GitHub handle.
   * @apiBody {String} [linkedin] LinkedIn handle.
   * @apiBody {String} [twitter] Twitter handle.
   * @apiBody {String} [geeksforgeeks] GeeksforGeeks username.
   * @apiBody {String} [leetcode] LeetCode username.
   * @apiBody {String} [codechef] CodeChef username.
   * @apiBody {String} [codeforces] Codeforces username.
   * @apiBody {Date}   [passoutYear] Graduation year (ISO string format).
   *
   * @apiSuccess {Object} member Updated member object.
   * @apiError (Error 404) NotFound Member not found.
   * @apiError (Error 400) ValidationError Invalid or missing fields.
   * @apiError (Error 500) ServerError Unexpected error occurred during update.
   */
  router.patch(
    "/:memberId",
    upload.single("file"),
    memberCtrl.updateAMember(supabase),
  );

  /**
   * @api {patch} /members/approve/:memberId Approve/reject a member
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
   * @api {get} /members/:memberId/achievements Get member's achievements
   * @apiName GetUserAchievements
   * @apiGroup Member
   *
   * @apiParam (URL Params) {String} memberId Member ID.
   *
   * @apiSuccess {Object[]} achievements List of achievements.
   */
  router.get("/:memberId/achievements", memberCtrl.getUserAchievements);

  /**
   * @api {get} /api/members/:memberId/projects Get member's projects
   * @apiName GetUserProjects
   * @apiGroup Member
   *
   * @apiParam (URL Params) {String} memberId Member ID.
   *
   * @apiSuccess {Object[]} projects List of projects.
   */
  router.get("/:memberId/projects", memberCtrl.getUserProjects);

  /**
   * @api {get} /members/:memberId/interviews Get member's interviews
   * @apiName GetUserInterviews
   * @apiGroup Member
   *
   * @apiParam (URL Params) {String} memberId Member ID.
   *
   * @apiSuccess {Object[]} interviews List of interviews.
   */
  router.get("/:memberId/interviews", memberCtrl.getUserInterviews);

  return router;
}