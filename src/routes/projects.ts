import { Router } from 'express'
import { Multer } from 'multer'
import { SupabaseClient } from '@supabase/supabase-js'
import {
    addMembers,
    createProject,
    deleteProjects,
    getMembersByProjectId,
    getProjectById,
    getProjects,
    removeMembers,
    updateProjects
} from '../controllers/project.controller'



export default function projectsRouter(
    upload: Multer,
    supabase: SupabaseClient
) {
    const router = Router()

    //   Getting all User
    router.get('/', getProjects)

    //  get Project by Id
    router.get('/:projectId', getProjectById)

    //  Create project
    router.post('/create', createProject )

    //  Update Project
    router.patch('/:projectId', updateProjects )

    //  delete projects
    router.delete('/:projectId', deleteProjects )

    //  getMember by ProjectId

    router.get('/:projectId/members', getMembersByProjectId )

    //  add member to project

    router.post('/:projectId/members' , addMembers )

    //  Remover the memnber
    
    router.delete( '/:projectId/members/:memberId', removeMembers)

    // Photo upload endpoint:
    //   router.post(
    //     '/:projectId/photo',
    //     upload.single('photo'),
    //     (req, res, next) => memberCtrl.uploadPhoto(req, res, next, supabase)
    //   )


    return router
}