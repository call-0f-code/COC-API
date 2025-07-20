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

    //   Get all User
    /**
     * @api {get} /api/v1/projects Get all projects
     * @apiName getProjects
     * @apiGroup Project
     * 
     * @apiSuccess {Object{}} An array of all projects
    */
    router.get('/', getProjects)

    //  get Project by Id
    /**
     * @api {get} /api/v1/projects/:projectId Get specific project by its ID
     * @apiName getProjectById
     * @apiGroup Project
     * 
     * @apiParam {UUID} projectId ID of the project
     * @apiSuccess {object{}} Get single project whoes ID -> projectID
     * 
     * @apiError {object{}} No projects with such ID
     */
    router.get('/:projectId', getProjectById)

    //  Create project
    /**
     * @api {post} /api/v1/projects/create  Create the new Project
     * @apiName createProject
     * @apiGroup Project
     * 
     * @apiParam {Request body}  {string} Name of the project
     * @apiParam {Request body}  {string} Image usrl of project Photo
     * @apiParam {Request body}  {string} githubUrl of project
     * @apiParam {Request body}  {string} deploy link of project
     * @apiParam { UUID }       {string}   AdminID ID of the admin who create the project
     * 
     * @apiSuccess {object{}}   created project by the admin
     * 
     * @apiError { error 400}   some fields are missing 
     * @apiError { error 500}   error related to the db interaction
     */
    router.post('/create', createProject )

    //  Update Project
        /**
     * @api {patch} /api/v1/projects/:projectId/update  Update the projects with given project id
     * @apiName updateProjects
     * @apiGroup Project
     * 
     * @apiParam {Request body} ? {string} Name of the project
     * @apiParam {Request body}  ? {string} Image usrl of project Photo
     * @apiParam {Request body}  ? {string} githubUrl of project
     * @apiParam {Request body}  ? {string} deploy link of project
     * @apiParam { UUID }        {string}   AdminID ID of the admin who update the project
     * @apiParam { projectID }   {number}   projectID ID of the project 
     * 
     * @apiSuccess {object{}}   updated project by the admin
     * 
     * @apiError { error 400}   some fields are missing 
     * @apiError { error 500}   error related to the db interaction
     */
    router.patch('/:projectId/update', updateProjects )

    //  delete projects

    /**
     * @api {delete} /api/v1/projects/:projectId/delete Delete the project
     * @apiName deleteProjects
     * @apiGroup Project
     * 
     * @apiParam { projectId }  { number } projectID ID of the project to be delete
     * @apiParam { UUID }        {string}   AdminID ID of the admin who delete the project
     * 
     * @apiSuccess {Object{}} A deleted project
     * 
     * @apiError {error 400} Some fields are missing 
     * @apiError {error 500} Internal server error
     */
    router.delete('/:projectId/delete', deleteProjects )

    //  getMember by ProjectId
       /**
     * @api {get} /api/v1/projects/:projectId/members  Get members enroll in projects
     * @apiName getMembersBYProjectId
     * @apiGroup MemberProject
     * 
     * @apiParam { projectId }  { number } projectID ID of the project
     * 
     * @apiSuccess {Object{}}   array of member associated with projects
     * 
     * @apiError {error 400} Some fields are missing 
     * @apiError {error 500} Internal server error
     */

    router.get('/:projectId/members', getMembersByProjectId )

    //  add member to project
     /**
     * @api {post} /api/v1/projects/:projectId/members  add members into projects
     * @apiName addmembers
     * @apiGroup MemberProject
     * 
     * @apiParam { projectId }  { number } projectID ID of the project
     * @apiParam { Request body}  { array } constains the array of memberId
     * 
     * @apiSuccess {Object{}}   array of member added into projects
     * 
     * @apiError {error 400} Some fields are missing 
     * @apiError {error 500} Internal server error
     */


    router.post('/:projectId/members' , addMembers )

    //  Remover the memnber
     /**
     * @api {delete} /api/v1/projects/:projectId/members/:memberId  add members into projects
     * @apiName removeMembers
     * @apiGroup MemberProject
     * 
     * @apiParam { projectId }  { number } projectID ID of the project
     * @apiParam { memberId}  { string }   memberID ID of the member
     * 
     * @apiSuccess {Object{}}   member which are deleted
     * 
     * @apiError {error 400} Some fields are missing 
     * @apiError {error 500} Internal server error
     */
    
    router.delete( '/:projectId/members/:memberId', removeMembers)

    // Photo upload endpoint:
    //   router.post(
    //     '/:projectId/photo',
    //     upload.single('photo'),
    //     (req, res, next) => memberCtrl.uploadPhoto(req, res, next, supabase)
    //   )


    return router
}