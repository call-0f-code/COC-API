import * as projectService from "../services/project.service";
import { Request, Response } from "express";
import { ApiError } from "../utils/apiError";
import { uploadImage } from "../utils/imageUtils";
import { supabase } from "../app";


export const getProjects = async (req: Request, res: Response) => {


  const projects = await projectService.getProjects();
  res.status(200).json(projects);

};


export const getProjectById = async (req: Request, res: Response) => {


  const projectId = parseInt(req.params.projectId);

  if (isNaN(projectId)) throw new ApiError("Invalid project ID", 400);

  const project = await projectService.getProjectById(projectId);
  res.status(200).json(project);


};

export const createProject = async (req: Request, res: Response) => {


  const file = req.file;
  if (!file) throw new ApiError('Image file not found', 400);

  const imageUrl = await uploadImage(supabase, file, 'projects');

  if (!imageUrl) throw new ApiError("Image url is missing", 400);

  if (!req.body.projectData.name || !req.body.projectData.githubUrl) throw new ApiError(" fiels is missing ", 400);

  const projectContent = {
    name: req.body.projectData.name,
    imageUrl: imageUrl,
    githubUrl: req.body.projectData.githubUrl,
    deployUrl: req.body.deployUrl,
    AdminId: req.body.projectData.adminId,
  };

  const project = await projectService.createProject(projectContent);
  res.status(200).json(project);

};

export const updateProjects = async (req: Request, res: Response) => {


  const projectInfo = req.body.projectData;
  const projectId = parseInt(req.params.projectId);
  const updatedById = projectInfo.updatedById;

  let imageUrl = null;
  const file = req.file;

  if (file) {
    imageUrl = await uploadImage(supabase, file, 'projects');
  }

  if (imageUrl) {
    projectInfo.imageUrl = imageUrl;
  }


  if (!projectId || projectInfo.length === 0 || !updatedById) throw new ApiError(" Something is Mising ", 400);

  const project = await projectService.updateProjects(projectInfo, projectId);
  res.status(200).json(project)


}

export const getMembersByProjectId = async (req: Request, res: Response) => {
  try {
    const projectId = parseInt(req.params.ProjectId);

    if (!projectId) throw new ApiError(" Project Id required !!! ", 401);

    const members = await projectService.getMembersByProjectId(projectId);
    res.json(members);
  } catch (error) {
    throw new ApiError(error as string, 404);
  }
};
export const deleteProjects = async (req: Request, res: Response) => {


  const projectId = parseInt(req.params.projectId);
  if (!projectId) throw new ApiError(" Send The project id ", 400);

  const deleted = await projectService.deleteProjects(projectId);
  res.status(200).json(deleted)

export const addMembers = async (req: Request, res: Response) => {
  try {
    const data = {
      projectId: parseInt(req.params.projectId),
      memberId: req.body.memberId,
    };

    const member = await projectService.addMembers(data);
    res.json(member);
  } catch (error) {
    console.log(error);
    throw new ApiError(error as string, 404);
  }
};

export const removeMembers = async (req: Request, res: Response) => {
  try {
    const data = {
      projectId: parseInt(req.params.projectId),
      memberId: req.body.memberId,
    };

}

export const getMembersByProjectId = async (req: Request, res: Response) => {


  const projectId = parseInt(req.params.projectId);
  if (!projectId) throw new ApiError(" Project Id required !!! ", 400);

  const members = await projectService.getMembersByProjectId(projectId);
  res.status(200).json(members)




}

export const addMembers = async (req: Request, res: Response) => {


  const projectId = parseInt(req.params.projectId);
  const memberData = req.body.memberId;
  if (!projectId || !memberData || memberData.length === 0) throw new ApiError(" field is missing ", 400);

  const data = memberData.map((memberId: string) => ({
    projectId,
    memberId
  }))

  const member = await projectService.addMembers(data);
  res.status(200).json(member);


}


export const removeMembers = async (req: Request, res: Response) => {


  const data = {
    projectId: parseInt(req.params.projectId),
    memberId: req.params.memberId
  }

  if (!data.projectId || !data.memberId) throw new ApiError(' Field is missing !!!', 400);

  const removedMember = await projectService.removeMembers(data);
  res.status(200).json(removedMember);


}
    const removedMember = await projectService.removeMembers(data);
    res.json(removedMember);
  } catch (error) {
    throw new ApiError(error as string, 404);
  }
};
