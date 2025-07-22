import { NextFunction, Request, Response, Router } from 'express'
import  { Multer }  from 'multer'
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


function parseCreateProjectData(req : Request, res : Response  , next : NextFunction) {
            
            if(req.body.projectData){
                    try{
                        const parse = JSON.parse(req.body.projectData);
                        req.body.projectData = parse;
                    }catch(e){
                        console.log(e);
                        return res.status(400).json({ message: 'Invalid JSON in projectData field' });
                    }
            }
            next();
}

export default function projectsRouter(
  upload: Multer,
  supabase: SupabaseClient,
) {
  const router = Router();

    //   Get all User
/**
 * @api {get} /api/v1/projects/ Get all projects
 * @apiName getProjects
 * @apiGroup Project
 *
 * @apiSuccess {Object[]} projects List of all projects
 *
 * @apiSuccessExample {json} Success-Response:
 * HTTP/1.1 200 OK
 * [
 *   {
 *     "id": 1,
 *     "name": "Project Alpha",
 *     "imageUrl": "https://example.com/image.png",
 *     "githubUrl": "https://github.com/org/project-alpha",
 *     "deployUrl": "https://project-alpha.example.com",
 *     "AdminId": "uuid-string",
 *     "createdAt": "2025-07-18T10:00:00Z",
 *     "updatedAt": "2025-07-18T10:00:00Z"
 *   },
 *   {
 *     "id": 2,
 *     "name": "Project Beta",
 *     ...
 *   }
 * ]
 *
 * @apiError (500) InternalServerError Failed to fetch projects from the database
 */

    router.get('/', getProjects)

    //  get Project by Id
/**
 * @api {get} /api/v1/projects/:projectId Get specific project by ID
 * @apiName getProjectById
 * @apiGroup Project
 * 
 * @apiParam (Path) {UUID} projectId ID of the project
 * 
 * @apiSuccess {Object} project The project object with the given ID
 * 
 * @apiError (404) NotFound No project found with the specified ID
 * @apiError (500) InternalServerError Database error or internal issue
 */

    router.get('/:projectId', getProjectById)

    //  Create project
/**
 * @api {post} /api/v1/projects/ Create a new project
 * @apiName createProject
 * @apiGroup Project
 * 
 * @apiParam (FormData) {String} name Name of the project
 * @apiParam (FormData) {File} image Image file for the project
 * @apiParam (FormData) {String} githubUrl GitHub URL of the project
 * @apiParam (FormData) {String} deployUrl Deployment link of the project
 * @apiParam (FormData) {UUID} AdminId ID of the admin creating the project
 * 
 * @apiSuccess {Object} project The created project object
 * 
 * @apiError (400) BadRequest Some fields are missing
 * @apiError (500) InternalServerError Database error or internal issue
 */

    router.post('/', upload.single('image') , parseCreateProjectData , createProject )

    //  Update Project
     /**
 * @api {patch} /api/v1/projects/:projectId Update a project
 * @apiName updateProjects
 * @apiGroup Project
 *
 * @apiParam (Path Params) {Number} projectId ID of the project to update
 * @apiParam (Body)        {String} [name] Name of the project (optional)
 * @apiParam (Body)        {String} [githubUrl] GitHub URL of the project (optional)
 * @apiParam (Body)        {String} [deployUrl] Deployment link of the project (optional)
 * @apiParam (Body)        {UUID}   adminId ID of the admin updating the project (required)
 * @apiParam (Form Data)   {File}   [image] Image file (optional)
 *
 * @apiSuccess {Object} project Updated project data
 *
 * @apiError (400) BadRequest Some required fields are missing or invalid
 * @apiError (500) InternalServerError Database error or unexpected issue
 */

    router.patch('/:projectId', upload.single('image') , parseCreateProjectData , updateProjects )

    //  delete projects

 /**
 * @api {delete} /api/v1/projects/:projectId Delete a project
 * @apiName deleteProjects
 * @apiGroup Project
 * 
 * @apiParam (Path Params) {Number}        projectId ID of the project to be deleted
 * 
 * @apiSuccess {Object} deletedProject Details of the deleted project
 * 
 * @apiError (400) BadRequest Some required fields are missing or invalid
 * @apiError (500) InternalServerError Internal server error
 */


    
    router.delete('/:projectId', deleteProjects )

  /**
 * @api {get} /api/v1/projects/:projectId/members Get members enrolled in a project
 * @apiName getMembersByProjectId
 * @apiGroup MemberProject
 * 
 * @apiParam (Path Params) {Number} projectId ID of the project
 * 
 * @apiSuccess {Object[]} members Array of members associated with the project
 * 
 * @apiError (400) BadRequest Some required fields are missing
 * @apiError (500) InternalServerError Internal server error
 */


    router.get('/:projectId/members', getMembersByProjectId )

   /**
 * @api {post} /api/v1/projects/:projectId/members Add members to a project
 * @apiName addMembers
 * @apiGroup MemberProject
 * 
 * @apiParam (Path Params) {Number} projectId ID of the project
 * @apiParam (Request Body) {UUID[]} memberIds Array of member IDs to add to the project
 * 
 * @apiSuccess {Number} count Number of members successfully added
 * 
 * @apiError (400) BadRequest Some required fields are missing
 * @apiError (500) InternalServerError Internal server error
 */


    router.post('/:projectId/members' , addMembers )

    //  Remover the memnber
   /**
 * @api {delete} /api/v1/projects/:projectId/members/:memberId Remove a member from a project
 * @apiName removeMember
 * @apiGroup MemberProject
 * 
 * @apiParam (Path Params) {Number} projectId ID of the project
 * @apiParam (Path Params) {UUID} memberId ID of the member to be removed
 * 
 * @apiSuccess {Object} member The member that was removed
 * 
 * @apiError (400) BadRequest Some required fields are missing
 * @apiError (500) InternalServerError Internal server error
 */

    
    router.delete( '/:projectId/members/:memberId', removeMembers)


  return router;
}
