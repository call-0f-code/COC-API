import express from "express";
import * as memberCtrl from "../controllers/member.controller";
import { Multer } from "multer";
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
   *
   * @apiExample {curl} Example usage:
   *   curl -X GET http://localhost:3000/members/unapproved
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
    *
    * @apiExample {curl} Example usage:
    *   curl -X GET http://localhost:3000/members/123
    */
  router.get("/:memberId", memberCtrl.getUserDetails);
   
/**
   * @api {get} /members List all approved members or get member by email
   * @apiName ListAllApprovedMembers
   * @apiGroup Member
   *
   * @apiDescription
   * - Returns a list of all approved members if no email query parameter is provided.
   * - If `email` query parameter is provided, returns the member associated with that email.
   *
   * @apiQuery {String} [email] Optional email to fetch a specific member.
   *
   * @apiSuccess {Object} user Single user object when email provided.
   * @apiSuccess {Object[]} user Array of approved members when no email provided.
   * @apiSuccess {String} [message] Message in case of full list fetch.
   *
   * @apiError (400) IncorrectEmail The provided email does not match any user.
   *
   * @apiExample {curl} Example usage (list all):
   *   curl -X GET http://localhost:3000/members
   *
   * @apiExample {curl} Example usage (get by email):
   *   curl -X GET "http://localhost:3000/members?email=john@example.com"
   */
  router.get("/", memberCtrl.listAllApprovedMembers);

  /**
 * @api {post} /members Create a new member
 * @apiName CreateAMember
 * @apiGroup Member
 *
 * @apiBody {String} email Email of the member. (Required)
 * @apiBody {String} name Full name of the member. (Required)
 * @apiBody {String} password Member's password. (Required)
 * @apiBody {String} passoutYear Graduation year (Required, e.g., "2026").
 * @apiBody {String} provider Authentication provider (Required, e.g., "local", "google").
 * @apiBody {File} [file] Profile photo file (field name: "file").
 *
 * @apiSuccess {Boolean} success Request status.
 * @apiSuccess {Object}  user Created member object.
 *
 * @apiError (Error 400) ApiError Required fields absent.
 * @apiError (Error 500) ServerError Error creating user.
 *
 * @apiExample {curl} Example usage:
 *   curl -X POST -F "file=@profile.jpg" \
 *   -F "email=john@example.com" \
 *   -F "name=John Doe" \
 *   -F "password=securePass123" \
 *   -F "passoutYear=2026" \
 *   -F "provider=local" \
 *   http://localhost:3000/members
 */

  router.post("/", upload.single("file"), memberCtrl.createAMember(supabase));

  /**
 * @api {patch} /members/:memberId Update a member
 * @apiName UpdateAMember
 * @apiGroup Member
 *
 * @apiParam {String} memberId Member's unique ID.
 *
 * @apiBody {String} memberData JSON string containing the member's updated details.
 * @apiBody {File} [file] Profile photo file (field name: "file").
 *
 * @apiBody (memberData fields) {String} [name] Full name of the member.
 * @apiBody (memberData fields) {String} [email] Email address.
 * @apiBody (memberData fields) {String} [phone] Phone number.
 * @apiBody (memberData fields) {String} [bio] Short bio.
 * @apiBody (memberData fields) {String} [github] GitHub handle.
 * @apiBody (memberData fields) {String} [linkedin] LinkedIn handle.
 * @apiBody (memberData fields) {String} [twitter] Twitter handle.
 * @apiBody (memberData fields) {String} [geeksforgeeks] GeeksforGeeks username.
 * @apiBody (memberData fields) {String} [leetcode] LeetCode username.
 * @apiBody (memberData fields) {String} [codechef] CodeChef username.
 * @apiBody (memberData fields) {String} [codeforces] Codeforces username.
 * @apiBody (memberData fields) {Date}   [passoutYear] Graduation year (ISO string format).
 * @apiBody (memberData fields) {String} [profilePhoto] (Auto-assigned if a new file is uploaded).
 *
 * @apiSuccess {Boolean} success Request status.
 * @apiSuccess {Object}  user Updated member object.
 *
 * @apiError (Error 400) ApiError No memberId provided or invalid request data.
 * @apiError (Error 404) NotFound Member not found.
 * @apiError (Error 500) ServerError Unexpected error occurred during update.
 *
 * @apiExample {curl} Example usage:
 *   curl -X PATCH -F "file=@profile.jpg" \
 *   -F 'memberData={"name":"John Doe","email":"john@example.com"}' \
 *   http://localhost:3000/members/123
 */
  router.patch(
    "/:memberId",
    upload.single("file"),
    memberCtrl.updateAMember(supabase),
  );

  /**
   * @api {patch} /members/approve/:memberId Approve a member
   * @apiName UpdateApprovalRequest
   * @apiGroup Member
   *
   * @apiParam (URL Params) {String} memberId Member ID.
   * @apiBody {Boolean} isApproved Approval status (true = approved, false = rejected).
   * @apiBody {String} adminId ID of the admin who approved.
   *
   * @apiSuccess {Object} update Approval status update result.
   * @apiError (Error 400) BadRequest Missing required fields.
   *
   * @apiExample {curl} Example usage:
   *   curl -X PATCH http://localhost:3000/members/approve/123 \
   *   -H "Content-Type: application/json" \
   *   -d '{"isApproved": true, "adminId": "admin123"}'
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
   *
   * @apiExample {curl} Example usage:
   *   curl -X GET http://localhost:3000/members/123/achievements
   */
  router.get("/:memberId/achievements", memberCtrl.getUserAchievements);

  /**
   * @api {get} /members/:memberId/projects Get member's projects
   * @apiName GetUserProjects
   * @apiGroup Member
   *
   * @apiParam (URL Params) {String} memberId Member ID.
   *
   * @apiSuccess {Object[]} projects List of projects.
   *
   * @apiExample {curl} Example usage:
   *   curl -X GET http://localhost:3000/members/123/projects
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
   *
   * @apiExample {curl} Example usage:
   *   curl -X GET http://localhost:3000/members/123/interviews
   */
  router.get("/:memberId/interviews", memberCtrl.getUserInterviews);

  return router;
}