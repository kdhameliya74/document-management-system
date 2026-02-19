import s3Client from "../config/s3.js";
import File from "../models/File.model.js";

import { shortId, environment } from "../utils/helper.util.js";
import { PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { asyncHandler } from "../middlewares/error.middleware.js";

// @desc    Get presigned URL for upload
// @route   POST /api/files/upload-urls
// @access  Private
export const getPresignedUrls = asyncHandler(async (req, res) => {
  const files = req.body;

  if (!files?.length) {
    res.status(400).json({ success: false, message: "No files provided" });
  }

  const userId = req.user.id;

  const bucket = process.env.AWS_S3_BUCKET;
  const fixedKey = `${environment}/users/${userId}/`;

  const results = await Promise.allSettled(
    files.map(async (file) => {
      const extension = file.fileName.split(".").pop();
      const storageKey = `${fixedKey}${shortId(16)}.${extension}`;
      const command = new PutObjectCommand({
        Bucket: bucket,
        Key: storageKey,
        ContentType: file.fileType,
      });

      const uploadUrl = await getSignedUrl(s3Client, command, {
        expiresIn: 3600,
      });

      return {
        bucket,
        uploadUrl,
        storageKey,
        fileName: file.fileName,
        uid: file.uid,
      };
    }),
  );

  const success = [];
  const failed = [];

  results.forEach((result) => {
    if (result.status === "fulfilled") success.push(result.value);
    else {
      // TODO: send failed ids
      failed.push(result);
    }
  });

  res.status(200).json({
    success: true,
    successfulUploads: success,
    failedUploads: failed,
  });
});

// @desc    Confirm upload and create file record
// @route   POST /api/files/confirm
// @access  Private
export const confirmUpload = asyncHandler(async (req, res) => {
  const { name, size, type, storageKey, bucket, folderId, originalName, mimeType, extension } =
    req.body;
  const userId = req.user.id;

  const file = await File.create({
    name,
    size,
    type,
    storageKey,
    bucket,
    folderId,
    originalName,
    mimeType,
    extension,
    owner: userId,
  });

  res.status(201).json({
    success: true,
    message: "Recorded",
    file,
  });
});
