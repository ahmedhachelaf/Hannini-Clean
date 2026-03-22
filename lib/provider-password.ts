import { randomBytes, scryptSync, timingSafeEqual } from "crypto";

export function createProviderPasswordSecret(password: string) {
  const salt = randomBytes(16).toString("hex");
  const hash = scryptSync(password, salt, 64).toString("hex");
  return { salt, hash };
}

export function verifyProviderPassword(password: string, salt?: string | null, hash?: string | null) {
  if (!password || !salt || !hash) {
    return false;
  }

  const candidate = scryptSync(password, salt, 64);
  const expected = Buffer.from(hash, "hex");

  if (candidate.length !== expected.length) {
    return false;
  }

  return timingSafeEqual(candidate, expected);
}
