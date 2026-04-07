import { useEffect } from "react";
import { Routes, Route, Navigate, useLocation } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { setCurrentFolder, clearUISelection } from "@/features/documents/store/documents.slice";
import { APP_VIEWS_MAP } from "@/shared/utils/constants";

import Sidebar from "@/shared/components/layout/Sidebar";
import Header from "@/shared/components/layout/Header";
import FolderView from "@/shared/components/dashboard/FolderView";
import RightSidebar from "@/shared/components/dashboard/RightSidebar";
import TrashPage from "@/features/documents/components/TrashPage";
import SharePage from "@/features/documents/components/SharePage";
import UserProfilePage from "@/features/auth/components/UserProfilePage";
import PageNotFound from "@/shared/components/PageNotFound";
import ROUTES from "@/shared/utils/routes";
import ModalManager from "@/shared/components/modals/ModalManager";

const DashboardPage = () => {
  const location = useLocation();
  const dispatch = useDispatch();
  const { showDetails, activeModal, selectedId } = useSelector((state) => state.documentSystem);

  useEffect(() => {
    const type = location.pathname.substring(1).split("/")[1];
    if (type) {
      dispatch(setCurrentFolder(APP_VIEWS_MAP[type.toUpperCase()]));
    }
  }, [location.pathname, dispatch]);

  const handleOutsideClick = () => {
    if (activeModal) return;

    if (showDetails || selectedId) {
      dispatch(clearUISelection());
    }
  };

  return (
    <div className="flex h-screen w-screen bg-bg-main overflow-hidden text-text-main">
      <Sidebar />
      <div className="flex-1 flex flex-col h-full overflow-hidden">
        <Header />
        <div className="flex flex-1 overflow-hidden relative">
          <div className="flex-1 overflow-y-auto relative" onClick={handleOutsideClick}>
            <Routes>
              <Route path="/" element={<Navigate to={ROUTES.APP.FOLDERS} replace />} />
              <Route path={ROUTES.APP.RELATIVE.FOLDERS} element={<FolderView />} />
              <Route path={ROUTES.APP.RELATIVE.TRASH} element={<TrashPage />} />
              <Route path={ROUTES.APP.RELATIVE.SHARED} element={<SharePage />} />
              <Route path={ROUTES.APP.RELATIVE.PROFILE} element={<UserProfilePage />} />
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
