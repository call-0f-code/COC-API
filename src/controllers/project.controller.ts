import * as projectService from "../services/project.service";
import { Request, Response } from "express";
import { ApiError } from "../utils/apiError";

export const getProjects = async (req: Request, res: Response) => {
  try {
    const projects = await projectService.getPrjects();
    res.json(projects);
  } catch (error) {
    throw new ApiError("No project found !!!", 404);
  }
};

export const getProjectById = async (req: Request, res: Response) => {
  try {
    const projectId = parseInt(req.params.projectId);
    const project = await projectService.getProjectById(projectId);
    res.json(project);
  } catch (error) {
    throw new ApiError("No project with this ID", 404);
  }
};

export const createProject = async (req: Request, res: Response) => {
  try {
    const projectContent = {
      name: req.body.name,
      imageUrl: req.body.imageUrl,
      githubUrl: req.body.githubUrl,
      deployUrl: req.body.deployUrl,
      adminId: req.AdminId,
    };

    const project = await projectService.createProject(projectContent);
    res.json(project);
  } catch (error) {
    throw new ApiError(error as string, 404);
  }
};

export const updateProjects = async (req: Request, res: Response) => {
  try {
    const projectInfo = req.body;
    const projectId = parseInt(req.params.projectId);
    if (!projectId) throw new ApiError(" Send The project id ", 401);

    const project = await projectService.updateProjects(projectInfo, projectId);
    res.json(project);
  } catch (error) {
    throw new ApiError(error as string, 404);
  }
};

export const deleteProjects = async (req: Request, res: Response) => {
  try {
    const projectId = parseInt(req.params.projectId);
    if (!projectId) throw new ApiError(" Send The project id ", 401);

    const deleted = await projectService.deleteProjects(projectId);
    res.json(deleted);
  } catch (error) {
    console.log(error);
    throw new ApiError(error as string, 404);
  }
};

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

    const removedMember = await projectService.removeMembers(data);
    res.json(removedMember);
  } catch (error) {
    throw new ApiError(error as string, 404);
  }
};
