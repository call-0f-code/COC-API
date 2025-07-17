import { Router } from 'express'
import { Multer } from 'multer'
import { SupabaseClient } from '@supabase/supabase-js'
// import { createTopic, deleteTopic, getTopics, updateTopic } from '../controllers/topic.controller';
import { deleteQuestion, getQuestionByQuestionId, updateQuestion } from '../controllers/question.controller';


export default function quetionsRouter(
  upload: Multer,
  supabase: SupabaseClient
) {
  const router = Router()

//   get quetions on questionId

router.get('/:questionId' , getQuestionByQuestionId)

// update quition by questionID

router.patch('/:questionId/update' , updateQuestion);

// delete question by ID
router.delete('/:questionId' , deleteQuestion)


  

  return router
}