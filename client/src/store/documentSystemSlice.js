import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import fileSystemAPI from "@/services/fileSystemService";
import { TRASH_MESSAGES, FILE_MESSAGES } from "@/helpers/constants";
import { logError } from "@/helpers/utils";

const initialState = {
  documents: {
    root: {
      id: "root",
      name: "My Drive",
      parentId: null,
      childDocuments: [],
    },
  },
  trashDocuments: {
    trash: {
      id: "trash",
      name: "Trash",
      parentId: null,
      childDocuments: [],
      path: "",
    },
  },
  currentFolderId: "root",
  selectedId: null,
  showDetails: false,
  isLoading: false,
  error: null,
};

/*
|--------------------------------------------------------------------------
| uploadFileMeta
|--------------------------------------------------------------------------
*/
export const uploadFileMeta = createAsyncThunk(
  "file/uploadFile",
  async (file, { rejectWithValue }) => {
    try {
      const data = await fileSystemAPI.confirmUpload(file);
      return {
        ...file,
        ...(data?.file || {}),
      };
    } catch (err) {
      logError(err);
      return rejectWithValue(FILE_MESSAGES.UPLOAD_FAILED);
    }
  },
);

/*
|--------------------------------------------------------------------------
| createFolder
|--------------------------------------------------------------------------
*/
export const createFolder = createAsyncThunk(
  "folders/create",
  async (folder, { rejectWithValue }) => {
    try {
      const data = await fileSystemAPI.createFolder(folder);
      return data.folder;
    } catch (err) {
      return rejectWithValue(err?.message || "Folder creation failed");
    }
  },
);

/*
|--------------------------------------------------------------------------
| fetchDocuments
|--------------------------------------------------------------------------
*/
export const fetchDocuments = createAsyncThunk(
  "documents/all",
  async (parentId, { rejectWithValue }) => {
    try {
      const data = await fileSystemAPI.getAll(parentId);
      return {
        folders: data.folders,
        files: data.files,
        currentFolder: data.currentFolder,
        breadcrumbs: data.breadcrumbs || [],
        parentId: parentId || "root",
      };
    } catch (err) {
      return rejectWithValue(
        err?.response?.data?.message || err?.message || "No folders available",
      );
    }
  },
);

/*
|--------------------------------------------------------------------------
| updateDocument
|--------------------------------------------------------------------------
*/
export const updateDocument = createAsyncThunk(
  "documents/update",
  async ({ id, ...rest }, { rejectWithValue }) => {
    try {
      if (rest.docType === "folder") {
        const data = await fileSystemAPI.updateDocument(id, rest);
        return {
          ...data,
          document: { id, ...rest },
        };
      }
      const data = await fileSystemAPI.updateFile(id, rest);
      return {
        ...data,
        document: { id, ...rest },
      };
    } catch (err) {
      return rejectWithValue(err?.message || "Document not updated!");
    }
  },
);

/*
|--------------------------------------------------------------------------
| deleteDocument
|--------------------------------------------------------------------------
*/
export const deleteDocument = createAsyncThunk(
  "documents/delete",
  async (id, { rejectWithValue }) => {
    try {
      const data = await fileSystemAPI.deleteDocument(id);
      return {
        ...data,
        id,
      };
    } catch (err) {
      return rejectWithValue(err?.message || "Failed to move document to trash!");
    }
  },
);

/*
|--------------------------------------------------------------------------
| restoreDocument
|--------------------------------------------------------------------------
*/
export const restoreDocument = createAsyncThunk(
  "documents/restore",
  async (id, { rejectWithValue }) => {
    try {
      const data = await fileSystemAPI.restoreDocument(id);
      return {
        ...data,
        id,
      };
    } catch (err) {
      logError(err);
      return rejectWithValue(TRASH_MESSAGES.RESTORE_ERROR);
    }
  },
);

/*
|--------------------------------------------------------------------------
| getTrashedDocument
|--------------------------------------------------------------------------
*/
export const getTrashedDocument = createAsyncThunk(
  "documents/trash",
  async (parent, { rejectWithValue }) => {
    try {
      const data = await fileSystemAPI.getTrash(parent);
      return {
        folders: data.folders,
        currentFolder: data.currentFolder,
        parentId: parent || "trash",
      };
    } catch (err) {
      logError(err);
      return rejectWithValue(err?.message || "Failed to fetch trash documents!");
    }
  },
);

const ensureDocument = (state, id, data, topParent = "root") => {
  const docState = topParent === "root" ? state.documents : state.trashDocuments;
  docState[id] ??= {
    id,
    name: "",
    parentId: "root",
    childDocuments: [],
  };

  Object.assign(docState[id], data);
};

const linkChildToParent = (state, parentId, childId, topParent = "root") => {
  const docState = topParent === "root" ? state.documents : state.trashDocuments;
  if (!docState[parentId]) return;

  const children = docState[parentId].childDocuments;
  if (!children.includes(childId)) {
    children.push(childId);
  }
};

const documentSystemSlice = createSlice({
  name: "documentSystem",
  initialState,
  reducers: {
    setCurrentFolder: (state, action) => {
      state.currentFolderId = action.payload;
      state.selectedId = null; // Clear selection on navigation
      state.showDetails = false; // Close details on navigation
    },
    setSelectedId: (state, action) => {
      state.selectedId = action.payload;
      // Do not automatically show details
    },
    setShowDetails: (state, action) => {
      state.showDetails = action.payload;
    },
    // addFile: (state, action) => {
    //   const { name, type, size, parentId, url } = action.payload;
    //   const newFileId = uuidv4();
    //   const newFile = {
    //     id: newFileId,
    //     name,
    //     type,
    //     size,
    //     url, // In a real app, this would be the S3 URL or similar
    //     parentId,
    //     createdAt: new Date().toISOString(),
    //     versions: [], // For version history
    //   };

    //   state.files[newFileId] = newFile;
    //   if (state.documents[parentId]) {
    //     state.documents[parentId].childFileIds.push(newFileId);
    //   }
    // },
    renameItem: (state, action) => {
      const { id, type, newName } = action.payload;
      if (type === "folder" && state.documents[id]) {
        state.documents[id].name = newName;
      } else if (type === "file" && state.files[id]) {
        state.files[id].name = newName;
      }
    },
    deleteItem: (state, action) => {
      const { id, type, parentId } = action.payload;

      // Remove from parent's children list
      if (state.documents[parentId]) {
        if (type === "folder") {
          state.documents[parentId].childDocuments = state.documents[
            parentId
          ].childDocuments.filter((fid) => fid !== id);
          // Recursive delete would be needed here for a real backend,
          // but for client-side state, we might leave orphans or clean them up.
          // Let's just remove the reference for now.
          delete state.documents[id];
        } else {
          state.documents[parentId].childFileIds = state.documents[parentId].childFileIds.filter(
            (fid) => fid !== id,
          );
          delete state.files[id];
        }
      }
    },
    // fetch documents and files
    // Mock version history
    addFileVersion: (state, action) => {
      const { fileId, versionData } = action.payload;
      if (state.files[fileId]) {
        state.files[fileId].versions.push({
          ...versionData,
          timestamp: new Date().toISOString(),
        });
      }
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(createFolder.fulfilled, (state, action) => {
        const parent = action?.payload?.parent ?? "root";
        const normalizedFolder = {
          ...action.payload,
          childDocuments: [],
          childFileIds: [],
        };
        state.documents[normalizedFolder.id] = normalizedFolder;
        if (parent && state.documents[parent]) {
          if (!state.documents[parent].childDocuments.includes(normalizedFolder.id)) {
            state.documents[parent].childDocuments.push(normalizedFolder.id);
          }
        }
      })
      .addCase(fetchDocuments.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchDocuments.fulfilled, (state, action) => {
        /**
         * we need following structure
         *
         * documents = {
         *    root: {
         *      id: "root",
         *      name: "root",
         *      parentId: null,
         *      childDocuments: ["folderId1", "folderId2"],
         *      childFileIds: ["fileId1", "fileId2"],
         *    },
         *    folderId1: {
         *      id: "folderId1",
         *      name: "folder1",
         *      parentId: "root",
         *      childDocuments: ["folderId2", "folderId3"],
         *      childFileIds: ["fileId1", "fileId2"],
         *    },
         *    folderId2: {
         *      id: "folderId2",
         *      name: "folder2",
         *      parentId: "folderId1",
         *      childDocuments: ["folderId3", "folderId4"],
         *      childFileIds: ["fileId3", "fileId4"],
         *    },
         *    ...
         * }
         */

        state.isLoading = false;
        const { folders, files, currentFolder, breadcrumbs, parentId } = action.payload;

        // 1. Breadcrumbs
        breadcrumbs.forEach(({ id, name, parentId: pid }) => {
          ensureDocument(state, id, { id, name, parentId: pid });
          linkChildToParent(state, pid, id);
        });

        // 2. Current folder
        if (currentFolder) {
          const { id, parent } = currentFolder;
          const normalizedParentId = parent || "root";

          ensureDocument(state, id, {
            ...currentFolder,
            id,
            parentId: normalizedParentId,
          });

          linkChildToParent(state, normalizedParentId, id);
        }

        // 3. Child folders
        const childDocuments = [...folders, ...files].map((doc) => {
          const normalizedParentId = doc.docType === "folder" ? doc.parent : doc.folderId;
          ensureDocument(state, doc.id, {
            ...doc,
            id: doc.id,
            parentId: normalizedParentId || "root",
          });
          return doc.id;
        });

        // 4. Update parent children list
        if (state.documents[parentId]) {
          state.documents[parentId].childDocuments = childDocuments;
        }
      })
      .addCase(fetchDocuments.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      .addCase(updateDocument.fulfilled, (state, action) => {
        const { document } = action.payload;
        if (state.documents[document.id]) {
          state.documents[document.id] = { ...state.documents[document.id], ...document };
        }
      })
      .addCase(deleteDocument.fulfilled, (state, action) => {
        const { id } = action.payload;
        if (state.documents[id]) {
          const { [id]: _, ...restDocs } = state.documents;
          state.documents = { ...restDocs };
        }
      })
      .addCase(getTrashedDocument.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(getTrashedDocument.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      .addCase(getTrashedDocument.fulfilled, (state, action) => {
        state.isLoading = false;
        const topParent = "trash";
        const { folders, currentFolder, breadcrumbs, parentId } = action.payload;

        // 1. Breadcrumbs
        if (breadcrumbs) {
          breadcrumbs.forEach(({ id, name, parentId: pid }) => {
            ensureDocument(state, id, { id, name, parentId: pid }, topParent);
            linkChildToParent(state, pid, id, topParent);
          });
        }

        // 2. Current folder
        if (currentFolder) {
          const { id, parent } = currentFolder;
          const normalizedParentId = parent || topParent;
          const data = {
            ...currentFolder,
            id,
            parentId: normalizedParentId,
          };
          ensureDocument(state, id, data, topParent);

          linkChildToParent(state, normalizedParentId, id, topParent);
        }

        // 3. Child folders
        const childDocuments = folders.map((folder) => {
          const normalizedParentId = folder.parent || topParent;
          const data = {
            ...folder,
            id: folder.id,
            parentId: normalizedParentId,
          };
          ensureDocument(state, folder.id, data, topParent);
          return folder.id;
        });

        // 4. Update parent children list
        if (state.trashDocuments[parentId]) {
          state.trashDocuments[parentId].childDocuments = childDocuments;
        }
      })
      .addCase(restoreDocument.fulfilled, (state, action) => {
        const { id } = action.payload;
        if (state.trashDocuments[id]) {
          const { [id]: _, ...restDocs } = state.trashDocuments;
          state.trashDocuments = { ...restDocs };
        }
      })
      .addCase(uploadFileMeta.fulfilled, (state, action) => {
        const { id, folderId } = action.payload;
        const parentId = folderId ?? "root";
        state.documents[id] = {
          id,
          ...action.payload,
          parentId,
        };
        if (state.documents[parentId]) {
          state.documents[parentId].childDocuments.push(id);
        }
      });
  },
});

export const {
  setCurrentFolder,
  setSelectedId,
  setShowDetails,
  addFile,
  renameItem,
  deleteItem,
  addFileVersion,
} = documentSystemSlice.actions;
export default documentSystemSlice.reducer;
