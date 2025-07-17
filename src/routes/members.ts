import express from 'express';
import * as memberCtrl from '../controllers/member.controller';
import { supabase } from '../app';
import { Multer } from 'multer';
import { SupabaseClient } from '@supabase/supabase-js';
import { injectSupabase } from '../controllers/supabase.controller';


export default function membersRouter(upload: Multer, supabase: SupabaseClient) {
  const router = express.Router();

/**
 * @api {post} /api/members/details Get a member's details
 * @apiName GetUserDetails
 * @apiGroup Member
 *
 * @apiParam {String} memberId Unique ID of the member.
 *
 * @apiSuccess {Object} member Full member object.
 * @apiError (Error 500) InternalServerError No memberId provided.
 */
router.get('/details/:memberId', memberCtrl.getUserDetails);


/**
 * @api {get} /api/members/approved List all approved members
 * @apiName ListAllApprovedMembers
 * @apiGroup Member
 *
 * @apiSuccess {Object[]} members List of approved members.
 */
router.get('/', memberCtrl.listAllApprovedMembers);


/**
 * @api {post} /api/members Create a new member
 * @apiName CreateAMember
 * @apiGroup Member
 *
 * @apiParam (Request body) {String} email Member email.
 * @apiParam (Request body) {String} name Member full name.
 * @apiParam (Request body) {String} password Password.
 * @apiParam (Request body) {String} passoutYear Year of passing out.
 *
 * @apiSuccess {Object} user The created member.
 * @apiError (Error 402) ValidationError Required fields are missing.
 */
router.post('/', memberCtrl.createAMember);

/**
 * @api {patch} /api/members Update member info
 * @apiName UpdateAMember
 * @apiGroup Member
 * @apiParam (Request params) {String} MemberId.
 * @apiParam (Request body) {Object} Member fields to update.
 *
 * @apiSuccess {Object} member Updated member object.
 * @apiError (Error 403) Forbidden Member not authorized.
 * @apiError (Error 500) InternalServerError Something went wrong.
 */
router.patch('/:memberId', memberCtrl.updateAMember);

/**
 * @api {get} /api/members/unapproved List unapproved members
 * @apiName GetUnapprovedMembers
 * @apiGroup Member
 *
 * @apiSuccess {Object[]} members List of unapproved members.
 */
router.get('/unapproved', memberCtrl.getUnapprovedMembers);

/**
 * @api {patch} /api/members/approve Update approval request
 * @apiName UpdateApprovalRequest
 * @apiGroup Member
 *
 * @apiParam (Request body) {Boolean} isApproved Approval status.
 * @apiParam (Request body) {String} memberId Member ID.
 *
 * @apiSuccess {String} message Approval status updated.
 * @apiError (Error 500) ValidationError Missing memberId or status.
 */
router.patch('/approve/:memberId', memberCtrl.updateRequest);

/**
 * @api {post} /api/members/achievements Get user achievements
 * @apiName GetUserAchievements
 * @apiGroup Member
 *
 * @apiParam (Request params) {String} memberId Member ID.
 *
 * @apiSuccess {Object[]} achievements List of achievements.
 * @apiError (Error 500) ValidationError No memberId provided.
 */
router.get('/achievements/:memberId', memberCtrl.getUserAchievements);

/**
 * @api {post} /api/members/projects Get user projects
 * @apiName GetUserProjects
 * @apiGroup Member
 *
 * @apiParam (Request params) {String} memberId Member ID.
 *
 * @apiSuccess {Object[]} projects List of projects.
 * @apiError (Error 500) ValidationError No memberId provided.
 */
router.get('/projects/:memberId', memberCtrl.getUserProjects);

/**
 * @api {post} /api/members/interviews Get user interviews
 * @apiName GetUserInterviews
 * @apiGroup Member
 *
 * @apiParam (Request params) {String} memberId Member ID.
 *
 * @apiSuccess {Object[]} interviews List of interviews.
 * @apiError (Error 500) ValidationError No memberId provided.
 */
router.get('/interviews/:memberId', memberCtrl.getUserInterviews);

/**
   * @api {post} /api/v1/members/:memberId/photo Upload profile photo
   * @apiName UploadProfilePhoto
   * @apiGroup Member
   *
   * @apiParam (URL Params) {String} memberId The ID of the member.
   * @apiParam (FormData) {File} photo The profile picture file to upload.
   *
   * @apiSuccess {String} url The public URL of the uploaded profile picture.
   *
   * @apiError (Error 400) BadRequest Missing or invalid file.
   * @apiError (Error 404) NotFound Member not found.
   * @apiError (Error 500) InternalServerError Failed to upload image.
   */
  router.post('/photo/:memberId',
    upload.single("file"),
    injectSupabase(supabase, "member")

  );

    return router
}