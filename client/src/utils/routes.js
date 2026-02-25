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
    SHARED: "/app/shared",
    TRASH: "/app/trash",
    TRASH_FOLDER: "/app/trash/:folderId",
    FOLDER_DYNAMIC: (folderId) => (folderId ? `/app/folders/${folderId}` : "/app/folders"),
    TRASH_DYNAMIC: (folderId) => (folderId ? `/app/trash/${folderId}` : "/app/trash"),
    RELATIVE: {
      FOLDERS: "folders",
      FOLDER: "folders/:folderId",
      TRASH: "trash",
      TRASH_FOLDER: "trash/:folderId",
      RECENT: "recent",
      SHARED: "shared",
    },
  },
};

export default ROUTES;
