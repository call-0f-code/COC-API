import { Router } from 'express'
import { Multer } from 'multer'
import { SupabaseClient } from '@supabase/supabase-js'
// import membersRouter from './members'
import projectsRouter from './projects'
// bakiche tumhi import kara mala kantala ala

export default function routes(upload: Multer, supabase: SupabaseClient) {
  const router = Router()

  // router.use('/members', membersRouter(upload, supabase))
  router.use('/projects', projectsRouter(upload, supabase))
  // … mount other routers, just write xyzRouter() if the routes in that router don't need multer or supabase

  return router
}

