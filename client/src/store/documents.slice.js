import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import DocumentService from "@/services/document.service";
import {
  TRASH_MESSAGES,
  FILE_MESSAGES,
  DEFAULT_MESSAGES,
  FOLDER_MESSAGES,
  SHARE_MESSAGES,
  PAGE_HEADERS,
  ERROR_CODES_WITH_MESSAGES,
} from "@/helpers/constants";
import { logError } from "@/helpers/utils";

const initialState = {
  documents: {
    root: {
      id: "root",
      name: PAGE_HEADERS.ROOT,
      parentId: null,
      childDocuments: [],
    },
    shared: {
      id: "shared",
      name: PAGE_HEADERS.SHARED,
      parentId: null,
      childDocuments: [],
    },
    trash: {
      id: "trash",
      name: PAGE_HEADERS.TRASH,
      parentId: null,
      childDocuments: [],
    },
  },
  currentFolderId: "root", // root | shared | trash
  selectedId: null,
  showDetails: false,
  isLoading: false,
  error: null,
  activeModal: null, // 'createFolder' | 'upload' | 'edit' | 'delete' | 'move' | 'share' | 'Download'
  modalProps: {},
  contextMenu: null, // { x: number, y: number, item: object, type: string }
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
  async (payload, { rejectWithValue, getState }) => {
    try {
      const state = getState();
      const currentFolderId = state.documentSystem.currentFolderId;
      const data = await DocumentService.getAll(payload);
      return {
        folders: data?.folders || [],
        files: data?.files || [],
        currentFolder: data?.currentFolder,
        breadcrumbs: data?.breadcrumbs || [],
        parentId: payload?.parentId || currentFolderId,
        mode: payload?.mode || "root",
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
      return rejectWithValue(
        ERROR_CODES_WITH_MESSAGES[err?.code] || FOLDER_MESSAGES.DOCUMENT_SAVE_FAILED,
      );
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
        message: TRASH_MESSAGES.DELETE_SUCCESS,
      };
    } catch (err) {
      logError(err);
      return rejectWithValue(ERROR_CODES_WITH_MESSAGES[err?.code] || TRASH_MESSAGES.DELETE_ERROR);
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
      return rejectWithValue(ERROR_CODES_WITH_MESSAGES[err?.code] || TRASH_MESSAGES.RESTORE_ERROR);
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
      return rejectWithValue(ERROR_CODES_WITH_MESSAGES[err?.code] || TRASH_MESSAGES.DELETE_ERROR);
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
      return rejectWithValue(
        ERROR_CODES_WITH_MESSAGES[err?.code] || DEFAULT_MESSAGES.DOCUMENT_MOVE_FAILED,
      );
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
      return rejectWithValue(ERROR_CODES_WITH_MESSAGES[err?.code] || SHARE_MESSAGES.SHARE_FAILED);
    }
  },
);

/*
|--------------------------------------------------------------------------
| getPreviewUrl
|--------------------------------------------------------------------------
*/
export const getPreviewUrl = createAsyncThunk(
  "documents/sync-url",
  async (docId, { rejectWithValue }) => {
    try {
      return await DocumentService.getPreviewUrl(docId);
    } catch (err) {
      logError(err);
      return rejectWithValue(ERROR_CODES_WITH_MESSAGES[err?.code] || FILE_MESSAGES.DOWNLOAD_FAILED);
    }
  },
);

const ensureDocument = (state, id, data, rootId) => {
  const docState = state.documents;
  const parentId = data.parentId;

  // Normalize parentId if it's not present in state and we have a rootId (e.g. shared)
  if (parentId && !docState[parentId] && rootId) {
    data.parentId = rootId;
  }

  docState[id] ??= {
    id,
    name: "",
    parentId: rootId || state.currentFolderId,
    childDocuments: [],
  };

  Object.assign(docState[id], data);
};

const linkChildToParent = (state, parentId, childId, rootId) => {
  const docState = state.documents;
  const targetParentId = docState[parentId] ? parentId : rootId;

  if (!docState[targetParentId]) return;

  const children = docState[targetParentId].childDocuments;
  if (!children.includes(childId)) {
    children.push(childId);
  }
};

const documentsSlice = createSlice({
  name: "documentSystem",
  initialState,
  reducers: {
    setCurrentFolder: (state, action) => {
      state.currentFolderId = action.payload;
      state.selectedId = null;
      state.showDetails = false;
    },
    setSelectedId: (state, action) => {
      state.selectedId = action.payload;
    },
    setShowDetails: (state, action) => {
      state.showDetails = action.payload;
    },
    setActiveModal: (state, action) => {
      state.activeModal = action.payload;
    },
    setModalProps: (state, action) => {
      state.modalProps = action.payload;
    },
    setContextMenu: (state, action) => {
      state.contextMenu = action.payload;
    },
    clearContextMenu: (state) => {
      state.contextMenu = null;
    },
    closeModal: (state) => {
      if (state.modalProps?.source === "contextMenu" || state.modalProps?.source === "view") {
        state.selectedId = null;
      }
      state.activeModal = null;
      state.modalProps = {};
    },
    clearUISelection: (state) => {
      state.showDetails = false;
      state.selectedId = null;
      state.contextMenu = null;
    },
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
        const { folders, files, currentFolder, breadcrumbs, parentId, mode } = action.payload;
        const rootId = mode || "root";

        // 1. Breadcrumbs
        breadcrumbs.forEach(({ id, name, parentId: pid }) => {
          ensureDocument(state, id, { id, name, parentId: pid }, rootId);
          linkChildToParent(state, pid, id, rootId);
        });

        // 2. Current folder
        if (currentFolder) {
          const { id, parentId } = currentFolder;
          const normalizedParentId = parentId || rootId;

          ensureDocument(
            state,
            id,
            {
              ...currentFolder,
              id,
              parentId: normalizedParentId,
            },
            rootId,
          );

          linkChildToParent(state, normalizedParentId, id, rootId);
        }

        // 3. Child folders
        const childDocuments = [...folders, ...files].map((doc) => {
          const normalizedParentId = doc.parentId || rootId;
          ensureDocument(
            state,
            doc.id,
            {
              ...doc,
              id: doc.id,
              parentId: normalizedParentId,
            },
            rootId,
          );
          return doc.id;
        });

        // 4. Update parent children list
        if (state.documents[parentId]) {
          state.documents[parentId].childDocuments = childDocuments;
        }
        state.isLoading = false;
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
          const parent = state.documents[id].parentId || state.currentFolderId;
          if (parent) {
            const newChildDocuments = state.documents[parent].childDocuments.filter(
              (docId) => docId !== id,
            );
            state.documents[parent].childDocuments = newChildDocuments;
          }
        }
      })
      .addCase(permenantDeleteDocument.fulfilled, (state, action) => {
        const { id } = action.payload;
        if (state.documents[id]) {
          const { [id]: _, ...restDocs } = state.documents;
          state.documents = { ...restDocs };
        }
      })
      .addCase(restoreDocument.fulfilled, (state, action) => {
        const { id } = action.payload;
        if (state.documents[id]) {
          state.documents[id].isTrashed = false;
          state.documents.trash.childDocuments = state.documents.trash.childDocuments.filter(
            (docId) => docId !== id,
          );
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
  setActiveModal,
  closeModal,
  clearUISelection,
  setModalProps,
  setContextMenu,
  clearContextMenu,
  addFileVersion,
} = documentsSlice.actions;
export default documentsSlice.reducer;
