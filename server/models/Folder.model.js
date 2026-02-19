import mongoose from "mongoose";
import { FOLDER_VALIDATION } from "../constants/Folder.js";
import { PERMISSION_LEVELS, PERMISSION_ARRAY } from "../constants/Shared.js";

const folderSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, FOLDER_VALIDATION.NAME_REQUIRED],
      trim: true,
      maxlength: [255, FOLDER_VALIDATION.NAME_MAXLENGTH],
    },
    docType: {
      type: String,
      default: "folder",
    },
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    parent: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Folder",
      default: null, // null means root folder
    },
    path: {
      type: String,
      required: true,
      index: true,
    },
    color: {
      type: String,
      default: null, // For UI customization
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
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
);

// Index for faster queries
folderSchema.index({ owner: 1, parent: 1 });
folderSchema.index({ owner: 1, isTrashed: 1 });
folderSchema.index({ path: 1 });

folderSchema.pre("validate", async function (next) {
  if (this.isNew || this.isModified("parent") || this.isModified("name")) {
    if (this.parent) {
      const parentFolder = await mongoose.model("Folder").findById(this.parent);
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

// Method to check if user has access
folderSchema.methods.hasAccess = function (userId, requiredPermission = PERMISSION_LEVELS.VIEW) {
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

// A small helper to grab the original path before validation changes it
folderSchema.post("init", function (doc) {
  doc._originalPath = doc.path;
});

function escapeRegex(str) {
  return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

folderSchema.post("save", async function (doc) {
  if (!doc._originalPath || doc._originalPath === doc.path) return;

  const oldPath = doc._originalPath;
  const newPath = doc.path;

  const escapedOldPath = escapeRegex(oldPath);

  await doc.constructor.updateMany({ path: { $regex: `^${escapedOldPath}/` } }, [
    {
      $set: {
        path: {
          $concat: [
            newPath,
            {
              $substrBytes: [
                "$path",
                oldPath.length,
                { $subtract: [{ $strLenBytes: "$path" }, oldPath.length] },
              ],
            },
          ],
        },
      },
    },
  ]);
});

const Folder = mongoose.model("Folder", folderSchema);

export default Folder;
