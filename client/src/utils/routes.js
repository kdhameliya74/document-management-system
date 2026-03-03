const ROUTES = {
  HOME: "/",
  LOGIN: "/login",
  SIGNUP: "/signup",
  APP: {
    ROOT: "/app",
    WILDCARD: "/app/*",
    FOLDERS: "/app/folders",
    RECENT: "/app/recent",
    SHARED: "/app/shared",
    TRASH: "/app/trash",

    FOLDER: "/app/folders/:folderId",
    TRASH_FOLDER: "/app/trash/:folderId",
    SHARED_FOLDER: "/app/shared/:folderId",

    FOLDER_DYNAMIC: (folderId) => (folderId ? `/app/folders/${folderId}` : "/app/folders"),
    TRASH_DYNAMIC: (folderId) => (folderId ? `/app/trash/${folderId}` : "/app/trash"),
    SHARED_DYNAMIC: (folderId) => (folderId ? `/app/shared/${folderId}` : "/app/shared"),

    RELATIVE: {
      FOLDERS: "folders",
      FOLDER: "folders/:folderId",
      TRASH: "trash",
      TRASH_FOLDER: "trash/:folderId",
      RECENT: "recent",
      SHARED: "shared",
      SHARED_FOLDER: "shared/:folderId",
    },
  },
};

export const HOME_ROUTES = {
  ROOT: ROUTES.APP.ROOT,
  TRASH: ROUTES.APP.TRASH,
  SHARED: ROUTES.APP.SHARED,
};

export const DYNAMIC_ROUTES = {
  ROOT: ROUTES.APP.FOLDER_DYNAMIC,
  TRASH: ROUTES.APP.TRASH_DYNAMIC,
  SHARED: ROUTES.APP.SHARED_DYNAMIC,
};
export default ROUTES;
