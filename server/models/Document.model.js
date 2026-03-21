import mongoose from "mongoose";
import { FILE_VALIDATION, FILE_UPLOAD_STATUS } from "../constants/File.js";

import {
  DOC_TYPES,
  DOC_TYPES_ARRAY,
  PERMISSION_LEVELS,
  PERMISSION_ARRAY,
} from "../constants/Shared.js";

const documentSchema = new mongoose.Schema(
  {
    docType: {
      type: String,
      required: true,
      enum: DOC_TYPES_ARRAY,
      index: true,
    },

    name: {
      type: String,
      required: [true, FILE_VALIDATION.NAME_REQUIRED],
      trim: true,
      maxlength: [255, FILE_VALIDATION.NAME_MAXLENGTH],
    },
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    /** Parent folder ID */
    parentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Document",
      default: null,
    },
    /** Materialized path for efficient subtree queries and breadcrumbs */
    path: {
      type: String,
      required: true,
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
        email: {
          type: String,
          required: true,
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
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
    discriminatorKey: "docType",
  },
);


// Primary browse: list children of a folder, scoped to owner, not trashed
documentSchema.index({ owner: 1, parentId: 1, isTrashed: 1 });

// Browse filtered by type (folders-only list for sidebar etc.)
documentSchema.index({ owner: 1, parentId: 1, docType: 1, isTrashed: 1 });

// Trash view: top-level trashed items for owner
documentSchema.index({ owner: 1, isTrashed: 1, docType: 1 });

// Starred view
documentSchema.index({ owner: 1, isStarred: 1, isTrashed: 1 });

// Path-prefix operations (cascade rename/delete on subtree)
documentSchema.index({ path: 1 });

// Full-text search across name and tags
documentSchema.index({ name: "text", tags: "text" });

// Upload pipeline status checks
documentSchema.index({ uploadStatus: 1 });

// Recent documents
documentSchema.index({ owner: 1, updatedAt: -1 });

documentSchema.index({ "sharedWith.user": 1 });

// ─── Path computation (pre-validate)
documentSchema.pre("validate", async function () {
  const isNew = this.isNew;
  const parentIdChanged = this.isModified("parentId");
  const nameChanged = this.isModified("name");

  if (isNew || parentIdChanged || nameChanged) {
    if (this.parentId) {
      const parentDoc = await this.model("Document").findOne({
        _id: this.parentId,
        owner: this.owner,
      });

      if (!parentDoc) {
        this.path = `/${this.name}`;
      } else {
        this.path = `${parentDoc.path}/${this.name}`;
      }
    } else {
      this.path = `/${this.name}`;
    }
  }
});

// ─── Cascade path update on rename
documentSchema.pre("save", async function () {
  if (this.isNew) return;

  if (!this.isModified("parentId") && !this.isModified("name")) {
    return;
  }

  const existing = await this.constructor.findById(this._id).select("path").lean();
  this._originalPath = existing?.path;
});

function escapeRegex(str) {
  return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

documentSchema.post("save", async function (doc) {
  if (!doc._originalPath || doc._originalPath === doc.path) return;

  const oldPath = doc._originalPath;
  const newPath = doc.path;
  const escapedOldPath = escapeRegex(oldPath);

  // Update all descendants in the same collection
  await mongoose.model("Document").updateMany(
    {
      owner: doc.owner,
      path: { $regex: `^${escapedOldPath}/` },
    },
    [
      {
        $set: {
          path: {
            $concat: [
              newPath,
              {
                $substrCP: [
                  "$path",
                  { $strLenCP: oldPath },
                  { $subtract: [{ $strLenCP: "$path" }, { $strLenCP: oldPath }] },
                ],
              },
            ],
          },
        },
      },
    ],
  );
});

const Document = mongoose.model("Document", documentSchema);
const Folder = Document.discriminator(
  DOC_TYPES.FOLDER,
  new mongoose.Schema({
    color: {
      type: String,
      default: null,
    },
  }),
);

const File = Document.discriminator(
  DOC_TYPES.FILE,
  new mongoose.Schema({
    originalName: {
      type: String,
    },
    extension: {
      type: String,
      lowercase: true,
    },
    mimeType: {
      type: String,
    },
    size: {
      type: Number,
    },
    currentVersion: {
      type: Number,
      default: 1,
    },
    downloadCount: {
      type: Number,
      default: 0,
    },
    lastAccessedAt: {
      type: Date,
      default: null,
    },
    storageKey: {
      type: String, // Actual object key on S3
    },
    storageProvider: {
      type: String,
      enum: ["s3"],
      default: "s3",
    },
    bucket: {
      type: String,
    },
    uploadStatus: {
      type: String,
      enum: [FILE_UPLOAD_STATUS.PENDING, FILE_UPLOAD_STATUS.COMPLETED, FILE_UPLOAD_STATUS.FAILED],
      default: FILE_UPLOAD_STATUS.PENDING,
    },
  }),
);

export { Folder, File };
export default Document;
