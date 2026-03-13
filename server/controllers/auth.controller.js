import User from "../models/User.model.js";
import { asyncHandler } from "../middlewares/error.middleware.js";
import { isProduction, environment, shortId } from "../utils/helper.util.js";
import s3Client from "../config/s3.js";
import { PutObjectCommand, DeleteObjectCommand, GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

// Helper function to send token response
const sendTokenResponse = async (user, statusCode, res) => {
  const token = user.generateAuthToken();

  const options = {
    expires: new Date(Date.now() + parseInt(process.env.JWT_COOKIE_EXPIRE) * 24 * 60 * 60 * 1000),
    httpOnly: true,
    secure: isProduction,
    sameSite: "strict",
  };

  // Generate signed URL for avatar if it exists
  let avatarUrl = null;
  if (user.avatar && user.avatar.storageKey) {
    try {
      const command = new GetObjectCommand({
        Bucket: user.avatar.bucket,
        Key: user.avatar.storageKey,
      });
      avatarUrl = await getSignedUrl(s3Client, command, { expiresIn: 3600 });
    } catch (error) {
      console.error("Error generating signed URL for avatar:", error);
    }
  }

  // Remove password from output
  const userObj = user.toObject();
  delete userObj.password;
  if (avatarUrl) {
    userObj.avatarUrl = avatarUrl;
  }

  res.status(statusCode).cookie("token", token, options).json({
    success: true,
    token,
    user: userObj,
  });
};

// @route   POST /api/auth/register
export const register = asyncHandler(async (req, res, _next) => {
  const { firstName, lastName, email, password, username } = req.body;

  // Validate input
  if (!firstName || !lastName || !email || !password || !username) {
    return res.status(400).json({
      success: false,
      message: "Please provide all required fields",
    });
  }

  // Check if user with email already exists
  const existingUserByEmail = await User.findOne({ email });
  if (existingUserByEmail) {
    return res.status(400).json({
      success: false,
      message: "User with this email already exists",
    });
  }

  // Check if user with username already exists
  const existingUserByUsername = await User.findOne({ username });
  if (existingUserByUsername) {
    return res.status(400).json({
      success: false,
      message: "Username is already taken",
    });
  }

  // Create user
  const user = await User.create({
    firstName,
    lastName,
    email,
    password,
    username,
  });

  await sendTokenResponse(user, 201, res);
});

// @route   POST /api/auth/login
export const login = asyncHandler(async (req, res, _next) => {
  const { identifier, password } = req.body;

  // Validate input - need either email or username
  if (!identifier || !password) {
    return res.status(400).json({
      success: false,
      message: "Please provide email/username and password",
    });
  }

  const query = { $or: [{ email: identifier }, { username: identifier }] };
  const user = await User.findOne(query).select("+password");

  if (!user) {
    return res.status(401).json({
      success: false,
      message: "Incorrect email/username and password",
    });
  }

  // Check if user is active
  if (!user.isActive) {
    return res.status(401).json({
      success: false,
      message: "Your account has been deactivated",
    });
  }

  // Check if password matches
  const isMatch = await user.comparePassword(password);

  if (!isMatch) {
    return res.status(401).json({
      success: false,
      message: "Invalid credentials",
    });
  }

  // Update last login
  user.lastLogin = Date.now();
  await user.save({ validateBeforeSave: false });

  await sendTokenResponse(user, 200, res);
});

// @route   GET /api/auth/me
export const getMe = asyncHandler(async (req, res, _next) => {
  const user = req.user;

  // Generate signed URL for avatar if it exists
  let avatarUrl = null;
  if (user.avatar && user.avatar.storageKey) {
    try {
      const command = new GetObjectCommand({
        Bucket: user.avatar.bucket,
        Key: user.avatar.storageKey,
      });
      avatarUrl = await getSignedUrl(s3Client, command, { expiresIn: 3600 });
    } catch (error) {
      console.error("Error generating signed URL for avatar:", error);
    }
  }

  const userObj = user.toObject();
  if (avatarUrl) {
    userObj.avatarUrl = avatarUrl;
  }

  res.status(200).json({
    success: true,
    user: {
      id: userObj._id,
      fullName: `${userObj.firstName} ${userObj.lastName}`,
      firstName: userObj.firstName,
      lastName: userObj.lastName,
      email: userObj.email,
      username: userObj.username,
      avatar: userObj.avatar,
      avatarUrl: userObj.avatarUrl,
      role: userObj.role,
      createdAt: userObj.createdAt,
      lastLogin: userObj.lastLogin,
      updatedAt: userObj.updatedAt,
    },
  });
});

// @route   POST /api/auth/logout
export const logout = asyncHandler(async (req, res, _next) => {
  res.cookie("token", "none", {
    expires: new Date(Date.now() + 10 * 1000),
    httpOnly: true,
    secure: isProduction,
    sameSite: "strict",
  });

  res.status(200).json({
    success: true,
    message: "Logged out successfully",
  });
});

// @route   PUT /api/auth/updatedetails
export const updateDetails = asyncHandler(async (req, res, _next) => {
  const fieldsToUpdate = {
    firstName: req.body.firstName,
    lastName: req.body.lastName,
  };

  if (req.body.avatar) {
    fieldsToUpdate.avatar = {
      storageKey: req.body.avatar.storageKey,
      bucket: req.body.avatar.bucket,
    };
  }

  // Remove undefined fields
  Object.keys(fieldsToUpdate).forEach(
    (key) => fieldsToUpdate[key] === undefined && delete fieldsToUpdate[key],
  );

  const user = await User.findByIdAndUpdate(req.user.id, fieldsToUpdate, {
    new: true,
    runValidators: true,
  });

  sendTokenResponse(user, 200, res);
});

// @route   GET /api/auth/avatar-upload-url
export const getAvatarUploadUrl = asyncHandler(async (req, res, _next) => {
  const userId = req.user.id;
  const bucket = process.env.AWS_S3_BUCKET;
  const fileName = req.query.fileName;

  if (!fileName) {
    return res.status(400).json({ success: false, message: "Please provide a file name" });
  }

  const extension = fileName.split(".").pop();
  const storageKey = `${environment}/${userId}/profile/${shortId(16)}.${extension}`;

  // Delete old avatar if exists
  const { bucket: oldBucket, storageKey: oldStorageKey } = req.user.avatar;
  if (oldStorageKey) {
    try {
      const deleteCommand = new DeleteObjectCommand({
        Bucket: oldBucket,
        Key: oldStorageKey,
      });
      await s3Client.send(deleteCommand);
    } catch (error) {
      console.error("Error deleting old avatar:", error);
    }
  }

  const command = new PutObjectCommand({
    Bucket: bucket,
    Key: storageKey,
  });

  const uploadUrl = await getSignedUrl(s3Client, command, { expiresIn: 3600 });

  res.status(200).json({
    success: true,
    uploadUrl,
    storageKey,
    bucket,
  });
});

// @route   PUT /api/auth/updatepassword
export const updatePassword = asyncHandler(async (req, res, _next) => {
  const user = await User.findById(req.user.id).select("+password");

  // Check current password
  if (!(await user.comparePassword(req.body.currentPassword))) {
    return res.status(401).json({
      success: false,
      message: "Current password is incorrect",
    });
  }

  // Validate new password
  if (!req.body.newPassword || req.body.newPassword.length < 8) {
    return res.status(400).json({
      success: false,
      message: "New password must be at least 8 characters",
    });
  }

  user.password = req.body.newPassword;
  await user.save();

  sendTokenResponse(user, 200, res);
});
