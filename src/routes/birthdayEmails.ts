import { Router } from "express";
import * as birthdayCtrl from "../controllers/birthdayEmail.controller";
import { requireInternalAuth } from "../middleware/internalAuth";

/**
 * Internal, service-to-service API used by the birthday email worker.
 * Every route requires the INTERNAL_SERVICE_SECRET, sent as an
 * `x-internal-secret` / `x-service-secret` header or as a Bearer token.
 */
export default function birthdayEmailsRouter(): Router {
  const router = Router();

  router.use(requireInternalAuth);

  /**
   * @api {post} /birthday-emails/initialize Create birthday email jobs
   * @apiName InitializeBirthdayJobs
   * @apiGroup BirthdayEmail
   * @apiDescription Idempotently creates one PENDING job per eligible member
   * (approved, not ghosted, has a birth date and email) for the given year.
   * Existing jobs are left untouched.
   *
   * @apiHeader {String} x-internal-secret Internal service secret.
   *
   * @apiBody {Number}   birthdayYear Year the birthday email is for. (Required)
   * @apiBody {String[]} memberIds    Member IDs to create jobs for. (Required)
   *
   * @apiSuccess {Boolean} success           Always true.
   * @apiSuccess {Object}  data
   * @apiSuccess {Number}  data.created       Jobs newly created.
   * @apiSuccess {Number}  data.existing      Jobs that already existed.
   * @apiSuccess {Number}  data.totalEligible Eligible members found.
   * @apiError (400) BadRequest Invalid birthdayYear or memberIds.
   * @apiError (401) Unauthorized Missing or invalid service secret.
   */
  router.post("/initialize", birthdayCtrl.initializeJobs);

  /**
   * @api {post} /birthday-emails/claim Claim a batch of jobs
   * @apiName ClaimBirthdayJobs
   * @apiGroup BirthdayEmail
   * @apiDescription Atomically leases PENDING jobs, FAILED jobs due for retry,
   * and PROCESSING jobs whose lease expired. Each claimed job gets a fresh
   * lockToken that must be sent back when reporting the result.
   *
   * @apiHeader {String} x-internal-secret Internal service secret.
   *
   * @apiBody {Number} [batchSize=10]           Jobs to claim (1-50).
   * @apiBody {Number} [leaseDurationMs=300000] Lease length in ms (10s-1h).
   *
   * @apiSuccess {Boolean}  success Always true.
   * @apiSuccess {Number}   count   Number of jobs claimed.
   * @apiSuccess {Object[]} jobs    Claimed jobs (id, memberId, birthdayYear, attemptCount, lockToken).
   * @apiError (401) Unauthorized Missing or invalid service secret.
   */
  router.post("/claim", birthdayCtrl.claimJobs);

  /**
   * @api {get} /birthday-emails/stats Get job statistics
   * @apiName GetBirthdayEmailStats
   * @apiGroup BirthdayEmail
   *
   * @apiHeader {String} x-internal-secret Internal service secret.
   *
   * @apiSuccess {Boolean} success Always true.
   * @apiSuccess {Object}  stats   Counts: pending, processing, sent, failed, dead, dueForRetry, total.
   * @apiError (401) Unauthorized Missing or invalid service secret.
   */
  router.get("/stats", birthdayCtrl.getStats);

  /**
   * @api {post} /birthday-emails/:id/sent Report a sent email
   * @apiName MarkBirthdayJobSent
   * @apiGroup BirthdayEmail
   * @apiDescription Marks a claimed job as SENT. Calling it again for a job
   * that is already SENT succeeds without changing anything.
   *
   * @apiHeader {String} x-internal-secret Internal service secret.
   *
   * @apiParam (URL Params) {String} id Job ID.
   *
   * @apiBody {String} lockToken           Token returned by /claim. (Required)
   * @apiBody {String} [providerMessageId] Email provider's message ID.
   * @apiBody {String} [sentAt]            ISO timestamp of the send. Defaults to now.
   *
   * @apiSuccess {Boolean} success Always true.
   * @apiSuccess {String}  message Result description.
   * @apiError (400) BadRequest Missing lockToken or invalid sentAt.
   * @apiError (404) NotFound   Job not found.
   * @apiError (409) Conflict   Lease expired or held by another worker.
   */
  router.post("/:id/sent", birthdayCtrl.markJobSent);

  /**
   * @api {post} /birthday-emails/:id/failed Report a failed send
   * @apiName MarkBirthdayJobFailed
   * @apiGroup BirthdayEmail
   * @apiDescription Records a failed attempt. Retryable failures are
   * rescheduled with backoff; permanent failures, or a job's 5th attempt,
   * move it to DEAD.
   *
   * @apiHeader {String} x-internal-secret Internal service secret.
   *
   * @apiParam (URL Params) {String} id Job ID.
   *
   * @apiBody {String}  lockToken Token returned by /claim. (Required)
   * @apiBody {String="TRANSIENT","PERMANENT","CONFIG","QUOTA"} [errorClassification=TRANSIENT] Failure type.
   * @apiBody {String}  [errorMessage]     Error details. Secrets are redacted before storing.
   * @apiBody {Boolean} [isRetryable=true] Whether the failure can be retried.
   *
   * @apiSuccess {Boolean} success      Always true.
   * @apiSuccess {String}  status       FAILED or DEAD.
   * @apiSuccess {Number}  attemptCount Attempts made so far.
   * @apiSuccess {String}  nextRetryAt  Next retry time, or null when DEAD.
   * @apiError (400) BadRequest Missing lockToken or invalid errorClassification.
   * @apiError (404) NotFound   Job not found.
   * @apiError (409) Conflict   Lease expired or held by another worker.
   */
  router.post("/:id/failed", birthdayCtrl.markJobFailed);

  return router;
}
