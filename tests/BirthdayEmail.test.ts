import { Request, Response, NextFunction } from "express";
import * as birthdayService from "../src/services/birthdayEmail.service";
import * as birthdayCtrl from "../src/controllers/birthdayEmail.controller";
import { requireInternalAuth } from "../src/middleware/internalAuth";
import prisma from "../src/db/client";
import config from "../src/config";
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
      updateMany: jest.fn(),
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

const mockResponse = (): Response => {
  const res = {} as Response;
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
};

/** Run claimBirthdayJobs against a fake transaction returning the given rows. */
function mockClaimTransaction(
  rows: Array<{ id: string; status: string; attemptCount: number }>
) {
  const update = jest.fn().mockImplementation(({ where, data }) =>
    Promise.resolve({
      id: where.id,
      memberId: `member-of-${where.id}`,
      birthdayYear: 2026,
      attemptCount: data.attemptCount,
    })
  );
  (prisma.$transaction as jest.Mock).mockImplementationOnce(async (callback) =>
    callback({
      $queryRaw: jest.fn().mockResolvedValue(rows),
      birthdayEmailLog: { update },
    })
  );
  return update;
}

describe("Central Backend: Birthday Email Tracking & Internal APIs", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    config.INTERNAL_SERVICE_SECRET = "super-secret-service-token";
  });

  // ──────────────────────────────────────────────
  // 1. Initializing the same member/year job twice creates one record
  // ──────────────────────────────────────────────
  it("1. Initializing the same member/year job twice creates one record", async () => {
    const memberId = "member-123";
    (prisma.member.findMany as jest.Mock).mockResolvedValue([{ id: memberId }]);

    // First run inserts; second run hits the unique index and is skipped
    (prisma.birthdayEmailLog.createMany as jest.Mock)
      .mockResolvedValueOnce({ count: 1 })
      .mockResolvedValueOnce({ count: 0 });

    const firstRun = await birthdayService.initializeBirthdayJobs(2026, [memberId]);
    expect(firstRun).toEqual({ created: 1, existing: 0, totalEligible: 1 });

    const secondRun = await birthdayService.initializeBirthdayJobs(2026, [memberId]);
    expect(secondRun).toEqual({ created: 0, existing: 1, totalEligible: 1 });

    expect(prisma.birthdayEmailLog.createMany).toHaveBeenCalledWith({
      data: [{ memberId, birthdayYear: 2026 }],
      skipDuplicates: true,
    });
  });

  // ──────────────────────────────────────────────
  // 2. Existing records are never reset, and only eligible members get jobs
  // ──────────────────────────────────────────────
  it("2. Existing records are not reset during initialization", async () => {
    (prisma.member.findMany as jest.Mock).mockResolvedValue([{ id: "member-sent" }]);
    (prisma.birthdayEmailLog.createMany as jest.Mock).mockResolvedValue({ count: 0 });

    const res = await birthdayService.initializeBirthdayJobs(2026, ["member-sent"]);
    expect(res.created).toBe(0);
    expect(res.existing).toBe(1);
    // Only inserts with skipDuplicates; never updates existing rows
    expect(prisma.birthdayEmailLog.update).not.toHaveBeenCalled();
    expect(prisma.birthdayEmailLog.updateMany).not.toHaveBeenCalled();
  });

  it("2b. Eligibility filter is applied in the member query", async () => {
    (prisma.member.findMany as jest.Mock).mockResolvedValue([]);

    const res = await birthdayService.initializeBirthdayJobs(2026, ["m1", "m1", " "]);
    expect(res).toEqual({ created: 0, existing: 0, totalEligible: 0 });
    expect(prisma.member.findMany).toHaveBeenCalledWith({
      where: {
        id: { in: ["m1"] },
        isApproved: true,
        isGhosted: false,
        birth_date: { not: null },
        email: { contains: "@" },
      },
      select: { id: true },
    });
    expect(prisma.birthdayEmailLog.createMany).not.toHaveBeenCalled();
  });

  it("2c. Invalid initialize input is rejected with 400", async () => {
    await expect(
      birthdayService.initializeBirthdayJobs("2026" as unknown as number, ["m1"])
    ).rejects.toMatchObject({ statusCode: 400 });
    await expect(
      birthdayService.initializeBirthdayJobs(2026, undefined as unknown as string[])
    ).rejects.toMatchObject({ statusCode: 400 });
  });

  // ──────────────────────────────────────────────
  // 3. Two concurrent workers cannot claim the same active job
  // ──────────────────────────────────────────────
  it("3. Atomic job claim locks jobs and prevents concurrent workers from claiming the same active job", async () => {
    mockClaimTransaction([{ id: "job-1", status: "PENDING", attemptCount: 0 }]);

    const claimed = await birthdayService.claimBirthdayJobs(10, 300000);
    expect(claimed).toHaveLength(1);
    expect(claimed[0].id).toBe("job-1");
    expect(claimed[0].attemptCount).toBe(0);
    expect(claimed[0].lockToken).toEqual(expect.any(String));

    // Second worker claims concurrently, queryRaw returns empty (already locked/skipped)
    mockClaimTransaction([]);

    const secondClaim = await birthdayService.claimBirthdayJobs(10, 300000);
    expect(secondClaim).toHaveLength(0);
  });

  // ──────────────────────────────────────────────
  // 4. Expired PROCESSING jobs can be recovered, and the lost attempt counts
  // ──────────────────────────────────────────────
  it("4. Expired PROCESSING jobs are reclaimed and the lost attempt is counted", async () => {
    let queryText = "";
    const update = jest.fn().mockImplementation(({ where, data }) =>
      Promise.resolve({
        id: where.id,
        memberId: "m-expired",
        birthdayYear: 2026,
        attemptCount: data.attemptCount,
      })
    );
    (prisma.$transaction as jest.Mock).mockImplementationOnce(async (callback) =>
      callback({
        $queryRaw: jest.fn().mockImplementation((strings: string[]) => {
          queryText = strings.join("");
          return Promise.resolve([
            { id: "expired-job-1", status: "PROCESSING", attemptCount: 1 },
          ]);
        }),
        birthdayEmailLog: { update },
      })
    );

    const claimed = await birthdayService.claimBirthdayJobs(5, 300000);
    expect(queryText).toContain('"lockedUntil" <');
    expect(claimed).toHaveLength(1);
    expect(claimed[0].id).toBe("expired-job-1");
    expect(claimed[0].attemptCount).toBe(2);
    expect(update).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ status: "PROCESSING", attemptCount: 2 }),
      })
    );
  });

  it("4b. An expired PROCESSING job on its last attempt goes DEAD instead of being reclaimed", async () => {
    const update = mockClaimTransaction([
      { id: "crashy-job", status: "PROCESSING", attemptCount: 4 },
      { id: "fresh-job", status: "PENDING", attemptCount: 0 },
    ]);

    const claimed = await birthdayService.claimBirthdayJobs(10, 300000);
    expect(claimed.map((j) => j.id)).toEqual(["fresh-job"]);
    expect(update).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: "crashy-job" },
        data: expect.objectContaining({
          status: "DEAD",
          attemptCount: 5,
          lockToken: null,
        }),
      })
    );
  });

  // ──────────────────────────────────────────────
  // 5. A stale lock token cannot overwrite a newer worker's result
  // ──────────────────────────────────────────────
  it("5. A stale lock token cannot overwrite a newer worker's result (409 conflict)", async () => {
    // Record in DB currently has 'newer-lock-token', so the guarded write matches nothing
    (prisma.birthdayEmailLog.findUnique as jest.Mock).mockResolvedValue({
      id: "job-conflict",
      status: "PROCESSING",
      lockToken: "newer-lock-token",
      attemptCount: 2,
    });
    (prisma.birthdayEmailLog.updateMany as jest.Mock).mockResolvedValue({ count: 0 });

    await expect(
      birthdayService.recordBirthdayJobSent("job-conflict", "stale-old-token", "msg-123")
    ).rejects.toMatchObject({ statusCode: 409 });
    expect(prisma.birthdayEmailLog.updateMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: "job-conflict", lockToken: "stale-old-token", status: "PROCESSING" },
      })
    );

    (prisma.birthdayEmailLog.updateMany as jest.Mock).mockClear();
    await expect(
      birthdayService.recordBirthdayJobFailed(
        "job-conflict",
        "stale-old-token",
        "TRANSIENT",
        "network timeout",
        true
      )
    ).rejects.toMatchObject({ statusCode: 409 });
    // /failed rejects on its pre-read, before writing
    expect(prisma.birthdayEmailLog.updateMany).not.toHaveBeenCalled();
  });

  it("5b. /failed losing the lease between the read and the write is rejected (409 conflict)", async () => {
    // The read still shows our lease...
    (prisma.birthdayEmailLog.findUnique as jest.Mock).mockResolvedValue({
      id: "job-race",
      status: "PROCESSING",
      lockToken: "my-token",
      attemptCount: 1,
    });
    // ...but another worker reclaimed it before our write landed.
    (prisma.birthdayEmailLog.updateMany as jest.Mock).mockResolvedValue({ count: 0 });

    await expect(
      birthdayService.recordBirthdayJobFailed("job-race", "my-token", "TRANSIENT", "boom", true)
    ).rejects.toMatchObject({ statusCode: 409 });
  });

  it("5c. /sent for an unknown job is a 404", async () => {
    (prisma.birthdayEmailLog.updateMany as jest.Mock).mockResolvedValue({ count: 0 });
    (prisma.birthdayEmailLog.findUnique as jest.Mock).mockResolvedValue(null);

    await expect(
      birthdayService.recordBirthdayJobSent("missing", "tok")
    ).rejects.toMatchObject({ statusCode: 404 });
  });

  // ──────────────────────────────────────────────
  // 6. Successful sends persist provider IDs and timestamps
  // ──────────────────────────────────────────────
  it("6. Successful sends persist provider IDs and timestamps in one write", async () => {
    (prisma.birthdayEmailLog.updateMany as jest.Mock).mockResolvedValue({ count: 1 });

    const sentAt = new Date("2026-10-21T09:05:00.000Z");
    const res = await birthdayService.recordBirthdayJobSent(
      "job-success",
      "valid-token-abc",
      "resend-msg-999",
      sentAt
    );

    expect(res.alreadySent).toBe(false);
    expect(prisma.birthdayEmailLog.updateMany).toHaveBeenCalledWith({
      where: { id: "job-success", lockToken: "valid-token-abc", status: "PROCESSING" },
      data: expect.objectContaining({
        status: "SENT",
        providerMessageId: "resend-msg-999",
        sentAt,
        lockToken: null,
        lockedUntil: null,
        attemptCount: { increment: 1 },
      }),
    });
    expect(prisma.birthdayEmailLog.findUnique).not.toHaveBeenCalled();
  });

  it("6b. Reporting an already SENT job (including overlapping calls) returns alreadySent", async () => {
    // The guarded write matches nothing because the job is no longer PROCESSING
    (prisma.birthdayEmailLog.updateMany as jest.Mock).mockResolvedValue({ count: 0 });
    (prisma.birthdayEmailLog.findUnique as jest.Mock).mockResolvedValue({
      id: "job-done",
      status: "SENT",
      lockToken: null,
      attemptCount: 1,
    });

    const res = await birthdayService.recordBirthdayJobSent("job-done", "any-token");
    expect(res.alreadySent).toBe(true);
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
    (prisma.birthdayEmailLog.updateMany as jest.Mock).mockResolvedValue({ count: 1 });

    const res = await birthdayService.recordBirthdayJobFailed(
      "job-retryable",
      "tok-retry",
      "TRANSIENT",
      "Temporary 500 error",
      true
    );

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
    (prisma.birthdayEmailLog.updateMany as jest.Mock).mockResolvedValue({ count: 1 });

    const res = await birthdayService.recordBirthdayJobFailed(
      "job-perm",
      "tok-perm",
      "PERMANENT",
      "Invalid recipient mailbox not found",
      false
    );

    expect(res.status).toBe("DEAD");
    expect(res.nextRetryAt).toBeNull();
    expect(res.attemptCount).toBe(1);
    expect(prisma.birthdayEmailLog.updateMany).toHaveBeenCalledWith(
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
    (prisma.birthdayEmailLog.updateMany as jest.Mock).mockResolvedValue({ count: 1 });

    const res = await birthdayService.recordBirthdayJobFailed(
      "job-max-attempt",
      "tok-max",
      "TRANSIENT",
      "Server error 503",
      true
    );

    expect(res.status).toBe("DEAD");
    expect(res.attemptCount).toBe(5);
    expect(res.nextRetryAt).toBeNull();
  });

  // ──────────────────────────────────────────────
  // 10. Unauthorized internal API requests are rejected
  // ──────────────────────────────────────────────
  it("10. Unauthorized internal API requests are rejected by middleware", () => {
    const next: NextFunction = jest.fn();
    const res = {} as Response;

    // 10a: Missing secret
    const reqMissing = { headers: {} } as unknown as Request;
    expect(() => requireInternalAuth(reqMissing, res, next)).toThrow(
      expect.objectContaining({ statusCode: 401 })
    );

    // 10b: Invalid secret (different length from the real one)
    const reqInvalid = {
      headers: { "x-internal-secret": "wrong" },
    } as unknown as Request;
    expect(() => requireInternalAuth(reqInvalid, res, next)).toThrow(
      expect.objectContaining({ statusCode: 401 })
    );
    expect(next).not.toHaveBeenCalled();

    // 10c: Valid secret
    const reqValid = {
      headers: { "x-internal-secret": "super-secret-service-token" },
    } as unknown as Request;
    expect(() => requireInternalAuth(reqValid, res, next)).not.toThrow();
    expect(next).toHaveBeenCalled();
  });

  it("10e. Only the x-internal-secret header is accepted", () => {
    const next: NextFunction = jest.fn();
    const secret = "super-secret-service-token";
    for (const headers of [
      { "x-service-secret": secret },
      { authorization: `Bearer ${secret}` },
    ]) {
      const req = { headers } as unknown as Request;
      expect(() => requireInternalAuth(req, {} as Response, next)).toThrow(
        expect.objectContaining({ statusCode: 401 })
      );
    }
    expect(next).not.toHaveBeenCalled();
  });

  it("10d. Missing server secret is a 500", () => {
    config.INTERNAL_SERVICE_SECRET = undefined;
    const req = { headers: { "x-internal-secret": "anything" } } as unknown as Request;
    expect(() => requireInternalAuth(req, {} as Response, jest.fn())).toThrow(
      expect.objectContaining({ statusCode: 500 })
    );
  });

  // ──────────────────────────────────────────────
  // 11. Controller input validation and response shape
  // ──────────────────────────────────────────────
  describe("controller", () => {
    it("rejects an invalid sentAt with 400", async () => {
      const req = {
        params: { id: "job-1" },
        body: { lockToken: "tok", sentAt: "not-a-date" },
      } as unknown as Request;

      await expect(birthdayCtrl.markJobSent(req, mockResponse())).rejects.toMatchObject({
        statusCode: 400,
      });
      expect(prisma.birthdayEmailLog.findUnique).not.toHaveBeenCalled();
    });

    it("rejects an unknown errorClassification with 400", async () => {
      const req = {
        params: { id: "job-1" },
        body: { lockToken: "tok", errorClassification: "permanent" },
      } as unknown as Request;

      await expect(birthdayCtrl.markJobFailed(req, mockResponse())).rejects.toBeInstanceOf(
        ApiError
      );
      expect(prisma.birthdayEmailLog.findUnique).not.toHaveBeenCalled();
    });

    it("accepts UNCERTAIN and retries it like TRANSIENT", async () => {
      (prisma.birthdayEmailLog.findUnique as jest.Mock).mockResolvedValue({
        id: "job-1",
        status: "PROCESSING",
        lockToken: "tok",
        attemptCount: 0,
      });
      (prisma.birthdayEmailLog.updateMany as jest.Mock).mockResolvedValue({ count: 1 });

      const req = {
        params: { id: "job-1" },
        body: {
          lockToken: "tok",
          errorClassification: "UNCERTAIN",
          errorMessage: "Network timeout: ETIMEDOUT",
          isRetryable: true,
        },
      } as unknown as Request;
      const res = mockResponse();

      await birthdayCtrl.markJobFailed(req, res);

      const body = (res.json as jest.Mock).mock.calls[0][0];
      expect(body.status).toBe("FAILED");
      // Attempt 1 backoff is 5 minutes
      const diffMs = body.nextRetryAt.getTime() - Date.now();
      expect(diffMs).toBeGreaterThan(4 * 60 * 1000);
      expect(diffMs).toBeLessThanOrEqual(5 * 60 * 1000);
    });

    it("accepts a null providerMessageId and leaves the stored one unchanged", async () => {
      (prisma.birthdayEmailLog.updateMany as jest.Mock).mockResolvedValue({ count: 1 });

      const req = {
        params: { id: "job-1" },
        body: { lockToken: "tok", providerMessageId: null },
      } as unknown as Request;

      await birthdayCtrl.markJobSent(req, mockResponse());

      const { data } = (prisma.birthdayEmailLog.updateMany as jest.Mock).mock.calls[0][0];
      expect(data.status).toBe("SENT");
      // undefined tells Prisma to leave the column as is
      expect(data.providerMessageId).toBeUndefined();
    });

    it("rejects a non-string providerMessageId with 400", async () => {
      const req = {
        params: { id: "job-1" },
        body: { lockToken: "tok", providerMessageId: 12345 },
      } as unknown as Request;

      await expect(birthdayCtrl.markJobSent(req, mockResponse())).rejects.toMatchObject({
        statusCode: 400,
      });
      expect(prisma.birthdayEmailLog.findUnique).not.toHaveBeenCalled();
    });

    it("rejects a missing lockToken with 400", async () => {
      const req = { params: { id: "job-1" }, body: {} } as unknown as Request;

      await expect(birthdayCtrl.markJobSent(req, mockResponse())).rejects.toMatchObject({
        statusCode: 400,
      });
    });

    it("wraps a failure result as { success: true, ... }", async () => {
      (prisma.birthdayEmailLog.findUnique as jest.Mock).mockResolvedValue({
        id: "job-1",
        status: "PROCESSING",
        lockToken: "tok",
        attemptCount: 0,
      });
      (prisma.birthdayEmailLog.updateMany as jest.Mock).mockResolvedValue({ count: 1 });

      const req = {
        params: { id: "job-1" },
        body: { lockToken: "tok", errorClassification: "QUOTA", errorMessage: "429" },
      } as unknown as Request;
      const res = mockResponse();

      await birthdayCtrl.markJobFailed(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        status: "FAILED",
        attemptCount: 1,
        nextRetryAt: expect.any(Date),
      });
    });

    it("passes a valid sentAt through as a Date", async () => {
      (prisma.birthdayEmailLog.findUnique as jest.Mock).mockResolvedValue({
        id: "job-1",
        status: "PROCESSING",
        lockToken: "tok",
        attemptCount: 0,
        providerMessageId: null,
      });
      (prisma.birthdayEmailLog.updateMany as jest.Mock).mockResolvedValue({ count: 1 });

      const req = {
        params: { id: "job-1" },
        body: { lockToken: "tok", sentAt: "2026-10-21T09:05:00.000Z" },
      } as unknown as Request;
      const res = mockResponse();

      await birthdayCtrl.markJobSent(req, res);

      expect(prisma.birthdayEmailLog.updateMany).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({ sentAt: new Date("2026-10-21T09:05:00.000Z") }),
        })
      );
      expect(res.json).toHaveBeenCalledWith({ success: true, message: "Marked as sent" });
    });
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
