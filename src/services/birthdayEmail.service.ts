import prisma from "../db/client";
import type { Prisma } from "../generated/prisma/client";
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

export const ERROR_CLASSIFICATIONS = [
  "TRANSIENT",
  "PERMANENT",
  "CONFIG",
  "QUOTA",
] as const;
export type ErrorClassification = (typeof ERROR_CLASSIFICATIONS)[number];

export interface FailedJobResult {
  status: "FAILED" | "DEAD";
  attemptCount: number;
  nextRetryAt: Date | null;
}

const MINUTE_MS = 60 * 1000;

/** Retry delay after the Nth failed attempt (index 0 = after attempt 1). */
const RETRY_DELAYS_MS = [5, 15, 30, 120].map((m) => m * MINUTE_MS);
const QUOTA_RETRY_DELAY_MS = 4 * 60 * MINUTE_MS;
const MAX_ATTEMPTS = 5;

export const DEFAULT_BATCH_SIZE = 10;
export const DEFAULT_LEASE_MS = 5 * MINUTE_MS;

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

function retryDelayFor(attemptCount: number): number {
  const index = Math.min(Math.max(attemptCount, 1), RETRY_DELAYS_MS.length) - 1;
  return RETRY_DELAYS_MS[index];
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
 *
 * An expired PROCESSING lease means the previous worker never reported a
 * result (for example, it crashed), so that lost attempt is counted. A job
 * that runs out of attempts this way is moved to DEAD instead of reclaimed.
 */
export async function claimBirthdayJobs(
  batchSize = DEFAULT_BATCH_SIZE,
  leaseDurationMs = DEFAULT_LEASE_MS
): Promise<ClaimedJob[]> {
  const safeBatchSize = Math.max(1, Math.min(batchSize, 50));
  const safeLeaseMs = Math.max(10000, Math.min(leaseDurationMs, 3600000));
  const now = new Date();

  return await prisma.$transaction(async (tx) => {
    // Select eligible jobs with row-level locks, skipping already-locked rows
    const eligible = await tx.$queryRaw<
      Array<{ id: string; status: string; attemptCount: number }>
    >`
      SELECT id, "status", "attemptCount" FROM "BirthdayEmailLog"
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
      let attemptCount = row.attemptCount;

      if (row.status === "PROCESSING") {
        attemptCount += 1;
        if (attemptCount >= MAX_ATTEMPTS) {
          await tx.birthdayEmailLog.update({
            where: { id: row.id },
            data: {
              status: "DEAD",
              attemptCount,
              lastError: "Lease expired: worker never reported a result",
              lockToken: null,
              lockedUntil: null,
              nextRetryAt: null,
            },
          });
          continue;
        }
      }

      const lockToken = crypto.randomUUID();
      const updated = await tx.birthdayEmailLog.update({
        where: { id: row.id },
        data: {
          status: "PROCESSING",
          attemptCount,
          lockToken,
          lockedUntil,
        },
        select: {
          id: true,
          memberId: true,
          birthdayYear: true,
          attemptCount: true,
        },
      });

      claimed.push({ ...updated, lockToken });
    }

    return claimed;
  });
}

async function findJobOrThrow(id: string) {
  const record = await prisma.birthdayEmailLog.findUnique({ where: { id } });
  if (!record) {
    throw new ApiError("Birthday email record not found", 404);
  }
  return record;
}

function leaseConflict(): ApiError {
  return new ApiError(
    "Invalid or expired lock token: job is no longer owned by caller",
    409
  );
}

/**
 * Write a job result only if the caller still holds the lease.
 * The lease check and the write are one statement, so a worker whose lease
 * expired cannot overwrite a job that another worker has since claimed.
 */
async function updateIfLeaseOwned(
  id: string,
  lockToken: string,
  data: Prisma.BirthdayEmailLogUpdateManyMutationInput
): Promise<void> {
  const { count } = await prisma.birthdayEmailLog.updateMany({
    where: { id, lockToken, status: "PROCESSING" },
    data,
  });
  if (count === 0) {
    throw leaseConflict();
  }
}

/**
 * Mark a claimed birthday email job as SENT.
 * Returns `alreadySent: true` when the job had already been marked as sent.
 */
export async function recordBirthdayJobSent(
  id: string,
  lockToken: string,
  providerMessageId?: string,
  sentAt: Date = new Date()
): Promise<{ alreadySent: boolean }> {
  const record = await findJobOrThrow(id);

  if (record.status === "SENT") {
    return { alreadySent: true };
  }

  if (record.status !== "PROCESSING" || record.lockToken !== lockToken) {
    throw leaseConflict();
  }

  await updateIfLeaseOwned(id, lockToken, {
    status: "SENT",
    providerMessageId: providerMessageId ?? record.providerMessageId,
    sentAt,
    lockToken: null,
    lockedUntil: null,
    nextRetryAt: null,
    attemptCount: record.attemptCount + 1,
    lastError: null,
  });

  return { alreadySent: false };
}

/**
 * Record a failed attempt for a claimed job.
 * Calculates next retry time or transitions to DEAD if max attempts exceeded or permanent failure.
 */
export async function recordBirthdayJobFailed(
  id: string,
  lockToken: string,
  errorClassification: ErrorClassification,
  errorMessage: string,
  isRetryable: boolean
): Promise<FailedJobResult> {
  const record = await findJobOrThrow(id);

  if (record.status !== "PROCESSING" || record.lockToken !== lockToken) {
    throw leaseConflict();
  }

  const attemptCount = record.attemptCount + 1;
  const isPermanent =
    !isRetryable ||
    errorClassification === "PERMANENT" ||
    errorClassification === "CONFIG";

  let status: "FAILED" | "DEAD";
  let nextRetryAt: Date | null = null;

  if (isPermanent || attemptCount >= MAX_ATTEMPTS) {
    status = "DEAD";
  } else {
    status = "FAILED";
    const delayMs =
      errorClassification === "QUOTA"
        ? QUOTA_RETRY_DELAY_MS
        : retryDelayFor(attemptCount);
    nextRetryAt = new Date(Date.now() + delayMs);
  }

  await updateIfLeaseOwned(id, lockToken, {
    status,
    attemptCount,
    nextRetryAt,
    lastError: sanitizeErrorMessage(errorMessage),
    lockToken: null,
    lockedUntil: null,
  });

  return { status, attemptCount, nextRetryAt };
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
