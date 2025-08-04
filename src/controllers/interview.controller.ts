import { Request, Response } from "express";
import * as interviewService from "../services/interview.service";
import { ApiError } from "../utils/apiError";

export const getInterviews = async (req: Request, res: Response) => {
  const interviews = await interviewService.getInterviews();

  res.status(200).json({
    success: true,
    data: interviews,
  });
};

export const getInterviewById = async (req: Request, res: Response) => {
  const interviewId = parseInt(req.params.id);

  if (!interviewId) {
    throw new ApiError("Invalid interview ID", 400);
  }

  const interview = await interviewService.getInterviewById(interviewId);

  if (!interview) {
    throw new ApiError("Interview experience not found", 404);
  }

  res.status(200).json({
    success: true,
    data: interview,
  });
};


export const createInterview = async (req: Request, res: Response) => {
  const memberId = req.params.memberId;

  if (!memberId) {
    throw new ApiError("Member ID is required", 400);
  }

  const { company, role, verdict, content, isAnonymous } = req.body;

  if (!company || !role || !verdict || !content || isAnonymous === undefined) {
    throw new ApiError("All fields are required", 400);
  }

  const interview = await interviewService.createInterview(memberId, {
    company,
    role,
    verdict,
    content,
    isAnonymous,
  });

  res.status(201).json({
    success: true,
    data: interview,
  });
};

export const updateInterviewById = async (req: Request, res: Response) => {
  const interviewId = parseInt(req.params.id);

  if (!interviewId) {
    throw new ApiError("Invalid interview ID", 400);
  }

  const { memberId, company, role, verdict, content, isAnonymous } = req.body;

  if (!memberId) {
    throw new ApiError("Member ID is required for verification", 400);
  }

  if(!company && !role && !verdict && !content && !isAnonymous){
    throw new ApiError("Atleast one field is required for update", 400);
  }

  const existingInterview = await interviewService.getInterviewById(interviewId);

  if (!existingInterview) {
    throw new ApiError("Interview experience not found", 404);
  }

  if (existingInterview.memberId !== memberId) {
    throw new ApiError("You are not authorized to update this interview experience", 403);
  }

  const updatedInterview = await interviewService.updateInterviewById(interviewId, {
    memberId,
    company,
    role,
    verdict,
    content,
    isAnonymous,
  });

  res.status(200).json({
    success: true,
    data: updatedInterview,
  });
};


export const deleteInterviewById = async (req: Request, res: Response) => {
  const interviewId = parseInt(req.params.id);
  const { memberId } = req.body;

  if (!interviewId) {
    throw new ApiError("Invalid interview ID", 400);
  }

  if (!memberId) {
    throw new ApiError("Member ID is required for verification", 400);
  }

  const existingInterview = await interviewService.getInterviewById(interviewId);

  if (!existingInterview) {
    throw new ApiError("Interview experience not found", 404);
  }

  
  if (existingInterview.memberId !== memberId) {
    throw new ApiError("You are not authorized to delete this interview", 403);
  }

  await interviewService.deleteInterviewById(interviewId);

  res.status(200).json({
    success: true,
    message: "Interview experience deleted successfully",
  });
};

