import prisma from "../db/client";
import { ApiError } from "../utils/apiError";
import crypto from "crypto";

export interface ClaimedJob {
  id: string;
  memberId: string;
  birthdayYear: number;
  attemptCount: number;
  lockToken: string;
}

export interface JobStats {
  pending: number;
  processing: number;
  sent: number;
  failed: number;
  dead: number;
  dueForRetry: number;
  total: number;
}

/** Retry delays in milliseconds based on attempt count */
const RETRY_DELAYS_MS: Record<number, number> = {
  1: 5 * 60 * 1000, // 5 min
  2: 15 * 60 * 1000, // 15 min
  3: 30 * 60 * 1000, // 30 min
  4: 120 * 60 * 1000, // 120 min
};

const QUOTA_RETRY_DELAY_MS = 4 * 60 * 60 * 1000; // 4 hours for quota exhaustion
const MAX_ATTEMPTS = 5;

/**
 * Sanitize error message to ensure no secrets, keys, or bearer tokens are stored.
 */
function sanitizeErrorMessage(msg: string): string {
  if (!msg || typeof msg !== "string") return "Unknown error";
  return msg
    .replace(/(bearer\s+)[^\s]+/gi, "$1[REDACTED]")
    .replace(/(api[-_]?key\s*[:=]\s*)[^\s]+/gi, "$1[REDACTED]")
    .replace(/(secret\s*[:=]\s*)[^\s]+/gi, "$1[REDACTED]")
    .replace(/(re_[a-zA-Z0-9_-]{20,})/g, "[REDACTED_RESEND_KEY]")
    .substring(0, 500);
}

/**
 * Initialize birthday email jobs for a given year and list of member IDs idempotently.
 */
export async function initializeBirthdayJobs(
  birthdayYear: number,
  memberIds: string[]
): Promise<{
  created: number;
  existing: number;
  totalEligible: number;
}> {
  if (!Number.isInteger(birthdayYear) || birthdayYear < 1900 || birthdayYear > 2200) {
    throw new ApiError("Invalid birthdayYear: must be a 4-digit integer", 400);
  }

  if (!Array.isArray(memberIds) || memberIds.length === 0) {
    throw new ApiError("memberIds must be a non-empty array of strings", 400);
  }

  const cleanIds = Array.from(
    new Set(memberIds.filter((id) => typeof id === "string" && id.trim().length > 0))
  );

  if (cleanIds.length === 0) {
    throw new ApiError("No valid member IDs provided", 400);
  }

  // Fetch only eligible members: approved, not ghosted, has birth_date, has valid email
  const eligibleMembers = await prisma.member.findMany({
    where: {
      id: { in: cleanIds },
      isApproved: true,
      isGhosted: false,
      birth_date: { not: null },
    },
    select: {
      id: true,
      email: true,
    },
  });

  const validEligible = eligibleMembers.filter(
    (m) => typeof m.email === "string" && m.email.includes("@")
  );

  if (validEligible.length === 0) {
    return { created: 0, existing: 0, totalEligible: 0 };
  }

  const eligibleIds = validEligible.map((m) => m.id);

  // Check existing logs to preserve state and avoid resetting SENT or attempt counts
  const existingLogs = await prisma.birthdayEmailLog.findMany({
    where: {
      birthdayYear,
      memberId: { in: eligibleIds },
    },
    select: {
      memberId: true,
    },
  });

  const existingMemberIdSet = new Set(existingLogs.map((l) => l.memberId));
  const newMemberIds = eligibleIds.filter((id) => !existingMemberIdSet.has(id));

  let createdCount = 0;
  if (newMemberIds.length > 0) {
    const recordsToCreate = newMemberIds.map((mId) => ({
      memberId: mId,
      birthdayYear,
      status: "PENDING" as const,
      attemptCount: 0,
    }));

    const result = await prisma.birthdayEmailLog.createMany({
      data: recordsToCreate,
      skipDuplicates: true,
    });
    createdCount = result.count;
  }

  return {
    created: createdCount,
    existing: existingLogs.length,
    totalEligible: validEligible.length,
  };
}

/**
 * Atomically claim a batch of eligible jobs for processing.
 * A job is claimable when:
 *  - PENDING
 *  - FAILED and nextRetryAt <= now
 *  - PROCESSING and lease expired (lockedUntil < now)
 * Prevents race conditions with FOR UPDATE SKIP LOCKED.
 */
export async function claimBirthdayJobs(
  batchSize = 10,
  leaseDurationMs = 300000
): Promise<ClaimedJob[]> {
  const safeBatchSize = Math.max(1, Math.min(batchSize, 50));
  const safeLeaseMs = Math.max(10000, Math.min(leaseDurationMs, 3600000));
  const now = new Date();

  return await prisma.$transaction(async (tx) => {
    // Select eligible jobs with row-level locks, skipping already-locked rows
    const eligible = await tx.$queryRaw<Array<{ id: string }>>`
      SELECT id FROM "BirthdayEmailLog"
      WHERE (
        "status" = 'PENDING'::"BirthdayEmailStatus" OR
        ("status" = 'FAILED'::"BirthdayEmailStatus" AND ("nextRetryAt" IS NULL OR "nextRetryAt" <= ${now})) OR
        ("status" = 'PROCESSING'::"BirthdayEmailStatus" AND "lockedUntil" < ${now})
      )
      ORDER BY "createdAt" ASC
      LIMIT ${safeBatchSize}
      FOR UPDATE SKIP LOCKED
    `;

    if (!eligible || eligible.length === 0) {
      return [];
    }

    const lockedUntil = new Date(now.getTime() + safeLeaseMs);
    const claimed: ClaimedJob[] = [];

    for (const row of eligible) {
      const lockToken = crypto.randomUUID();
      const updated = await tx.birthdayEmailLog.update({
        where: { id: row.id },
        data: {
          status: "PROCESSING",
          lockToken,
          lockedUntil,
        },
        select: {
          id: true,
          memberId: true,
          birthdayYear: true,
          attemptCount: true,
          lockToken: true,
        },
      });

      if (updated.lockToken) {
        claimed.push({
          id: updated.id,
          memberId: updated.memberId,
          birthdayYear: updated.birthdayYear,
          attemptCount: updated.attemptCount,
          lockToken: updated.lockToken,
        });
      }
    }

    return claimed;
  });
}

/**
 * Mark a claimed birthday email job as SENT.
 * Validates the lockToken to guard against stale workers.
 */
export async function recordBirthdayJobSent(
  id: string,
  lockToken: string,
  providerMessageId?: string,
  sentAt?: string
): Promise<{ success: boolean; message: string }> {
  if (!id || typeof id !== "string") {
    throw new ApiError("Missing tracking record id", 400);
  }
  if (!lockToken || typeof lockToken !== "string") {
    throw new ApiError("Missing lockToken", 400);
  }

  const record = await prisma.birthdayEmailLog.findUnique({
    where: { id },
  });

  if (!record) {
    throw new ApiError("Birthday email record not found", 404);
  }

  // Idempotent duplicate check: already SENT with provider ID
  if (record.status === "SENT") {
    return { success: true, message: "Record was already marked as sent" };
  }

  // Validate lease ownership
  if (record.status !== "PROCESSING" || record.lockToken !== lockToken) {
    throw new ApiError(
      "Invalid or expired lock token: job is no longer owned by caller",
      409
    );
  }

  await prisma.birthdayEmailLog.update({
    where: { id },
    data: {
      status: "SENT",
      providerMessageId: providerMessageId ?? record.providerMessageId,
      sentAt: sentAt ? new Date(sentAt) : new Date(),
      lockToken: null,
      lockedUntil: null,
      nextRetryAt: null,
      attemptCount: record.attemptCount + 1,
      lastError: null,
    },
  });

  return { success: true, message: "Marked as sent" };
}

/**
 * Record a failed attempt for a claimed job.
 * Calculates next retry time or transitions to DEAD if max attempts exceeded or permanent failure.
 */
export async function recordBirthdayJobFailed(
  id: string,
  lockToken: string,
  errorClassification: string,
  errorMessage: string,
  isRetryable: boolean
): Promise<{
  success: boolean;
  status: "FAILED" | "DEAD";
  attemptCount: number;
  nextRetryAt: Date | null;
}> {
  if (!id || typeof id !== "string") {
    throw new ApiError("Missing tracking record id", 400);
  }
  if (!lockToken || typeof lockToken !== "string") {
    throw new ApiError("Missing lockToken", 400);
  }

  const record = await prisma.birthdayEmailLog.findUnique({
    where: { id },
  });

  if (!record) {
    throw new ApiError("Birthday email record not found", 404);
  }

  if (record.status !== "PROCESSING" || record.lockToken !== lockToken) {
    throw new ApiError(
      "Invalid or expired lock token: job is no longer owned by caller",
      409
    );
  }

  const newAttemptCount = record.attemptCount + 1;
  const sanitized = sanitizeErrorMessage(errorMessage);

  const isPermanent =
    !isRetryable ||
    errorClassification === "PERMANENT" ||
    errorClassification === "CONFIG";

  let newStatus: "FAILED" | "DEAD";
  let nextRetryAt: Date | null = null;

  if (isPermanent || newAttemptCount >= MAX_ATTEMPTS) {
    newStatus = "DEAD";
    nextRetryAt = null;
  } else {
    newStatus = "FAILED";
    let delayMs = RETRY_DELAYS_MS[newAttemptCount] || 120 * 60 * 1000;
    if (errorClassification === "QUOTA") {
      delayMs = QUOTA_RETRY_DELAY_MS;
    }
    nextRetryAt = new Date(Date.now() + delayMs);
  }

  await prisma.birthdayEmailLog.update({
    where: { id },
    data: {
      status: newStatus,
      attemptCount: newAttemptCount,
      nextRetryAt,
      lastError: sanitized,
      lockToken: null,
      lockedUntil: null,
    },
  });

  return {
    success: true,
    status: newStatus,
    attemptCount: newAttemptCount,
    nextRetryAt,
  };
}

/**
 * Fetch tracking statistics without exposing member emails.
 */
export async function getBirthdayEmailStats(): Promise<JobStats> {
  const countsByStatus = await prisma.birthdayEmailLog.groupBy({
    by: ["status"],
    _count: { id: true },
  });

  const stats: JobStats = {
    pending: 0,
    processing: 0,
    sent: 0,
    failed: 0,
    dead: 0,
    dueForRetry: 0,
    total: 0,
  };

  for (const group of countsByStatus) {
    const count = group._count.id;
    stats.total += count;
    switch (group.status) {
      case "PENDING":
        stats.pending = count;
        break;
      case "PROCESSING":
        stats.processing = count;
        break;
      case "SENT":
        stats.sent = count;
        break;
      case "FAILED":
        stats.failed = count;
        break;
      case "DEAD":
        stats.dead = count;
        break;
    }
  }

  const dueForRetry = await prisma.birthdayEmailLog.count({
    where: {
      status: "FAILED",
      nextRetryAt: { lte: new Date() },
    },
  });
  stats.dueForRetry = dueForRetry;

  return stats;
}
