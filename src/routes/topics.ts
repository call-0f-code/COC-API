import { Router } from 'express'
import { Multer } from 'multer'
import { SupabaseClient } from '@supabase/supabase-js'
import { createTopic, deleteTopic, getTopics, updateTopic } from '../controllers/topic.controller';
import { addQuestion, getQuestionByTopicId } from '../controllers/question.controller';


export default function topicRouter(
  upload: Multer,
  supabase: SupabaseClient
) {
  const router = Router()

//   get Topics
router.get('/' , getTopics);

// Create topics
router.post('/create' , createTopic);

// update Topics
router.patch('/:topicId/update' , updateTopic);

// delete topics
router.delete('/:topicId/delete' , deleteTopic)

// get Quetion by topic
router.get('/:topicId/questions' , getQuestionByTopicId);

// add qution on topic

router.post('/:topicId/questions' , addQuestion)

  // Photo upload endpoint:
//   router.post(
//     '/:memberId/photo',
//     upload.single('photo'),
//     (req, res, next) => memberCtrl.uploadPhoto(req, res, next, supabase)
//   )

  return router
}