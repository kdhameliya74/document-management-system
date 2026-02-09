import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import Sidebar from "@/components/layout/Sidebar";
import Header from "@/components/layout/Header";
import FolderView from "@/components/dashboard/FolderView";
import RightSidebar from "@/components/dashboard/RightSidebar";

import TrashPage from "@/pages/TrashPage";
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
              <Route path="/" element={<Navigate to={ROUTES.DASHBOARD.RELATIVE.ROOT} />} />
              <Route path={ROUTES.DASHBOARD.RELATIVE.FOLDER} element={<FolderView />} />
              <Route path={ROUTES.DASHBOARD.RELATIVE.TRASH} element={<TrashPage />} />
              <Route path={ROUTES.DASHBOARD.RELATIVE.TRASH_FOLDER} element={<TrashPage />} />
            </Routes>
          </div>
          <RightSidebar />
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
