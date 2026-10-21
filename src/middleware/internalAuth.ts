import { Request, Response, NextFunction } from "express";
import crypto from "crypto";
import config from "../config";
import { ApiError } from "../utils/apiError";

function sha256(value: string): Buffer {
  return crypto.createHash("sha256").update(value, "utf-8").digest();
}

/**
 * Service-to-service authentication middleware for internal APIs.
 * Compares the `x-internal-secret` header against INTERNAL_SERVICE_SECRET in constant time.
 */
export function requireInternalAuth(
  req: Request,
  _res: Response,
  next: NextFunction
): void {
  const configuredSecret = config.INTERNAL_SERVICE_SECRET;

  if (!configuredSecret) {
    throw new ApiError(
      "Service authentication is not configured on server",
      500
    );
  }

  const providedSecret = req.headers["x-internal-secret"];

  if (!providedSecret || typeof providedSecret !== "string") {
    throw new ApiError(
      "Unauthorized: Missing internal service secret header",
      401
    );
  }

  // Hash both sides so the buffers are always equal length and the
  // comparison doesn't reveal the secret's length.
  if (!crypto.timingSafeEqual(sha256(providedSecret), sha256(configuredSecret))) {
    throw new ApiError(
      "Unauthorized: Invalid internal service secret",
      401
    );
  }

  next();
}
