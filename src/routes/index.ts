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

export default function routes(upload: Multer, supabase: SupabaseClient) {
  const router = Router();

  router.use('/members', membersRouter(upload, supabase))

  router.use('/projects', projectsRouter(upload, supabase))

  router.use('/achievements' ,acheivementsRouter(upload, supabase));
  
  router.use('/interviews', interviewRouter(upload, supabase));
 
  router.use('/topics',topicRouter());

  router.use("/questions", quetionsRouter());

  router.use("/progress", progressRouter());

  return router;
}

