import { Router } from "express";
import {
  getCompletedQuestion,
  toggleQuestions,
} from "../controllers/progress.controller";

export default function progressRouter() {
  const router = Router();

  /**
   * @api {get} /progress/:memberId/completed-questions Get Completed Questions
   * @apiName GetCompletedQuestions
   * @apiGroup Progress
   *
   * @apiParam {String} memberId ID of the member to retrieve completed questions for.
   *
   * @apiSuccess {String="SUCCESS"} status Response status.
   * @apiSuccess {Object[]} completedQuestion List of questions inside the topic.
   * @apiSuccess {Object} completedQuestion[].question Question object.
   * @apiSuccess {Number} completedQuestion[].question.id Question ID.
   * @apiSuccess {String} completedQuestion[].question.questionName Name of the question.
   * @apiSuccess {String} completedQuestion[].question.link Link to the question.
   * @apiSuccess {String="Easy","Medium","Hard"} completedQuestion[].question.difficulty Difficulty level of the question.
   * @apiSuccess {Number} completedQuestion[].question.topicId Topic ID associated with the question.
   * @apiSuccess {Number} completedQuestion[].question.createdAt Timestamp when the question was created (Unix timestamp).
   * @apiSuccess {Number} completedQuestion[].question.updatedAt Timestamp when the question was last updated (Unix timestamp).
   * @apiSuccess {String} completedQuestion[].question.createdById ID of the user who created the question.
   * @apiSuccess {String} completedQuestion[].question.updatedById ID of the user who last updated the question.
   *
   * @apiError (Error 400) BadRequest Missing required fields.
   * @apiError (Error 500) InternalServerError Error while fetching completed questions.
   *
   */
  router.get("/:memberId/completed-questions", getCompletedQuestion);

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
  router.patch(
    "/:memberId/questions/:questionId/completed/toggle",
    toggleQuestions,
  );

  return router;
}
