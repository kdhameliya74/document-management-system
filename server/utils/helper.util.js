import crypto from "crypto";

export const isProduction = process.env.NODE_ENV === "production";

export const environment = isProduction ? "prod" : "dev";

export const shortId = (length = 16) => {
  return crypto.randomBytes(length).toString("base64url").slice(0, length);
};
