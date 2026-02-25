import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import Sidebar from "@/components/layout/Sidebar";
import Header from "@/components/layout/Header";
import FolderView from "@/components/dashboard/FolderView";
import RightSidebar from "@/components/dashboard/RightSidebar";

import TrashPage from "@/pages/TrashPage";
import PageNotFound from "@/pages/PageNotFound";
import ROUTES from "@/utils/routes";

const DashboardPage = () => {
  return (
    <div className="flex h-screen w-screen bg-bg-main overflow-hidden text-text-main">
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
              
              {/* Catch-all for dashboard sub-routes */}
              <Route path="*" element={<PageNotFound />} />
            </Routes>
          </div>
          <RightSidebar />
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
