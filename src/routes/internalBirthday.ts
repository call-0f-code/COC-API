import { Router } from "express";
import * as birthdayCtrl from "../controllers/birthdayEmail.controller";
import { requireInternalAuth } from "../middleware/internalAuth";

export default function internalBirthdayRouter(): Router {
  const router = Router();

  // Protect all internal birthday tracking endpoints with service-to-service auth
  router.use(requireInternalAuth);

  // Initialize jobs idempotently
  router.post("/initialize", birthdayCtrl.initializeJobs);

  // Atomically claim a batch of eligible jobs
  router.post("/claim", birthdayCtrl.claimJobs);

  // Statistics
  router.get("/stats", birthdayCtrl.getStats);

  // Report job send result
  router.post("/:id/sent", birthdayCtrl.markJobSent);

  // Report job failure result
  router.post("/:id/failed", birthdayCtrl.markJobFailed);

  return router;
}
