import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { useSelector } from "react-redux";
import LoginPage from "@/pages/LoginPage";
import SignupPage from "@/pages/SignupPage";
import DashboardPage from "@/pages/DashboardPage";
import PageNotFound from "@/pages/PageNotFound";
import ROUTES from "@/utils/routes";
import { Toaster } from "react-hot-toast";

const PrivateRoute = ({ children }) => {
  const { isAuthenticated, isCheckingAuth } = useSelector((state) => state.auth);
  if (isCheckingAuth) return null;
  return isAuthenticated ? children : <Navigate to={ROUTES.LOGIN} replace />;
};

const PublicRoute = ({ children }) => {
  const { isAuthenticated, isCheckingAuth } = useSelector((state) => state.auth);
  if (isCheckingAuth) return null; // Prevent flicker
  return isAuthenticated ? <Navigate to={ROUTES.APP.ROOT} replace /> : children;
};

function App() {
  const { isCheckingAuth } = useSelector((state) => state.auth);
  if (isCheckingAuth) return null; // 👈 GLOBAL BLOCKER
  return (
    <Router>
      <Toaster position="top-right" />
      <Routes>
        <Route
          path={ROUTES.LOGIN}
          element={
            <PublicRoute>
              <LoginPage />
            </PublicRoute>
          }
        />

        <Route
          path={ROUTES.SIGNUP}
          element={
            <PublicRoute>
              <SignupPage />
            </PublicRoute>
          }
        />

        <Route
          path={ROUTES.APP.WILDCARD}
          element={
            <PrivateRoute>
              <DashboardPage />
            </PrivateRoute>
          }
        />

        <Route path={ROUTES.HOME} element={<Navigate to={ROUTES.APP.ROOT} replace />} />

        {/* Catch-all 404 */}
        <Route path="*" element={<PageNotFound />} />
      </Routes>
    </Router>
  );
}

export default App;
