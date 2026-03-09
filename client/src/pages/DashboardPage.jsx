import { useEffect } from "react";
import { Routes, Route, Navigate, useLocation } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import {
  setCurrentFolder,
  setSelectedId,
  clearContextMenu,
  setShowDetails,
} from "@/store/documents.slice";
import { APP_VIEWS_MAP } from "@/helpers/constants";

import Sidebar from "@/components/layout/Sidebar";
import Header from "@/components/layout/Header";
import FolderView from "@/components/dashboard/FolderView";
import RightSidebar from "@/components/dashboard/RightSidebar";
import TrashPage from "@/pages/TrashPage";
import SharePage from "@/pages/SharePage";
import PageNotFound from "@/pages/PageNotFound";
import ROUTES from "@/utils/routes";
import ModalManager from "@/components/modals/ModalManager";

const DashboardPage = () => {
  const location = useLocation();
  const dispatch = useDispatch();
  const { showDetails } = useSelector((state) => state.documentSystem);

  useEffect(() => {
    const type = location.pathname.substring(1).split("/")[1];
    if (type) {
      dispatch(setCurrentFolder(APP_VIEWS_MAP[type.toUpperCase()]));
    }
  }, [location.pathname, dispatch]);

  const handleOutsideClick = () => {
    if (showDetails) {
      dispatch(setShowDetails(false));
    }
    dispatch(setSelectedId(null));
    dispatch(clearContextMenu());
  };

  return (
    <div
      className="flex h-screen w-screen bg-bg-main overflow-hidden text-text-main"
      onClick={handleOutsideClick}
    >
      <Sidebar />
      <div className="flex-1 flex flex-col h-full overflow-hidden">
        <Header />
        <div className="flex flex-1 overflow-hidden relative">
          <div className="flex-1 overflow-y-auto p-6 relative">
            <Routes>
              <Route path="/" element={<Navigate to={ROUTES.APP.RELATIVE.FOLDERS} />} />

              <Route path={ROUTES.APP.RELATIVE.FOLDERS} element={<FolderView />} />
              <Route path={ROUTES.APP.RELATIVE.FOLDER} element={<FolderView />} />

              <Route path={ROUTES.APP.RELATIVE.TRASH} element={<TrashPage />} />
              <Route path={ROUTES.APP.RELATIVE.TRASH_FOLDER} element={<TrashPage />} />

              <Route path={ROUTES.APP.RELATIVE.SHARED} element={<SharePage />} />
              <Route path={ROUTES.APP.RELATIVE.SHARED_FOLDER} element={<SharePage />} />

              {/* Catch-all for dashboard sub-routes */}
              <Route path="*" element={<PageNotFound />} />
            </Routes>
          </div>
          <RightSidebar />
        </div>
        <ModalManager />
      </div>
    </div>
  );
};

export default DashboardPage;
