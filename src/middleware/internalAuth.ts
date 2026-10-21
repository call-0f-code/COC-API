import { Request, Response, NextFunction } from "express";
import crypto from "crypto";
import { ApiError } from "../utils/apiError";

/**
 * Service-to-service authentication middleware for internal APIs.
 * Compares incoming secret header against configured environment secret using constant-time comparison.
 */
export function requireInternalAuth(
  req: Request,
  _res: Response,
  next: NextFunction
): void {
  const configuredSecret =
    process.env.INTERNAL_SERVICE_SECRET || process.env.BIRTHDAY_SERVICE_SECRET;

  if (!configuredSecret) {
    throw new ApiError(
      "Service authentication is not configured on server",
      500
    );
  }

  const authHeader = req.headers["authorization"];
  let providedSecret =
    (req.headers["x-internal-secret"] as string) ||
    (req.headers["x-service-secret"] as string);

  if (!providedSecret && authHeader && authHeader.startsWith("Bearer ")) {
    providedSecret = authHeader.substring(7).trim();
  }

  if (!providedSecret) {
    throw new ApiError(
      "Unauthorized: Missing internal service secret header",
      401
    );
  }

  const providedBuffer = Buffer.from(providedSecret, "utf-8");
  const expectedBuffer = Buffer.from(configuredSecret, "utf-8");

  if (
    providedBuffer.length !== expectedBuffer.length ||
    !crypto.timingSafeEqual(providedBuffer, expectedBuffer)
  ) {
    throw new ApiError(
      "Unauthorized: Invalid internal service secret",
      401
    );
  }

  next();
}
