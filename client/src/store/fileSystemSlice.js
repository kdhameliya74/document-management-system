import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { v4 as uuidv4 } from "uuid";
import fileSystemAPI from "@/services/fileSystemService";

const initialState = {
  folders: {
    root: {
      id: "root",
      name: "My Drive",
      parentId: null,
      childFolderIds: [],
      childFileIds: [],
    },
  },
  files: {},
  currentFolderId: "root",
  selectedId: null,
  showDetails: false,
  isLoading: false,
  error: null,
};

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

export const fetchDocuments = createAsyncThunk(
  "folders/all",
  async (parentId, { rejectWithValue }) => {
    try {
      const data = await fileSystemAPI.getAll(parentId);
      return { folders: data.folders, parentId: parentId || 'root' };
    } catch (err) {
      return rejectWithValue(err?.response?.data?.message || err?.message || "No folders available");
    }
  },
);


const fileSystemSlice = createSlice({
  name: "fileSystem",
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
    addFile: (state, action) => {
      const { name, type, size, parentId, url } = action.payload;
      const newFileId = uuidv4();
      const newFile = {
        id: newFileId,
        name,
        type,
        size,
        url, // In a real app, this would be the S3 URL or similar
        parentId,
        createdAt: new Date().toISOString(),
        versions: [], // For version history
      };

      state.files[newFileId] = newFile;
      if (state.folders[parentId]) {
        state.folders[parentId].childFileIds.push(newFileId);
      }
    },
    renameItem: (state, action) => {
      const { id, type, newName } = action.payload;
      if (type === "folder" && state.folders[id]) {
        state.folders[id].name = newName;
      } else if (type === "file" && state.files[id]) {
        state.files[id].name = newName;
      }
    },
    deleteItem: (state, action) => {
      const { id, type, parentId } = action.payload;

      // Remove from parent's children list
      if (state.folders[parentId]) {
        if (type === "folder") {
          state.folders[parentId].childFolderIds = state.folders[
            parentId
          ].childFolderIds.filter((fid) => fid !== id);
          // Recursive delete would be needed here for a real backend,
          // but for client-side state, we might leave orphans or clean them up.
          // Let's just remove the reference for now.
          delete state.folders[id];
        } else {
          state.folders[parentId].childFileIds = state.folders[
            parentId
          ].childFileIds.filter((fid) => fid !== id);
          delete state.files[id];
        }
      }
    },
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
        const { parent } = action.payload;
        const normalizedFolder = {
          ...action.payload,
          childFolderIds: [],
          childFileIds: [],
        };
        state.folders[normalizedFolder.id] = normalizedFolder;
        if (parent && state.folders[parent]) {
          if (!state.folders[parent].childFolderIds.includes(normalizedFolder.id)) {
            state.folders[parent].childFolderIds.push(normalizedFolder.id);
          }
        }
      })
      .addCase(fetchDocuments.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchDocuments.fulfilled, (state, action) => {
        state.isLoading = false;
        const { folders, parentId } = action.payload;

        const childFolderIds = [];
        folders.forEach((folder) => {
          const {id} = folder;
          childFolderIds.push(id);
          state.folders[id] = {
            ...folder,
            childFolderIds: state.folders[id]?.childFolderIds || [],
            childFileIds: state.folders[id]?.childFileIds || [],
          };
        });

        if (state.folders[parentId]) {
          state.folders[parentId].childFolderIds = childFolderIds;
        }
      })
      .addCase(fetchDocuments.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
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
} = fileSystemSlice.actions;
export default fileSystemSlice.reducer;
