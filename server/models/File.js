import mongoose from 'mongoose';

const fileSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please provide file name'],
    trim: true,
    maxlength: [255, 'File name cannot be more than 255 characters']
  },
  originalName: {
    type: String,
    required: true
  },
  extension: {
    type: String,
    required: true,
    lowercase: true
  },
  mimeType: {
    type: String,
    required: true
  },
  size: {
    type: Number,
    required: true // in bytes
  },
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  folder: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Folder',
    default: null // null means root
  },
  path: {
    type: String,
    required: true
  },
  storageKey: {
    type: String,
    required: true // Actual file location on disk/cloud
  },
  currentVersion: {
    type: Number,
    default: 1
  },
  isStarred: {
    type: Boolean,
    default: false
  },
  isTrashed: {
    type: Boolean,
    default: false
  },
  trashedAt: {
    type: Date,
    default: null
  },
  tags: [{
    type: String,
    trim: true
  }],
  description: {
    type: String,
    maxlength: [1000, 'Description cannot be more than 1000 characters']
  },
  sharedWith: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    permission: {
      type: String,
      enum: ['view', 'edit', 'admin'],
      default: 'view'
    },
    sharedAt: {
      type: Date,
      default: Date.now
    }
  }],
  isPublic: {
    type: Boolean,
    default: false
  },
  publicLink: {
    type: String,
    default: null,
    unique: true,
    sparse: true
  },
  downloadCount: {
    type: Number,
    default: 0
  },
  lastAccessedAt: {
    type: Date,
    default: null
  }
}, {
  timestamps: true
});

// Indexes for performance
fileSchema.index({ owner: 1, folder: 1 });
fileSchema.index({ owner: 1, isTrashed: 1 });
fileSchema.index({ name: 'text', tags: 'text' }); // Text search
fileSchema.index({ mimeType: 1 });

// Method to check if user has access
fileSchema.methods.hasAccess = function(userId, requiredPermission = 'view') {
  // Owner has full access
  if (this.owner.toString() === userId.toString()) {
    return true;
  }

  // Check if public
  if (this.isPublic && requiredPermission === 'view') {
    return true;
  }

  // Check shared permissions
  const sharedUser = this.sharedWith.find(
    share => share.user.toString() === userId.toString()
  );

  if (!sharedUser) return false;

  const permissionLevels = { view: 1, edit: 2, admin: 3 };
  return permissionLevels[sharedUser.permission] >= permissionLevels[requiredPermission];
};

// Virtual for file URL (to be implemented based on storage solution)
fileSchema.virtual('url').get(function() {
  return `/api/files/${this._id}/download`;
});

fileSchema.set('toJSON', { virtuals: true });
fileSchema.set('toObject', { virtuals: true });

const File = mongoose.model('File', fileSchema);

export default File;
