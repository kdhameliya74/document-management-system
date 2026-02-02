import { createSlice } from '@reduxjs/toolkit';
import { v4 as uuidv4 } from 'uuid';

const initialState = {
  folders: {
    root: {
      id: 'root',
      name: 'My Drive',
      parentId: null,
      childFolderIds: [],
      childFileIds: [],
    },
  },
  files: {},
  currentFolderId: 'root',
  selectedId: null,
  showDetails: false,
};

const fileSystemSlice = createSlice({
  name: 'fileSystem',
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
    addFolder: (state, action) => {
      const { name, parentId, color } = action.payload;
      const newFolderId = uuidv4();
      const newFolder = {
        id: newFolderId,
        name,
        parentId,
        color,
        childFolderIds: [],
        childFileIds: [],
        createdAt: new Date().toISOString(),
      };
      
      state.folders[newFolderId] = newFolder;
      if (state.folders[parentId]) {
        state.folders[parentId].childFolderIds.push(newFolderId);
      }
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
      if (type === 'folder' && state.folders[id]) {
        state.folders[id].name = newName;
      } else if (type === 'file' && state.files[id]) {
        state.files[id].name = newName;
      }
    },
    deleteItem: (state, action) => {
      const { id, type, parentId } = action.payload;
      
      // Remove from parent's children list
      if (state.folders[parentId]) {
        if (type === 'folder') {
          state.folders[parentId].childFolderIds = state.folders[parentId].childFolderIds.filter(fid => fid !== id);
          // Recursive delete would be needed here for a real backend, 
          // but for client-side state, we might leave orphans or clean them up.
          // Let's just remove the reference for now.
          delete state.folders[id];
        } else {
          state.folders[parentId].childFileIds = state.folders[parentId].childFileIds.filter(fid => fid !== id);
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
          timestamp: new Date().toISOString()
        });
      }
    }
  }
});

export const { setCurrentFolder, setSelectedId, setShowDetails, addFolder, addFile, renameItem, deleteItem, addFileVersion } = fileSystemSlice.actions;
export default fileSystemSlice.reducer;
