import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import DocumentService from "@/services/document.service";
import {
  TRASH_MESSAGES,
  FILE_MESSAGES,
  DEFAULT_MESSAGES,
  FOLDER_MESSAGES,
  SHARE_MESSAGES,
} from "@/helpers/constants";
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
      const data = await DocumentService.confirmUpload(file);
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
      const data = await DocumentService.createFolder(folder);
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
      const data = await DocumentService.getAll(parentId);
      return {
        folders: data.folders,
        files: data.files,
        currentFolder: data.currentFolder,
        breadcrumbs: data.breadcrumbs || [],
        parentId: parentId || "root",
      };
    } catch (err) {
      logError(err);
      return rejectWithValue(DEFAULT_MESSAGES.FAILED_TO_FETCH_DOCUMENTS);
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
      const data = await DocumentService.updateDocument(id, rest);
      return {
        ...data,
        document: { id, ...rest },
      };
    } catch (err) {
      logError(err);
      return rejectWithValue(FOLDER_MESSAGES.DOCUMENT_SAVE_FAILED);
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
      const data = await DocumentService.deleteDocument(id);
      return {
        ...data,
        id,
      };
    } catch (err) {
      logError(err);
      return rejectWithValue(TRASH_MESSAGES.DELETE_ERROR);
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
      const data = await DocumentService.restoreDocument(id);
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

export const permenantDeleteDocument = createAsyncThunk(
  "documents/permenant-delete",
  async (id, { rejectWithValue }) => {
    try {
      const data = await DocumentService.permenantDocument(id);
      return {
        ...data,
        id,
      };
    } catch (err) {
      logError(err);
      return rejectWithValue(TRASH_MESSAGES.DELETE_ERROR);
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
  async (parentId, { rejectWithValue }) => {
    try {
      const data = await DocumentService.getTrash(parentId);
      return {
        folders: data.folders,
        files: data.files,
        currentFolder: data.currentFolder,
        parentId: parentId || "trash",
      };
    } catch (err) {
      logError(err);
      return rejectWithValue(DEFAULT_MESSAGES.FAILED_TO_FETCH_DOCUMENTS);
    }
  },
);

/*
|--------------------------------------------------------------------------
| moveDocument
|--------------------------------------------------------------------------
*/
export const moveDocument = createAsyncThunk(
  "documents/move",
  async ({ id, parentId }, { rejectWithValue }) => {
    try {
      await DocumentService.moveDocument(id, parentId);
      return {
        id,
        parentId,
      };
    } catch (err) {
      logError(err);
      return rejectWithValue(DEFAULT_MESSAGES.DOCUMENT_MOVE_FAILED);
    }
  },
);

/*
|--------------------------------------------------------------------------
| shareDocument
|--------------------------------------------------------------------------
*/
export const shareDocument = createAsyncThunk(
  "documents/share",
  async ({ id, collaborators }, { rejectWithValue }) => {
    try {
      await DocumentService.shareDocument(id, collaborators);
      return {
        id,
        collaborators,
      };
    } catch (err) {
      logError(err);
      return rejectWithValue(SHARE_MESSAGES.SHARE_FAILED);
    }
  },
);

const ensureDocument = (state, id, data, topParent = "root") => {
  const docState = topParent === "root" ? state.documents : state.trashDocuments;
  docState[id] ??= {
    id,
    name: "",
    parentId: topParent,
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
    renameItem: (state, action) => {
      const { id, type, newName } = action.payload;
      if (type === "folder" && state.documents[id]) {
        state.documents[id].name = newName;
      } else if (type === "file" && state.files[id]) {
        state.files[id].name = newName;
      }
    },
    // fetch documents and files
    // Mock version history
    addFileVersion: () => {},
  },
  extraReducers: (builder) => {
    builder
      .addCase(createFolder.fulfilled, (state, action) => {
        const parent = action?.payload?.parentId ?? "root";
        const normalizedFolder = {
          ...action.payload,
          childDocuments: [],
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
          const { id, parentId } = currentFolder;
          const normalizedParentId = parentId || "root";

          ensureDocument(state, id, {
            ...currentFolder,
            id,
            parentId: normalizedParentId,
          });

          linkChildToParent(state, normalizedParentId, id);
        }

        // 3. Child folders
        const childDocuments = [...folders, ...files].map((doc) => {
          const normalizedParentId = doc.parentId || "root";
          ensureDocument(state, doc.id, {
            ...doc,
            id: doc.id,
            parentId: normalizedParentId,
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
      .addCase(permenantDeleteDocument.fulfilled, (state, action) => {
        const { id } = action.payload;
        if (state.trashDocuments[id]) {
          const { [id]: _, ...restDocs } = state.trashDocuments;
          state.trashDocuments = { ...restDocs };
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
        const { folders, files, currentFolder, parentId } = action.payload;

        // 2. Current folder
        if (currentFolder) {
          const { id, parentId } = currentFolder;
          const normalizedParentId = parentId || topParent;
          const data = {
            ...currentFolder,
            id,
            parentId: normalizedParentId,
          };
          ensureDocument(state, id, data, topParent);

          linkChildToParent(state, normalizedParentId, id, topParent);
        }

        // 3. Child folders
        const childDocuments = [...folders, ...files].map((doc) => {
          const normalizedParentId = doc.parentId || topParent;
          const data = {
            ...doc,
            id: doc.id,
            parentId: normalizedParentId,
          };
          ensureDocument(state, doc.id, data, topParent);
          return doc.id;
        });

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
        const { id, parentId } = action.payload;
        const normalizedParentId = parentId || "root";
        state.documents[id] = {
          id,
          ...action.payload,
          parentId: normalizedParentId,
        };
        if (state.documents[normalizedParentId]) {
          state.documents[normalizedParentId].childDocuments.push(id);
        }
      })
      .addCase(moveDocument.fulfilled, (state, action) => {
        const { id } = action.payload;
        if (state.documents[id]) {
          const { [id]: _, ...restDocs } = state.documents;
          state.documents = { ...restDocs };
        }
      })
      .addCase(shareDocument.fulfilled, (state, action) => {
        const { collaborators, id } = action.payload;
        if (state.documents[id]) {
          state.documents[id].sharedWith.push(...collaborators);
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
