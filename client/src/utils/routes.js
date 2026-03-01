const ROUTES = {
  HOME: "/",
  LOGIN: "/login",
  SIGNUP: "/signup",
  APP: {
    ROOT: "/app",
    WILDCARD: "/app/*",
    FOLDERS: "/app/folders",
    FOLDER: "/app/folders/:folderId",
    RECENT: "/app/recent",
    SHARED: "/app/shared/:folderId?",
    TRASH: "/app/trash",
    TRASH_FOLDER: "/app/trash/:folderId",
    FOLDER_DYNAMIC: (folderId) => (folderId ? `/app/folders/${folderId}` : "/app/folders"),
    TRASH_DYNAMIC: (folderId) => (folderId ? `/app/trash/${folderId}` : "/app/trash"),
    SHARED_DYNAMIC: (folderId) => (folderId ? `/app/shared/${folderId}` : "/app/shared"),
    RELATIVE: {
      FOLDERS: "folders",
      FOLDER: "folders/:folderId",
      TRASH: "trash",
      TRASH_FOLDER: "trash/:folderId",
      RECENT: "recent",
      SHARED: "shared/:folderId?",
      SHARE_FOLDER: "share/folder/:folderId",
      SHARE_FILE: "share/file/:fileId",
    },
  },
};

export default ROUTES;
