import { Request, Response, NextFunction } from "express";
import * as birthdayService from "../src/services/birthdayEmail.service";
import * as birthdayCtrl from "../src/controllers/birthdayEmail.controller";
import { requireInternalAuth } from "../src/middleware/internalAuth";
import prisma from "../src/db/client";
import { ApiError } from "../src/utils/apiError";

jest.mock("../src/db/client", () => {
  const mockPrisma = {
    member: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
    },
    birthdayEmailLog: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
      createMany: jest.fn(),
      update: jest.fn(),
      groupBy: jest.fn(),
      count: jest.fn(),
    },
    $transaction: jest.fn(),
    $queryRaw: jest.fn(),
  };
  return {
    __esModule: true,
    default: mockPrisma,
    prisma: mockPrisma,
  };
});

describe("Central Backend: Birthday Email Tracking & Internal APIs", () => {
  const originalEnv = process.env;

  beforeEach(() => {
    jest.clearAllMocks();
    process.env = { ...originalEnv };
    process.env.INTERNAL_SERVICE_SECRET = "super-secret-service-token";
  });

  afterAll(() => {
    process.env = originalEnv;
  });

  // ──────────────────────────────────────────────
  // 1. Initializing the same member/year job twice creates one record
  // ──────────────────────────────────────────────
  it("1. Initializing the same member/year job twice creates one record", async () => {
    const memberId = "member-123";
    (prisma.member.findMany as jest.Mock).mockResolvedValue([
      { id: memberId, email: "alice@example.com" },
    ]);

    // First initialization: no existing log
    (prisma.birthdayEmailLog.findMany as jest.Mock).mockResolvedValueOnce([]);
    (prisma.birthdayEmailLog.createMany as jest.Mock).mockResolvedValueOnce({ count: 1 });

    const firstRun = await birthdayService.initializeBirthdayJobs(2026, [memberId]);
    expect(firstRun.created).toBe(1);
    expect(firstRun.existing).toBe(0);

    // Second initialization: existing log found
    (prisma.birthdayEmailLog.findMany as jest.Mock).mockResolvedValueOnce([
      { memberId, status: "PENDING" },
    ]);

    const secondRun = await birthdayService.initializeBirthdayJobs(2026, [memberId]);
    expect(secondRun.created).toBe(0);
    expect(secondRun.existing).toBe(1);
    expect(prisma.birthdayEmailLog.createMany).toHaveBeenCalledTimes(1);
  });

  // ──────────────────────────────────────────────
  // 2. Existing SENT records are not reset
  // ──────────────────────────────────────────────
  it("2. Existing SENT records are not reset during initialization", async () => {
    const memberId = "member-sent";
    (prisma.member.findMany as jest.Mock).mockResolvedValue([
      { id: memberId, email: "sent@example.com" },
    ]);

    // Existing record is SENT
    (prisma.birthdayEmailLog.findMany as jest.Mock).mockResolvedValueOnce([
      { memberId, status: "SENT", attemptCount: 1 },
    ]);

    const res = await birthdayService.initializeBirthdayJobs(2026, [memberId]);
    expect(res.created).toBe(0);
    expect(res.existing).toBe(1);
    expect(prisma.birthdayEmailLog.update).not.toHaveBeenCalled();
    expect(prisma.birthdayEmailLog.createMany).not.toHaveBeenCalled();
  });

  // ──────────────────────────────────────────────
  // 3. Two concurrent workers cannot claim the same active job
  // ──────────────────────────────────────────────
  it("3. Atomic job claim locks jobs and prevents concurrent workers from claiming the same active job", async () => {
    const jobRow = { id: "job-1" };

    // Transaction executes queryRaw and update
    (prisma.$transaction as jest.Mock).mockImplementation(async (callback) => {
      const tx = {
        $queryRaw: jest.fn().mockResolvedValue([jobRow]),
        birthdayEmailLog: {
          update: jest.fn().mockResolvedValue({
            id: "job-1",
            memberId: "m-1",
            birthdayYear: 2026,
            attemptCount: 0,
            lockToken: "token-worker-1",
          }),
        },
      };
      return await callback(tx);
    });

    const claimed = await birthdayService.claimBirthdayJobs(10, 300000);
    expect(claimed).toHaveLength(1);
    expect(claimed[0].id).toBe("job-1");
    expect(claimed[0].lockToken).toBeDefined();

    // Second worker claims concurrently, queryRaw returns empty (already locked/skipped)
    (prisma.$transaction as jest.Mock).mockImplementationOnce(async (callback) => {
      const tx = {
        $queryRaw: jest.fn().mockResolvedValue([]),
        birthdayEmailLog: { update: jest.fn() },
      };
      return await callback(tx);
    });

    const secondClaim = await birthdayService.claimBirthdayJobs(10, 300000);
    expect(secondClaim).toHaveLength(0);
  });

  // ──────────────────────────────────────────────
  // 4. Expired PROCESSING jobs can be recovered
  // ──────────────────────────────────────────────
  it("4. Expired PROCESSING jobs can be recovered by claim query", async () => {
    (prisma.$transaction as jest.Mock).mockImplementation(async (callback) => {
      const tx = {
        $queryRaw: jest.fn().mockImplementation((strings, ...values) => {
          // Verify query includes lease expiration check: lockedUntil < now
          const queryText = strings.join("");
          expect(queryText).toContain('"lockedUntil" <');
          return Promise.resolve([{ id: "expired-job-1" }]);
        }),
        birthdayEmailLog: {
          update: jest.fn().mockResolvedValue({
            id: "expired-job-1",
            memberId: "m-expired",
            birthdayYear: 2026,
            attemptCount: 1,
            lockToken: "new-recovery-token",
          }),
        },
      };
      return await callback(tx);
    });

    const claimed = await birthdayService.claimBirthdayJobs(5, 300000);
    expect(claimed).toHaveLength(1);
    expect(claimed[0].id).toBe("expired-job-1");
    expect(claimed[0].lockToken).toBe("new-recovery-token");
  });

  // ──────────────────────────────────────────────
  // 5. A stale lock token cannot overwrite a newer worker's result
  // ──────────────────────────────────────────────
  it("5. A stale lock token cannot overwrite a newer worker's result (409 conflict)", async () => {
    // Record in DB currently has 'newer-lock-token'
    (prisma.birthdayEmailLog.findUnique as jest.Mock).mockResolvedValue({
      id: "job-conflict",
      status: "PROCESSING",
      lockToken: "newer-lock-token",
      attemptCount: 2,
    });

    // Stale worker tries to report sent with old token
    await expect(
      birthdayService.recordBirthdayJobSent(
        "job-conflict",
        "stale-old-token",
        "msg-123"
      )
    ).rejects.toThrow(ApiError);

    try {
      await birthdayService.recordBirthdayJobSent(
        "job-conflict",
        "stale-old-token",
        "msg-123"
      );
    } catch (err: any) {
      expect(err.statusCode).toBe(409);
    }

    // Stale worker tries to report failed with old token
    await expect(
      birthdayService.recordBirthdayJobFailed(
        "job-conflict",
        "stale-old-token",
        "TRANSIENT",
        "network timeout",
        true
      )
    ).rejects.toThrow(ApiError);
  });

  // ──────────────────────────────────────────────
  // 6. Successful sends persist provider IDs and timestamps
  // ──────────────────────────────────────────────
  it("6. Successful sends persist provider IDs and timestamps", async () => {
    (prisma.birthdayEmailLog.findUnique as jest.Mock).mockResolvedValue({
      id: "job-success",
      status: "PROCESSING",
      lockToken: "valid-token-abc",
      attemptCount: 0,
      providerMessageId: null,
    });

    (prisma.birthdayEmailLog.update as jest.Mock).mockResolvedValue({
      id: "job-success",
      status: "SENT",
      providerMessageId: "resend-msg-999",
      sentAt: new Date("2026-10-21T09:05:00.000Z"),
    });

    const res = await birthdayService.recordBirthdayJobSent(
      "job-success",
      "valid-token-abc",
      "resend-msg-999",
      "2026-10-21T09:05:00.000Z"
    );

    expect(res.success).toBe(true);
    expect(prisma.birthdayEmailLog.update).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: "job-success" },
        data: expect.objectContaining({
          status: "SENT",
          providerMessageId: "resend-msg-999",
          sentAt: new Date("2026-10-21T09:05:00.000Z"),
          lockToken: null,
          lockedUntil: null,
          attemptCount: 1,
        }),
      })
    );
  });

  // ──────────────────────────────────────────────
  // 7. Retryable failures schedule a future retry
  // ──────────────────────────────────────────────
  it("7. Retryable failures schedule a future retry with backoff", async () => {
    (prisma.birthdayEmailLog.findUnique as jest.Mock).mockResolvedValue({
      id: "job-retryable",
      status: "PROCESSING",
      lockToken: "tok-retry",
      attemptCount: 1, // attempt 1 failed, next will be attempt 2
    });

    (prisma.birthdayEmailLog.update as jest.Mock).mockResolvedValue({});

    const res = await birthdayService.recordBirthdayJobFailed(
      "job-retryable",
      "tok-retry",
      "TRANSIENT",
      "Temporary 500 error",
      true
    );

    expect(res.success).toBe(true);
    expect(res.status).toBe("FAILED");
    expect(res.attemptCount).toBe(2);
    expect(res.nextRetryAt).toBeInstanceOf(Date);
    // Attempt 2 backoff is 15 minutes (~900000ms from now)
    const diffMs = res.nextRetryAt!.getTime() - Date.now();
    expect(diffMs).toBeGreaterThan(14 * 60 * 1000);
    expect(diffMs).toBeLessThanOrEqual(16 * 60 * 1000);
  });

  // ──────────────────────────────────────────────
  // 8. Permanent failures become terminal (DEAD)
  // ──────────────────────────────────────────────
  it("8. Permanent failures become terminal (DEAD) without scheduling retry", async () => {
    (prisma.birthdayEmailLog.findUnique as jest.Mock).mockResolvedValue({
      id: "job-perm",
      status: "PROCESSING",
      lockToken: "tok-perm",
      attemptCount: 0,
    });

    (prisma.birthdayEmailLog.update as jest.Mock).mockResolvedValue({});

    const res = await birthdayService.recordBirthdayJobFailed(
      "job-perm",
      "tok-perm",
      "PERMANENT",
      "Invalid recipient mailbox not found",
      false
    );

    expect(res.success).toBe(true);
    expect(res.status).toBe("DEAD");
    expect(res.nextRetryAt).toBeNull();
    expect(res.attemptCount).toBe(1);
    expect(prisma.birthdayEmailLog.update).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          status: "DEAD",
          nextRetryAt: null,
        }),
      })
    );
  });

  // ──────────────────────────────────────────────
  // 9. Maximum attempts are enforced
  // ──────────────────────────────────────────────
  it("9. Maximum attempts (5) are enforced, moving record to DEAD", async () => {
    (prisma.birthdayEmailLog.findUnique as jest.Mock).mockResolvedValue({
      id: "job-max-attempt",
      status: "PROCESSING",
      lockToken: "tok-max",
      attemptCount: 4, // 5th attempt failing
    });

    (prisma.birthdayEmailLog.update as jest.Mock).mockResolvedValue({});

    const res = await birthdayService.recordBirthdayJobFailed(
      "job-max-attempt",
      "tok-max",
      "TRANSIENT",
      "Server error 503",
      true
    );

    expect(res.success).toBe(true);
    expect(res.status).toBe("DEAD");
    expect(res.attemptCount).toBe(5);
    expect(res.nextRetryAt).toBeNull();
  });

  // ──────────────────────────────────────────────
  // 10. Unauthorized internal API requests are rejected
  // ──────────────────────────────────────────────
  it("10. Unauthorized internal API requests are rejected by middleware", () => {
    const next: NextFunction = jest.fn();

    // 10a: Missing secret
    const reqMissing = {
      headers: {},
    } as unknown as Request;
    const res = {} as Response;

    expect(() => requireInternalAuth(reqMissing, res, next)).toThrow(ApiError);
    try {
      requireInternalAuth(reqMissing, res, next);
    } catch (err: any) {
      expect(err.statusCode).toBe(401);
    }

    // 10b: Invalid secret
    const reqInvalid = {
      headers: {
        "x-service-secret": "wrong-secret-token",
      },
    } as unknown as Request;

    expect(() => requireInternalAuth(reqInvalid, res, next)).toThrow(ApiError);
    try {
      requireInternalAuth(reqInvalid, res, next);
    } catch (err: any) {
      expect(err.statusCode).toBe(401);
    }

    // 10c: Valid secret
    const reqValid = {
      headers: {
        "x-service-secret": "super-secret-service-token",
      },
    } as unknown as Request;

    expect(() => requireInternalAuth(reqValid, res, next)).not.toThrow();
    expect(next).toHaveBeenCalled();
  });

  // ──────────────────────────────────────────────
  // Stats endpoint
  // ──────────────────────────────────────────────
  it("Fetches internal stats safely", async () => {
    (prisma.birthdayEmailLog.groupBy as jest.Mock).mockResolvedValue([
      { status: "SENT", _count: { id: 10 } },
      { status: "PENDING", _count: { id: 2 } },
      { status: "FAILED", _count: { id: 1 } },
    ]);
    (prisma.birthdayEmailLog.count as jest.Mock).mockResolvedValue(1);

    const stats = await birthdayService.getBirthdayEmailStats();
    expect(stats.sent).toBe(10);
    expect(stats.pending).toBe(2);
    expect(stats.failed).toBe(1);
    expect(stats.dueForRetry).toBe(1);
    expect(stats.total).toBe(13);
  });
});
