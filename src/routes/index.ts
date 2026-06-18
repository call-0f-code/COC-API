import { Router } from 'express'
import { Multer } from 'multer'
import { SupabaseClient } from '@supabase/supabase-js'
import projectsRouter from './projects'
import acheivementsRouter from './achievements'
import interviewRouter from './interviews'
import topicRouter from './topics'
import quetionsRouter from './questions'
import progressRouter from './progress'
import membersRouter from './members'
import siteContentRouter from './site-content'
import emailRouter from './email'

export default function routes(upload: Multer) {
  const router = Router();
  router.use('/members', membersRouter(upload))

  router.use('/projects', projectsRouter(upload))

  router.use('/achievements' ,acheivementsRouter(upload));
  
  router.use('/interviews', interviewRouter());
 
  router.use('/topics',topicRouter());

  router.use("/questions", quetionsRouter());

  router.use("/progress", progressRouter());

  router.use("/site-content", siteContentRouter(upload));
  router.use("/email", emailRouter());

  return router;
}

