import { Router } from 'express'
import { createTopic, deleteTopic, getTopics, updateTopic } from '../controllers/topic.controller';
import { addQuestion, getQuestionByTopicId } from '../controllers/question.controller';


export default function topicRouter() {
  const router = Router()

  /**
   * @api {get} /topics Get all Topics
   * @apiName GetTopics
   * @apiGroup Topic
   * 
   * @apiSuccess {String="SUCCESS"} status Response status.
   * @apiSuccess {Object[]} topics list of all topics
   * @apiSuccess {Number} topics[].topic.id Topic ID.
   * @apiSuccess {String} topics[].topic.title Title of the topic.
   * @apiSuccess {String} topics[].topic.description Description of the topic.
   * @apiSuccess {number} topics[].topic.createdAt Timestamp when the topic was created.
   * @apiSuccess {number} topics[].topic.updatedAt Timestamp when the topic was last updated.
   * @apiSuccess {String} topics[].topic.createdById ID of the user who created the topic.
   * @apiSuccess {String} topics[].topic.updatedById ID of the user who last updated the topic.
   */
  
  router.get('/' , getTopics);

  /**
   * @api {post} /topics Create new Topics
   * @apiName CreateTopic
   * @apiGroup Topic
   * 
   * @apiBody {String} title title of the topic.
   * @apiBody {String} description description of the topic.
   * @apiBody {String} adminId ID of the admin creating the topic.
   * 
   * @apiSuccess {Object[]} questions List of questions inside the topic.
   * @apiSuccess {Object} questions[].question Question object.
   * @apiSuccess {Number} questions[].question.id Question ID.
   * @apiSuccess {String} questions[].question.questionName Name of the question.
   * @apiSuccess {String} questions[].question.link Link to the question.
   * @apiSuccess {String="Easy","Medium","Hard"} questions[].question.difficulty Difficulty level of the question.
   * @apiSuccess {Number} questions[].question.topicId Topic ID associated with the question.
   * @apiSuccess {Number} questions[].question.createdAt Timestamp when the question was created (Unix timestamp).
   * @apiSuccess {Number} questions[].question.updatedAt Timestamp when the question was last updated (Unix timestamp).
   * @apiSuccess {String} questions[].question.createdById ID of the user who created the question.
   * @apiSuccess {String} questions[].question.updatedById ID of the user who last updated the question.
   * 
   * @apiError (Error 400) BadRequest Missing required fields.
   */
  router.post('/' , createTopic);

  /**
   * @api {patch} /topics/:topicId Update Topic
   * @apiName UpdateTopic
   * @apiGroup Topic
   * 
   * @apiParam {Number} topicId ID of the topic to update.
   * @apiBody {String} adminId ID of the admin updating the topic.
   * @apiBody {Object} updateData Data to update the topic.
   * @apiBody {String} [updateData.title] Title of the topic.
   * @apiBody {String} [updateData.description] Description of the topic.
   * 
   * @apiSuccess {String="SUCCESS"} status Response status.
   * @apiSuccess {Object} updatedTopic Updated Topic object.
   * @apiSuccess {Number} updatedTopic.id Topic ID.
   * @apiSuccess {String} updatedTopic.title Title of the topic.
   * @apiSuccess {String} updatedTopic.description Description of the topic.
   * @apiSuccess {number} updatedTopic.createdAt Timestamp when the topic was created.
   * @apiSuccess {number} updatedTopic.updatedAt Timestamp when the topic was last updated.
   * @apiSuccess {String} updatedTopic.createdById ID of the user who created the topic.
   * @apiSuccess {String} updatedTopic.updatedById ID of the user who last updated the topic.
   * 
   * @apiError (Error 400) BadRequest Missing required fields.                               
   */
  router.patch('/:topicId' , updateTopic);

  /**
   * @api {delete} /topics/:topicId Delete Topic
   * @apiName deleteTopic
   * @apiGroup Topic
   * 
   * @apiParam {Number} topicId ID of the topic to delete.
   * 
   * @apiSuccess {String} message Confirmation message
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
   */
  router.delete('/:topicId' , deleteTopic)

  /**
   * @api {get} /topics/:topicId/questions Get question by topic
   * @apiName getQuestionByTopicId
   * @apiGroup Topic
   * 
   * @apiParam {Number} topicId ID of the topic to retrieve questions from.
   * 
   * @apiSuccess {String="SUCCESS"} status  Response status.
   * @apiSuccess {Object[]} questions List of questions inside the topic.
   * @apiSuccess {Object} questions[].question Question object.
   * @apiSuccess {Number} questions[].question.id Question ID.
   * @apiSuccess {String} questions[].question.questionName Name of the question.
   * @apiSuccess {String} questions[].question.link Link to the question.
   * @apiSuccess {String="Easy","Medium","Hard"} questions[].question.difficulty Difficulty level of the question.
   * @apiSuccess {Number} questions[].question.topicId Topic ID associated with the question.
   * @apiSuccess {Number} questions[].question.createdAt Timestamp when the question was created (Unix timestamp).
   * @apiSuccess {Number} questions[].question.updatedAt Timestamp when the question was last updated (Unix timestamp).
   * @apiSuccess {String} questions[].question.createdById ID of the user who created the question.
   * @apiSuccess {String} questions[].question.updatedById ID of the user who last updated the question.
   * 
   * @apiError (Error 400) BadRequest Missing required fields. 
   * 
   */
  router.get('/:topicId/questions' , getQuestionByTopicId);

  
  /**
   * @api {post} /topics/:topicId/questions add Question to a topic
   * @apiName addQuestion
   * @apiGroup Topic
   * 
   * @apiParam {Number} topicId ID of the topic to add the question to.
   * 
   * @apiBody {String} questionName Name of the question.
   * @apiBody {String} link Link to the question.
   * @apiBody {String="Easy","Medium","Hard"} difficulty Difficulty level of the question.
   * @apiBody {String} adminId ID of the admin adding the question.
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
   * @apiError (Error 400) BadRequest Missing required fields.
   * @apiError (Error 500) InternalServerError Error while adding question.
   * 
   */
  router.post('/:topicId/questions' , addQuestion)


  return router
}