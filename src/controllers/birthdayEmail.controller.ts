import { Request, Response } from "express";
import * as birthdayEmailService from "../services/birthdayEmail.service";
import { ApiError } from "../utils/apiError";

/**
 * POST /api/v1/birthday-emails/initialize
 */
export async function initializeJobs(req: Request, res: Response): Promise<void> {
  const { birthdayYear, memberIds } = req.body || {};

  if (typeof birthdayYear !== "number") {
    throw new ApiError("birthdayYear is required and must be a number", 400);
  }

  if (!Array.isArray(memberIds)) {
    throw new ApiError("memberIds is required and must be an array of strings", 400);
  }

  const result = await birthdayEmailService.initializeBirthdayJobs(
    birthdayYear,
    memberIds
  );

  res.status(200).json({
    success: true,
    message: "Birthday jobs initialized",
    data: result,
  });
}

/**
 * POST /api/v1/birthday-emails/claim
 */
export async function claimJobs(req: Request, res: Response): Promise<void> {
  const { batchSize, leaseDurationMs } = req.body || {};

  const jobs = await birthdayEmailService.claimBirthdayJobs(
    typeof batchSize === "number" ? batchSize : 10,
    typeof leaseDurationMs === "number" ? leaseDurationMs : 300000
  );

  res.status(200).json({
    success: true,
    count: jobs.length,
    jobs,
  });
}

/**
 * POST /api/v1/birthday-emails/:id/sent
 */
export async function markJobSent(req: Request, res: Response): Promise<void> {
  const { id } = req.params;
  const { lockToken, providerMessageId, sentAt } = req.body || {};

  if (!lockToken || typeof lockToken !== "string") {
    throw new ApiError("lockToken is required in request body", 400);
  }

  const result = await birthdayEmailService.recordBirthdayJobSent(
    id,
    lockToken,
    providerMessageId,
    sentAt
  );

  res.status(200).json(result);
}

/**
 * POST /api/v1/birthday-emails/:id/failed
 */
export async function markJobFailed(req: Request, res: Response): Promise<void> {
  const { id } = req.params;
  const { lockToken, errorClassification, errorMessage, isRetryable } = req.body || {};

  if (!lockToken || typeof lockToken !== "string") {
    throw new ApiError("lockToken is required in request body", 400);
  }

  const result = await birthdayEmailService.recordBirthdayJobFailed(
    id,
    lockToken,
    errorClassification ?? "TRANSIENT",
    errorMessage ?? "Unknown failure",
    typeof isRetryable === "boolean" ? isRetryable : true
  );

  res.status(200).json(result);
}

/**
 * GET /api/v1/birthday-emails/stats
 */
export async function getStats(_req: Request, res: Response): Promise<void> {
  const stats = await birthdayEmailService.getBirthdayEmailStats();
  res.status(200).json({
    success: true,
    stats,
  });
}
