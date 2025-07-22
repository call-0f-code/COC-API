import { Router } from 'express'
import { Multer } from 'multer'
import { SupabaseClient } from '@supabase/supabase-js'
import membersRouter from "./members";
import projectsRouter from './projects'
import acheivementsRouter from './achievements'
import interviewRouter from './interviews'
import topicRouter from './topics'
import quetionsRouter from './questions'
import progressRouter from './progress'

export default function routes(upload: Multer, supabase: SupabaseClient) {
  const router = Router();


  // … mount other routers, just write xyzRouter() if the routes in that router don't need multer or supabase
  router.use('/members', membersRouter(upload, supabase))

  router.use('/projects', projectsRouter(upload, supabase))

  router.use('/achievements' ,acheivementsRouter(upload, supabase));
  
  router.use('/interviews', interviewRouter(upload, supabase));
 
  router.use('/topics',topicRouter());

  router.use("/questions", quetionsRouter());

  router.use("/progress", progressRouter());

  return router;
}