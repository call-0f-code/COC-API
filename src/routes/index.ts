import { Router } from 'express'
import { Multer } from 'multer'
import { SupabaseClient } from '@supabase/supabase-js'
// import membersRouter from './members'
import projectsRouter from './projects'
import acheivementsRouter from './achievements'
import interviewRouter from './interviews'

// bakiche tumhi import kara mala kantala ala

export default function routes(upload: Multer, supabase: SupabaseClient) {
  const router = Router()

  // router.use('/members', membersRouter(upload, supabase))
  router.use('/projects', projectsRouter(upload, supabase))
  // router.use('/projects', projectsRouter(upload, supabase))
  router.use('/acheivements' ,acheivementsRouter(upload, supabase));
  router.use('/interviews', interviewRouter(upload, supabase));
  // … mount other routers, just write xyzRouter() if the routes in that router don't need multer or supabase

  return router
}

/*
write your routes like this, skip the paramaeters in the exported function if your routes don't need supabase and multer

import { Router } from 'express'
import { Multer } from 'multer'
import * as memberCtrl from '../controllers/member.controller'
import { SupabaseClient } from '@supabase/supabase-js'

export default function membersRouter(
  upload: Multer,
  supabase: SupabaseClient
) {
  const router = Router()

  // Photo upload endpoint:
  router.post(
    '/:memberId/photo',
    upload.single('photo'),
    (req, res, next) => memberCtrl.uploadPhoto(req, res, next, supabase)
  )

  return router
}

*/
