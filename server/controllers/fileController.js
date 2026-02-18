import path from "path";
import { PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import s3Client from "../config/s3.js";
import File from "../models/File.js";
import { asyncHandler } from "../middleware/error.js";

// @desc    Get presigned URL for upload
// @route   POST /api/files/upload-urls
// @access  Private
export const getPresignedUrls = asyncHandler(async (req, res) => {
  const files = req.body;

  if (!files?.length) {
    res.status(400).json({ success: false, message: "No files provided" });
  }

  const userId = req.user.id;
  const date = Date.now();

  const bucket = process.env.AWS_S3_BUCKET;

  const results = await Promise.allSettled(
    files.map(async (file) => {
      const safeFileName = file.fileName.replace(/[^a-zA-Z0-9.-]/g, "_");
      const storageKey = `${userId}/${date}-${file.uid}-${safeFileName}`;

      const command = new PutObjectCommand({
        Bucket: bucket,
        Key: storageKey,
        ContentType: file.fileType,
      });

      const uploadUrl = await getSignedUrl(s3Client, command, {
        expiresIn: 3600,
      });

      return {
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
    else failed.push(result.reason);
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
  const { name, size, type, storageKey, bucket, folderId } = req.body;
  const userId = req.user.id;

  const extension = path.extname(name).toLowerCase();

  const file = await File.create({
    name,
    originalName: name,
    extension: extension.replace(".", ""),
    mimeType: type,
    size,
    owner: userId,
    folder: folderId || null,
    path: storageKey, // For now using storageKey as path, or construct a meaningful path if needed
    storageKey,
    bucket,
    storageProvider: "s3",
    uploadStatus: "completed",
  });

  res.status(201).json({
    success: true,
    message: "File record created successfully",
    file,
  });
});
