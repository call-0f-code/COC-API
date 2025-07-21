import { Router } from 'express'
import { getCompletedQuestion, toggleQuestions } from '../controllers/progress.controller'

export default function progressRouter() {
    const router = Router()
    
    /**
     * @api {get} /progress/:memberId/completed-questions Get Completed Questions
     * @apiName GetCompletedQuestions
     * @apiGroup Progress
     * 
     * @apiParam {String} memberId ID of the member to retrieve completed questions for.
     * 
     * @apiSuccess {String="SUCCESS"} status Response status.
     * @apiSuccess {Object[]} completedQuestion List of completed questions.
     * @apiSuccess {Number} completedQuestion.questionId Id of the completed question.
     * 
     * @apiError (Error 400) BadRequest Missing required fields.
     * @apiError (Error 500) InternalServerError Error while fetching completed questions.
     * 
     */
    router.get('/:memberId/completed-questions',getCompletedQuestion);

    /**
     * @api {patch} /progress/:memberId/questions/:questionId/completed/toggle Toggle Question Completion
     * @apiName ToggleQuestionCompletion
     * @apiGroup Progress
     * 
     * @apiParam {String} memberId ID of the member to toggle question completion for.
     * @apiParam {Number} questionId ID of the question to toggle completion for.
     * 
     * @apiSuccess {String="SUCCESS"} status Response status.
     * 
     * @apiError (Error 400) BadRequest Missing required fields.
     * @apiError (Error 500) InternalServerError Error while toggling question completion.
     */
    router.patch('/:memeberId/questions/:questionId/completed/toggle',toggleQuestions);

  return router;
}
