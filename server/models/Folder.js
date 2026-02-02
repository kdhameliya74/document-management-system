import mongoose from 'mongoose';

const folderSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please provide folder name'],
    trim: true,
    maxlength: [255, 'Folder name cannot be more than 255 characters']
  },
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  parent: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Folder',
    default: null // null means root folder
  },
  path: {
    type: String,
    required: true,
    index: true
  },
  color: {
    type: String,
    default: null // For UI customization
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
  }
}, {
  timestamps: true
});

// Index for faster queries
folderSchema.index({ owner: 1, parent: 1 });
folderSchema.index({ owner: 1, isTrashed: 1 });
folderSchema.index({ path: 1 });

// Pre-save middleware to build path
folderSchema.pre('save', async function(next) {
  if (this.isNew || this.isModified('parent') || this.isModified('name')) {
    if (this.parent) {
      const parentFolder = await mongoose.model('Folder').findById(this.parent);
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
folderSchema.methods.hasAccess = function(userId, requiredPermission = 'view') {
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

const Folder = mongoose.model('Folder', folderSchema);

export default Folder;
