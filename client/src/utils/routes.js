const ROUTES = {
  HOME: "/",
  LOGIN: "/login",
  SIGNUP: "/signup",
  DASHBOARD: {
    ROOT: "/dashboard",
    WILDCARD: "/dashboard/*",
    FOLDER_BASE: "/dashboard/folder",
    FOLDER_ROOT: "/dashboard/folder/root",
    FOLDER: "/dashboard/folder/:folderId",
    RECENT: "/dashboard/recent",
    SHARED: "/dashboard/shared",
    FOLDER_DYNAMIC: (folderId) => `/dashboard/folder/${folderId}`,
    TRASH: "/dashboard/trash",
    TRASH_DYNAMIC: (folderId) => `/dashboard/trash/${folderId}`,
    RELATIVE: {
      ROOT: "folder/root",
      FOLDER: "folder/:folderId",
      TRASH: "trash",
      TRASH_FOLDER: "trash/:folderId",
    },
  },
};

export default ROUTES;
