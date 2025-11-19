import express from 'express';
import * as interviewCtrl from '../controllers/interview.controller';


export default function interviewRouter() {
    const router = express.Router();

/**
 * @api {get} /interviews Get all interview experiences (Paginated + Optional Filtering)
 * @apiName getInterviews
 * @apiGroup Interview
 *
 * @apiDescription
 * Fetches a paginated list of all interview experiences.
 * Filtering by verdict is optional.  
 * 
 * - When `verdict=All` (default) → No filtering, return *all* interview experiences.
 * - When `verdict=Selected/Rejected/Pending` → Filter by that verdict.
 *
 *
 * @apiParam {Number{1..}} [page=1] Page number (must be >= 1)
 * @apiParam {Number{1..100}} [limit=10] Number of records per page (1–100)
 * @apiParam {String="All","Selected","Rejected","Pending"} [verdict="All"]
 *        If set to "All", no filtering is applied.
 *
 *
 * @apiSuccess {Boolean} success Indicates success
 * @apiSuccess {Object[]} data List of interview experiences (formatted)
 * @apiSuccess {Number} page Current page number
 * @apiSuccess {Number} limit Number of items per page
 * @apiSuccess {String} verdict The applied verdict filter ("All" means no filtering)
 * @apiSuccess {Number} total Total number of interviews matching the filter
 * @apiSuccess {Number} totalPages Total number of pages
 *
 *
 * @apiSuccessExample {json} Success-Response:
 * HTTP/1.1 200 OK
 * {
 *   "success": true,
 *   "data": [
 *     {
 *       "id": 45,
 *       "company": "Google",
 *       "role": "SDE Intern",
 *       "verdict": "Selected",
 *       "content": "Great experience...",
 *       "isAnonymous": false,
 *       "member": {
 *         "id": "uuid-123",
 *         "name": "John Doe",
 *         "profilePhoto": "https://cdn.com/photo.jpg"
 *       }
 *     },
 *     {
 *       "id": 42,
 *       "company": "Amazon",
 *       "role": "Backend Engineer",
 *       "verdict": "Rejected",
 *       "content": "Challenging rounds...",
 *       "isAnonymous": true
 *       // member not returned because isAnonymous = true
 *     }
 *   ],
 *   "page": 1,
 *   "limit": 10,
 *   "verdict": "All",
 *   "total": 240,
 *   "totalPages": 24
 * }
 *
 *
 * @apiError (400) BadRequest Invalid page, limit, or verdict
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
   * @apiBody (Request Body) {String} company Name of the company
   * @apiBody (Request Body) {String} role Role applied for
   * @apiBody (Request Body) {String="Selected","Rejected","Pending"} verdict Result of the interview
   * @apiBody (Request Body) {String} content Experience content
   * @apiBody (Request Body) {Boolean} isAnonymous Whether the post is anonymous
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
   * @apiBody (Request Body) {UUID} memberId Member ID of the owner
   * @apiBody (Request Body) {String} [company] Company name
   * @apiBody (Request Body) {String} [role] Role
   * @apiBody (Request Body) {String="Selected","Rejected","Pending"} [verdict] Interview result
   * @apiBody (Request Body) {String} [content] Experience content
   * @apiBody (Request Body) {Boolean} [isAnonymous] Anonymous flag
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
   * @apiBody (Request Body) {UUID} memberId Member ID of the owner
   * @apiError (400) BadRequest Invalid interview ID
   * @apiError (404) NotFound Interview not found
   * @apiError (500) InternalServerError Internal server error
   */
    router.delete('/:id',interviewCtrl.deleteInterviewById);

    return router
}