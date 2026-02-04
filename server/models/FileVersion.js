import mongoose from "mongoose";

const fileVersionSchema = new mongoose.Schema(
  {
    file: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "File",
      required: true,
      index: true,
    },
    versionNumber: {
      type: Number,
      required: true,
    },
    name: {
      type: String,
      required: true,
    },
    size: {
      type: Number,
      required: true,
    },
    mimeType: {
      type: String,
      required: true,
    },
    storageKey: {
      type: String,
      required: true,
    },
    uploadedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    changeDescription: {
      type: String,
      maxlength: [500, "Change description cannot be more than 500 characters"],
    },
    isCurrent: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  },
);

// Compound index for file and version
fileVersionSchema.index({ file: 1, versionNumber: -1 });
fileVersionSchema.index({ file: 1, isCurrent: 1 });

// Static method to create new version
fileVersionSchema.statics.createVersion = async function (fileId, versionData) {
  const latestVersion = await this.findOne({ file: fileId }).sort({ versionNumber: -1 }).limit(1);

  const versionNumber = latestVersion ? latestVersion.versionNumber + 1 : 1;

  // Set all previous versions to not current
  await this.updateMany({ file: fileId, isCurrent: true }, { isCurrent: false });

  return await this.create({
    ...versionData,
    file: fileId,
    versionNumber,
    isCurrent: true,
  });
};

const FileVersion = mongoose.model("FileVersion", fileVersionSchema);

export default FileVersion;
