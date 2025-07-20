import * as projectService from "../services/project.service";
import { Request ,  Response } from "express";
import { ApiError } from "../utils/apiError";
import { error } from "console";

export const getProjects = async ( req : Request , res : Response ) => {

        try {
                const projects = await projectService.getProjects();
                res.status(200).json(projects);
        } catch (error) {
                throw new ApiError( "No project found !!!" , 500)
        }
};

export const getProjectById = async ( req : Request , res : Response ) => {
    
        try{
            const projectId = parseInt( req.params.projectId );

            if( !projectId ) throw new ApiError( " Field is missing !!!" , 400);

            const project = await projectService.getProjectById( projectId );
            res.status(200).json(project);

        }catch(error){
                throw new ApiError("No project with this ID" , 500);
        }
};

export const createProject = async ( req : Request , res : Response ) => {

        try {
                    const projectContent = req.body;
                    const AdminId = req.body.AdminId;
                    if( projectContent.name.length === 0 || !projectContent.githubUrl || !AdminId || !projectContent.imageUrl) throw new ApiError( " Field is missing !!!" , 400);

                const project = await projectService.createProject(projectContent , AdminId);
                res.status(200).json(project);

        } catch (error) {
                throw new ApiError( error as string , 500);
        }
};

export const updateProjects = async ( req : Request , res : Response ) => {

        try {
            const projectInfo = req.body;
            const projectId = parseInt(req.params.projectId);
            const updatedById = req.body.updatedById;

            if( !projectId || projectInfo.length === 0 || !updatedById) throw new ApiError( " Send The project id " , 400);

             const project = await projectService.updateProjects( projectInfo  , projectId );
             res.status(200).json(project)

        } catch (error) {
            throw new ApiError(error as string , 500);
        }
}


export const deleteProjects = async ( req : Request , res : Response ) => {

    try {
             const projectId = parseInt(req.params.projectId);
            if( !projectId ) throw new ApiError( " Send The project id " , 400);

            const deleted = await projectService.deleteProjects( projectId );
            res.status(200).json(deleted)

    } catch (error) {
            throw new ApiError( error as string , 500);
    }
        
}

export const getMembersByProjectId = async ( req : Request , res : Response ) => {

    try {
                const projectId = parseInt( req.params.projectId );
                if( !projectId ) throw new ApiError( " Project Id required !!! " , 400);  

                const members = await projectService.getMembersByProjectId(projectId);
                res.status(200).json(members)

    } 
    catch (error) {
                     throw new ApiError( error as string , 500);
    }

    
}

export const addMembers = async ( req : Request , res : Response ) => {

    try {
                const  projectId = parseInt( req.params.projectId );
                const memberData = req.body.memberId;
                if( !projectId || !memberData ||  memberData.length === 0) throw new ApiError(" field is missing " , 400);

                const data  = memberData.map( (memberId: string) => ({
                projectId,
                memberId
            }))

             const member = await projectService.addMembers( data );
            res.status(200).json(member);

    } catch (error) {
          throw new ApiError( error as string , 500);
    }
}


export const removeMembers = async ( req : Request , res : Response ) => {
    
        try {
                const data = {
                projectId : parseInt ( req.params.projectId ),
                memberId :  req.body.memberId 
            }

        if( !data.projectId || !data.memberId) throw new ApiError(' Field is missing !!!' , 400);

        const removedMember  = await projectService.removeMembers(data);
        res.status(200).json( removedMember );

        } catch (error) {
                 throw new ApiError( error as string , 500);
        }
}

