# Database Schema Relationships

## Entity Relationship Diagram

```
┌─────────────────────────────────────────────────────────────────────────┐
│                         DOCUMENT MANAGEMENT SYSTEM                       │
│                           Database Architecture                          │
└─────────────────────────────────────────────────────────────────────────┘

┌──────────────┐
│     USER     │
│──────────────│
│ _id          │◄─────────────────────────────────────────┐
│ firstName    │                                           │
│ lastName     │                                           │
│ email        │                                           │
│ password     │                                           │
│ role         │                                           │
│ storageUsed  │                                           │
│ storageLimit │                                           │
└──────────────┘                                           │
       │                                                   │
       │ owner                                             │
       │                                                   │
       ├──────────────┬──────────────┬──────────────┐    │
       │              │              │              │     │
       ▼              ▼              ▼              ▼     │
┌──────────┐   ┌──────────┐   ┌──────────┐   ┌──────────┐
│  FOLDER  │   │   FILE   │   │ COMMENT  │   │ACTIVITY  │
│──────────│   │──────────│   │──────────│   │   LOG    │
│ _id      │   │ _id      │   │ _id      │   │──────────│
│ name     │   │ name     │   │ content  │   │ user     │───┘
│ owner    │───┤ owner    │   │ user     │───┤ action   │
│ parent   │◄──│ folder   │   │ file     │───┤ target   │
│ path     │   │ size     │   │ parent   │   │ metadata │
│ shared   │   │ version  │   │ mentions │   │ ipAddr   │
│ isPublic │   │ tags     │   │ isEdited │   └──────────┘
│ isTrashed│   │ shared   │   │ isDeleted│
└──────────┘   │ isPublic │   └──────────┘
       │       │ isTrashed│
       │       └──────────┘
       │              │
       │              │ file
       │              │
       │              ▼
       │       ┌──────────────┐
       │       │ FILE VERSION │
       │       │──────────────│
       │       │ _id          │
       │       │ file         │───┐
       │       │ versionNum   │   │
       │       │ size         │   │
       │       │ storageKey   │   │
       │       │ uploadedBy   │───┤
       │       │ isCurrent    │   │
       │       └──────────────┘   │
       │                           │
       └───────────────────────────┘
```

## Relationship Details

### 1. **USER → FOLDER** (One-to-Many)

- One user can own many folders
- Each folder has one owner
- Users can also be shared on folders (Many-to-Many via `sharedWith` array)

### 2. **USER → FILE** (One-to-Many)

- One user can own many files
- Each file has one owner
- Users can also be shared on files (Many-to-Many via `sharedWith` array)

### 3. **FOLDER → FOLDER** (Self-Referencing, Hierarchical)

- Folders can have parent folders
- Creates a tree structure
- Root folders have `parent: null`

### 4. **FOLDER → FILE** (One-to-Many)

- One folder can contain many files
- Each file belongs to one folder (or root if `folder: null`)

### 5. **FILE → FILE VERSION** (One-to-Many)

- One file can have many versions
- Each version belongs to one file
- Tracks complete version history

### 6. **FILE → COMMENT** (One-to-Many)

- One file can have many comments
- Each comment belongs to one file

### 7. **COMMENT → COMMENT** (Self-Referencing, Nested)

- Comments can have replies (parent-child)
- Creates threaded discussions
- Top-level comments have `parentComment: null`

### 8. **USER → COMMENT** (One-to-Many)

- One user can write many comments
- Each comment has one author

### 9. **USER → ACTIVITY LOG** (One-to-Many)

- One user can have many activity logs
- Each log entry belongs to one user

### 10. **ACTIVITY LOG → Multiple Entities** (Polymorphic)

- Activity logs can reference Files, Folders, Comments, or FileVersions
- Uses `targetType` and `target` fields (polymorphic reference)

## Permission Structure

### Folder/File Sharing

```javascript
sharedWith: [
  {
    user: ObjectId, // Reference to User
    permission: String, // 'view' | 'edit' | 'admin'
    sharedAt: Date,
  },
];
```

### Permission Levels

1. **view** - Can view and download
2. **edit** - Can view, download, and modify
3. **admin** - Can view, download, modify, and manage sharing

### Access Hierarchy

```
Owner (Full Access)
  │
  ├─► Admin Permission (Manage + Edit + View)
  │
  ├─► Edit Permission (Edit + View)
  │
  └─► View Permission (View Only)
```

## Data Flow Examples

### File Upload Flow

```
1. User uploads file
2. File document created (references User, Folder)
3. FileVersion created (version 1, references File, User)
4. ActivityLog created (action: 'file_upload')
5. User.storageUsed updated
```

### Folder Sharing Flow

```
1. Owner shares folder
2. Folder.sharedWith array updated
3. ActivityLog created (action: 'folder_share')
4. Shared user can now access folder and all files within
```

### Comment Thread Flow

```
1. User adds comment on file
2. Comment created (references File, User)
3. ActivityLog created (action: 'comment_add')
4. Another user replies
5. Reply comment created (references parent Comment)
```

### Version Control Flow

```
1. User updates file
2. Current FileVersion.isCurrent set to false
3. New FileVersion created (version incremented)
4. File.currentVersion updated
5. ActivityLog created (action: 'version_create')
```

## Indexing Strategy

### User

- `email` (unique) - Fast login lookups

### Folder

- `owner + parent` - List user's folders in a directory
- `owner + isTrashed` - Trash management
- `path` - Path-based queries

### File

- `owner + folder` - List files in a folder
- `owner + isTrashed` - Trash management
- `name + tags` (text) - Full-text search
- `mimeType` - Filter by file type

### FileVersion

- `file + versionNumber` - Version history
- `file + isCurrent` - Get current version

### Comment

- `file + createdAt` - List comments on a file
- `parentComment` - Get replies

### ActivityLog

- `user + createdAt` - User's activity feed
- `target + createdAt` - Activity on a resource
- `createdAt` (TTL) - Auto-delete after 90 days

## Storage Calculation

```javascript
// User's total storage
User.storageUsed = sum(File.size where File.owner = User._id)

// Includes all file versions
User.storageUsed += sum(FileVersion.size where FileVersion.uploadedBy = User._id)

// Check before upload
if (User.storageUsed + newFile.size > User.storageLimit) {
  throw new Error('Storage limit exceeded');
}
```

## Soft Delete (Trash) Flow

```
1. User deletes file/folder
2. Document.isTrashed = true
3. Document.trashedAt = Date.now()
4. ActivityLog created (action: 'file_delete' or 'folder_delete')
5. Document still exists in database
6. Can be restored or permanently deleted later
```

## Security Checks

### Before any operation:

```javascript
// 1. Check if user is authenticated
if (!req.user) throw new Error('Unauthorized');

// 2. Check if user has access to resource
const hasAccess = resource.hasAccess(req.user._id, 'edit');
if (!hasAccess) throw new Error('Forbidden');

// 3. Perform operation
// 4. Log activity
await ActivityLog.create({...});
```

## Query Examples

### Get user's root folders

```javascript
Folder.find({ owner: userId, parent: null, isTrashed: false });
```

### Get files in a folder

```javascript
File.find({ owner: userId, folder: folderId, isTrashed: false });
```

### Get file's current version

```javascript
FileVersion.findOne({ file: fileId, isCurrent: true });
```

### Get file's version history

```javascript
FileVersion.find({ file: fileId }).sort({ versionNumber: -1 });
```

### Get comments on a file

```javascript
Comment.find({ file: fileId, isDeleted: false, parentComment: null })
  .populate("user", "firstName lastName avatar")
  .populate("replies");
```

### Get user's recent activity

```javascript
ActivityLog.find({ user: userId }).sort({ createdAt: -1 }).limit(20);
```

### Search files

```javascript
File.find({
  owner: userId,
  $text: { $search: searchQuery },
  isTrashed: false,
});
```

## Best Practices Applied

✅ **Referential Integrity** - All references use ObjectId
✅ **Indexing** - Strategic indexes for performance
✅ **Soft Deletes** - Trash functionality
✅ **Audit Trail** - Activity logging
✅ **Versioning** - Complete history
✅ **Access Control** - Permission-based
✅ **Data Validation** - Schema-level validation
✅ **Cascading** - Handled in application logic
✅ **Denormalization** - Where beneficial (e.g., targetName in ActivityLog)
✅ **TTL Indexes** - Auto-cleanup old logs
