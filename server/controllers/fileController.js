import { PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import s3Client from "../config/s3.js";
import File from "../models/File.js";
import { asyncHandler } from "../middleware/error.js";
import path from "path";

// @desc    Get presigned URL for upload
// @route   POST /api/files/upload-url
// @access  Private
export const getPresignedUrl = asyncHandler(async (req, res, next) => {
    console.log(req.body);
    const { fileName, fileType } = req.body;
    const userId = "user-sample-created";

    const storageKey = `${userId}/${Date.now()}-${fileName}`;
    const bucket = process.env.AWS_S3_BUCKET;

    const command = new PutObjectCommand({
        Bucket: bucket,
        Key: storageKey,
        ContentType: fileType,
    });

    const uploadUrl = await getSignedUrl(s3Client, command, { expiresIn: 3600 });

    res.status(200).json({
        success: true,
        uploadUrl,
        storageKey,
        bucket,
    });
});

// @desc    Confirm upload and create file record
// @route   POST /api/files/confirm
// @access  Private
export const confirmUpload = asyncHandler(async (req, res, next) => {
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
