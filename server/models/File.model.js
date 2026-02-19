import mongoose from "mongoose";
import { FILE_VALIDATION, FILE_UPLOAD_STATUS } from "../constants/File.js";
import { PERMISSION_LEVELS, PERMISSION_ARRAY } from "../constants/Shared.js";

const fileSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, FILE_VALIDATION.NAME_REQUIRED],
      trim: true,
      maxlength: [255, FILE_VALIDATION.NAME_MAXLENGTH],
    },
    originalName: {
      type: String,
      required: true,
    },
    extension: {
      type: String,
      required: true,
      lowercase: true,
    },
    docType: {
      type: String,
      default: "file",
    },
    mimeType: {
      type: String,
      required: true,
    },
    size: {
      type: Number,
      required: true, // in bytes
    },
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    folderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Folder",
      default: null, // null means root
    },
    path: {
      type: String,
      required: true,
    },
    currentVersion: {
      type: Number,
      default: 1,
    },
    isStarred: {
      type: Boolean,
      default: false,
    },
    isTrashed: {
      type: Boolean,
      default: false,
    },
    trashedAt: {
      type: Date,
      default: null,
    },
    tags: [
      {
        type: String,
        trim: true,
      },
    ],
    description: {
      type: String,
      maxlength: [1000, FILE_VALIDATION.DESCRIPTION_MAXLENGTH],
    },
    sharedWith: [
      {
        user: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
        },
        permission: {
          type: String,
          enum: PERMISSION_ARRAY,
          default: PERMISSION_LEVELS.VIEW,
        },
        sharedAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
    isPublic: {
      type: Boolean,
      default: false,
    },
    publicLink: {
      type: String,
      unique: true,
      sparse: true,
    },
    downloadCount: {
      type: Number,
      default: 0,
    },
    lastAccessedAt: {
      type: Date,
      default: null,
    },

    // NEW S3 FIELDS BELOW
    storageKey: {
      type: String,
      required: true, // Actual file location on disk/cloud
    },
    storageProvider: {
      type: String,
      enum: ["s3"],
      default: "s3",
      required: true,
    },

    bucket: {
      type: String,
      required: true,
    },
    uploadStatus: {
      type: String,
      enum: [FILE_UPLOAD_STATUS.PENDING, FILE_UPLOAD_STATUS.COMPLETED, FILE_UPLOAD_STATUS.FAILED],
      default: FILE_UPLOAD_STATUS.PENDING,
      index: true,
    },
  },
  {
    timestamps: true,
  },
);

// Indexes for performance
fileSchema.index({ owner: 1, folder: 1 });
fileSchema.index({ owner: 1, isTrashed: 1 });
fileSchema.index({ name: "text", tags: "text" }); // Text search
fileSchema.index({ mimeType: 1 });

// Method to check if user has access
fileSchema.methods.hasAccess = function (userId, requiredPermission = PERMISSION_LEVELS.VIEW) {
  // Owner has full access
  if (this.owner.toString() === userId.toString()) {
    return true;
  }

  // Check if public
  if (this.isPublic && requiredPermission === PERMISSION_LEVELS.VIEW) {
    return true;
  }

  // Check shared permissions
  const sharedUser = this.sharedWith.find((share) => share.user.toString() === userId.toString());

  if (!sharedUser) return false;

  const permissionLevels = {
    [PERMISSION_LEVELS.VIEW]: 1,
    [PERMISSION_LEVELS.EDIT]: 2,
    [PERMISSION_LEVELS.ADMIN]: 3,
  };
  return permissionLevels[sharedUser.permission] >= permissionLevels[requiredPermission];
};

// Virtual for file URL (to be implemented based on storage solution)
// fileSchema.virtual("url").get(function () {
//   return `/api/files/${this._id}/download`;
// });

fileSchema.pre("validate", async function (next) {
  if (this.isNew || this.isModified("folder") || this.isModified("name")) {
    if (this.folder) {
      const parentFolder = await mongoose.model("Folder").findById(this.folder);
      if (parentFolder) {
        this.path = `${parentFolder.path}/${this.name}`;
      } else {
        this.path = `/${this.name}`;
      }
    } else {
      this.path = `/${this.name}`;
    }
  }
  next();
});

fileSchema.set("toJSON", { virtuals: true });
fileSchema.set("toObject", { virtuals: true });

const File = mongoose.model("File", fileSchema);

export default File;
