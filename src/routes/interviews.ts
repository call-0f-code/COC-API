import express from 'express';
import * as interviewCtrl from '../controllers/interview.controller';
import { supabase } from '../app';
import { Multer } from 'multer';
import { NextFunction } from 'express-serve-static-core';
import { SupabaseClient } from '@supabase/supabase-js';



export default function interviewRouter(upload: Multer, supabase: SupabaseClient) {
    const router = express.Router();

    /**
   * @api {get} /interviews Get all interview experiences
   * @apiName getInterviews
   * @apiGroup Interview
   *
   * @apiSuccess {Object[]} interviews List of all interview experiences
   * @apiSuccessExample {json} Success-Response:
   * HTTP/1.1 200 OK
   * {
   *   "success": true,
   *   "data": [
   *     {
   *       "id": 1,
   *       "company": "Google",
   *       "role": "SDE Intern",
   *       "verdict": "Selected",
   *       "content": "It was amazing...",
   *       "isAnonymous": false,
   *       "memberId": "uuid-string"
   *     }
   *   ]
   * }
   *
   * @apiError (500) InternalServerError Failed to fetch interviews from the database
   */
    router.get('/', interviewCtrl.getInterviews);



   /**
   * @api {get} /interviews/:id Get interview experience by ID
   * @apiName getInterviewById
   * @apiGroup Interview
   *
   * @apiParam (Path Params) {Number} id Interview ID
   *
   * @apiSuccess {Object} interview The interview experience object
   *
   * @apiError (400) BadRequest Invalid interview ID
   * @apiError (404) NotFound Interview not found
   * @apiError (500) InternalServerError Internal server error
   */
    router.get('/:id', interviewCtrl.getInterviewById);



    /**
   * @api {post} /interviews/:memberId Create a new interview experience
   * @apiName createInterview
   * @apiGroup Interview
   *
   * @apiParam (Path Params) {UUID} memberId ID of the member sharing the interview
   * @apiParam (Request Body) {String} company Name of the company
   * @apiParam (Request Body) {String} role Role applied for
   * @apiParam (Request Body) {String="Selected","Rejected","Pending"} verdict Result of the interview
   * @apiParam (Request Body) {String} content Experience content
   * @apiParam (Request Body) {Boolean} isAnonymous Whether the post is anonymous
   *
   * @apiSuccess {Object} interview Created interview experience
   *
   * @apiError (400) BadRequest Missing or invalid fields
   * @apiError (500) InternalServerError Internal server error
   */
    router.post('/:memberId', interviewCtrl.createInterview);

  /**
   * @api {patch} /interviews/:id Update an interview experience
   * @apiName updateInterview
   * @apiGroup Interview
   *
   * @apiParam (Path Params) {Number} id Interview ID to update
   * @apiParam (Request Body) {UUID} memberId Member ID of the owner
   * @apiParam (Request Body) {String} [company] Company name
   * @apiParam (Request Body) {String} [role] Role
   * @apiParam (Request Body) {String="Selected","Rejected","Pending"} [verdict] Interview result
   * @apiParam (Request Body) {String} [content] Experience content
   * @apiParam (Request Body) {Boolean} [isAnonymous] Anonymous flag
   *
   * @apiSuccess {Object} interview Updated interview experience
   *
   * @apiError (400) BadRequest Invalid input or missing memberId
   * @apiError (403) Forbidden Not authorized to update this interview
   * @apiError (404) NotFound Interview not found
   * @apiError (500) InternalServerError Internal server error
   */
    router.patch('/:id',interviewCtrl.updateInterviewById);


  /**
   * @api {delete} /interviews/:id Delete an interview experience
   * @apiName deleteInterview
   * @apiGroup Interview
   *
   * @apiParam (Path Params) {Number} id Interview ID to delete
   *
   * @apiSuccess {String} message Deletion confirmation
   *
   * @apiError (400) BadRequest Invalid interview ID
   * @apiError (404) NotFound Interview not found
   * @apiError (500) InternalServerError Internal server error
   */
    router.delete('/:id',interviewCtrl.deleteInterviewById);

    return router
}