import { Router } from 'express'
import { createTopic, deleteTopic, getTopics, updateTopic } from '../controllers/topic.controller';
import { addQuestion, getQuestionByTopicId } from '../controllers/question.controller';


export default function topicRouter() {
  const router = Router()

//   get Topics
router.get('/' , getTopics);

// Create topics
router.post('/' , createTopic);

// update Topics
router.patch('/:topicId' , updateTopic);

// delete topics
router.delete('/:topicId' , deleteTopic)

// get Quetion by topic
router.get('/:topicId/questions' , getQuestionByTopicId);

// add qution on topic

router.post('/:topicId/questions' , addQuestion)


  return router
}