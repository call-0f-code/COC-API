import { Request, Response } from "express";
import * as birthdayEmailService from "../services/birthdayEmail.service";
import {
  ERROR_CLASSIFICATIONS,
  ErrorClassification,
} from "../services/birthdayEmail.service";
import { ApiError } from "../utils/apiError";

function requireLockToken(body: Record<string, unknown>): string {
  const { lockToken } = body;
  if (!lockToken || typeof lockToken !== "string") {
    throw new ApiError("lockToken is required in request body", 400);
  }
  return lockToken;
}

function parseSentAt(value: unknown): Date | undefined {
  if (value === undefined || value === null) return undefined;
  const date = new Date(value as string);
  if (typeof value !== "string" || Number.isNaN(date.getTime())) {
    throw new ApiError("sentAt must be a valid ISO date string", 400);
  }
  return date;
}

function parseErrorClassification(value: unknown): ErrorClassification {
  if (value === undefined || value === null) return "TRANSIENT";
  if (!ERROR_CLASSIFICATIONS.includes(value as ErrorClassification)) {
    throw new ApiError(
      `errorClassification must be one of: ${ERROR_CLASSIFICATIONS.join(", ")}`,
      400
    );
  }
  return value as ErrorClassification;
}

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
    typeof batchSize === "number" ? batchSize : undefined,
    typeof leaseDurationMs === "number" ? leaseDurationMs : undefined
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
  const body = req.body || {};
  const lockToken = requireLockToken(body);
  const sentAt = parseSentAt(body.sentAt);

  const { alreadySent } = await birthdayEmailService.recordBirthdayJobSent(
    req.params.id,
    lockToken,
    body.providerMessageId,
    sentAt
  );

  res.status(200).json({
    success: true,
    message: alreadySent ? "Record was already marked as sent" : "Marked as sent",
  });
}

/**
 * POST /api/v1/birthday-emails/:id/failed
 */
export async function markJobFailed(req: Request, res: Response): Promise<void> {
  const body = req.body || {};
  const lockToken = requireLockToken(body);
  const errorClassification = parseErrorClassification(body.errorClassification);

  const result = await birthdayEmailService.recordBirthdayJobFailed(
    req.params.id,
    lockToken,
    errorClassification,
    typeof body.errorMessage === "string" ? body.errorMessage : "Unknown failure",
    typeof body.isRetryable === "boolean" ? body.isRetryable : true
  );

  res.status(200).json({
    success: true,
    ...result,
  });
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
