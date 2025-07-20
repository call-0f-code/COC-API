import { Router } from 'express'
import { deleteQuestion, getQuestionByQuestionId, updateQuestion } from '../controllers/question.controller';


export default function quetionsRouter() {
  const router = Router()

//   get quetions on questionId

router.get('/:questionId' , getQuestionByQuestionId)

// update quition by questionID

router.patch('/:questionId' , updateQuestion);

// delete question by ID
router.delete('/:questionId' , deleteQuestion)

  return router
}