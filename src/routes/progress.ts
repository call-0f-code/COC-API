import { Router } from 'express'
import { getCompletedQuestion, toggleQuestions } from '../controllers/progress.controller'

export default function progressRouter() {
    const router = Router()

    router.get('/:memberId/completed-questions',getCompletedQuestion);

    router.patch('/:memeberId/questions/:questionId/completed/toggle',toggleQuestions);

    return router
}