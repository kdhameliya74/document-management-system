import crypto from "crypto";
import mongoose from "mongoose";

export const isProduction = process.env.NODE_ENV === "production";

export const environment = isProduction ? "prod" : "dev";

export const isValidObjectId = (id) => {
  return id === null ? true : mongoose.Types.ObjectId.isValid(id);
};

export const shortId = (length = 16) => {
  return crypto.randomBytes(length).toString("base64url").slice(0, length);
};
