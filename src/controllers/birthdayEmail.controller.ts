import { Request, Response } from "express";
import * as birthdayEmailService from "../services/birthdayEmail.service";
import { ApiError } from "../utils/apiError";

const { ERROR_CLASSIFICATIONS } = birthdayEmailService;
type ErrorClassification = birthdayEmailService.ErrorClassification;

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

function parseProviderMessageId(value: unknown): string | undefined {
  if (value === undefined || value === null) return undefined;
  if (typeof value !== "string") {
    throw new ApiError("providerMessageId must be a string", 400);
  }
  return value;
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
export const initializeJobs = async (req: Request, res: Response) => {
  // birthdayYear and memberIds are validated by the service
  const { birthdayYear, memberIds } = req.body || {};

  const result = await birthdayEmailService.initializeBirthdayJobs(
    birthdayYear,
    memberIds
  );

  res.status(200).json({
    success: true,
    message: "Birthday jobs initialized",
    data: result,
  });
};

/**
 * POST /api/v1/birthday-emails/claim
 */
export const claimJobs = async (req: Request, res: Response) => {
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
};

/**
 * POST /api/v1/birthday-emails/:id/sent
 */
export const markJobSent = async (req: Request, res: Response) => {
  const body = req.body || {};
  const lockToken = requireLockToken(body);
  const providerMessageId = parseProviderMessageId(body.providerMessageId);
  const sentAt = parseSentAt(body.sentAt);

  const { alreadySent } = await birthdayEmailService.recordBirthdayJobSent(
    req.params.id,
    lockToken,
    providerMessageId,
    sentAt
  );

  res.status(200).json({
    success: true,
    message: alreadySent ? "Record was already marked as sent" : "Marked as sent",
  });
};

/**
 * POST /api/v1/birthday-emails/:id/failed
 */
export const markJobFailed = async (req: Request, res: Response) => {
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

  // Flat shape is the contract the COC-Members birthday worker is typed against.
  res.status(200).json({
    success: true,
    ...result,
  });
};

/**
 * GET /api/v1/birthday-emails/stats
 */
export const getStats = async (_req: Request, res: Response) => {
  const stats = await birthdayEmailService.getBirthdayEmailStats();
  res.status(200).json({
    success: true,
    stats,
  });
};
