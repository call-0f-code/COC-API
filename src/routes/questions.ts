import { Router } from 'express'
import { deleteQuestion, getQuestionByQuestionId, updateQuestion } from '../controllers/question.controller';


export default function quetionsRouter() {
  const router = Router()


  /**
   * @api {get} /questions/:questionId Get Question by ID
   * @apiName GetQuestionById
   * @apiGroup Question
   * 
   * @apiParam {Number} questionId Question ID to retrieve.
   * 
   * @apiSuccess {String="SUCCESS"} status  Response status.
   * @apiSuccess {Object} question question object.
   * @apiSuccess {Number} question.id Question ID.
   * @apiSuccess {String} question.questionName Name of the question.
   * @apiSuccess {String} question.link Link to the question.
   * @apiSuccess {String="Easy","Medium","Hard"} question.difficulty Difficulty level of the question.
   * @apiSuccess {Number} question.topicId Topic ID associated with the question.
   * @apiSuccess {number} question.createdAt Timestamp when the question was created.
   * @apiSuccess {number} question.updatedAt Timestamp when the question was last updated.
   * @apiSuccess {String} question.createdById ID of the user who created the question.
   * @apiSuccess {String} question.updatedById ID of the user who last updated the question.
   * 
   * 
   * @apiError (Error 400) BadRequest Missing required fields.
   * @apiError (Error 500) InternalServerError Error while getting question.
   */
  router.get('/:questionId' , getQuestionByQuestionId)

  /**
   * @api {patch} /questions/:questionId Update Question by ID
   * @apiName UpdateQuestionById
   * @apiGroup Question
   * 
   * @apiParam {Number} questionId Question ID to update.
   * 
   * @apiBody {Object} questionData Question data to update.
   * @apiBody {String} [questionData.questionName] Name of the question.
   * @apiBody {String} [questionData.link] Link to the question.
   * @apiBody {String="Easy","Medium","Hard"} [questionData.difficulty] Difficulty level of the question.
   * @apiBody {String} adminId ID of the admin updating the question.
   * 
   * @apiSuccess {String="SUCCESS"} status  Response status.
   * @apiSuccess {String="SUCCESS"} status  Response status.
   * @apiSuccess {Object} question question object.
   * @apiSuccess {Number} question.id Question ID.
   * @apiSuccess {String} question.questionName Name of the question.
   * @apiSuccess {String} question.link Link to the question.
   * @apiSuccess {String="Easy","Medium","Hard"} question.difficulty Difficulty level of the question.
   * @apiSuccess {Number} question.topicId Topic ID associated with the question.
   * @apiSuccess {number} question.createdAt Timestamp when the question was created.
   * @apiSuccess {number} question.updatedAt Timestamp when the question was last updated.
   * @apiSuccess {String} question.createdById ID of the user who created the question.
   * @apiSuccess {String} question.updatedById ID of the user who last updated the question.
   * 
   * @apiError (Error 400) BadRequest Missing required fields.
   * @apiError (Error 500) InternalServerError Error while updating question.
   */

  router.patch('/:questionId' , updateQuestion);

  /**
   * @api {delete} /questions/:questionId Delete Question by ID
   * @apiName DeleteQuestionById
   * @apiGroup Question
   * 
   * @apiParam {Number} questionId Question ID to delete.
   * 
   * @apiSuccess {String="SUCCESS"} status  Response status.
   * @apiSuccess {String} message Confirmation message
   * 
   * @apiError (Error 400)  BadRequest Missing required fields.
   * @apiError (Error 500) InternalServerError Error while deleting question.
   * 
   */
  router.delete('/:questionId' , deleteQuestion)

  return router
}