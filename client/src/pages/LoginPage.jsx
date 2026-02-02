import React, { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import { login, clearError } from "@/store/authSlice";
// eslint-disable-next-line no-unused-vars
import { motion } from "framer-motion";
import { useSelector } from "react-redux";
import { Lock, Mail, ArrowRight, AlertCircle, Loader } from "lucide-react";
import AuthBackground from "@/components/auth/AuthBackground";
import ROUTES from "@/utils/routes";

const LoginPage = () => {
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();
  const { loading, error, isAuthenticated } = useSelector(
    (state) => state.auth
  );
  const dispatch = useDispatch();

  const handleSubmit = (e) => {
    e.preventDefault();
    dispatch(login({ identifier: identifier, password }));
  };

  useEffect(() => {
    if (!loading && isAuthenticated) {
      navigate(ROUTES.DASHBOARD.ROOT, { replace: true });
    }
  }, [loading, isAuthenticated, navigate]);

  useEffect(() => {
    dispatch(clearError());
  }, [identifier, password, dispatch]);

  return (
    <div className="flex items-center justify-center min-h-screen relative overflow-hidden bg-bg-main">
      <AuthBackground />
      <motion.div
        className="relative z-10 bg-bg-panel/80 backdrop-blur-xl border border-border-muted p-8 md:p-12 rounded-3xl shadow-2xl w-full max-w-[450px]"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="text-center mb-10">
          <h1 className="text-3xl font-medium text-text-main mb-2">
            Welcome Back
          </h1>
          <p className="text-text-muted">
            Enter your details to access your files
          </p>
        </div>
        {error && (
          <div className="mb-6 p-3 bg-red-500/10 border border-red-500/20 rounded-lg flex items-center gap-2 text-red-500 text-sm">
            <AlertCircle size={16} />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-6">
          <div className="relative">
            <Mail
              className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted"
              size={20}
            />
            <input
              type="text"
              placeholder="Username or email Address"
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
              required
              disabled={loading}
              className="w-full py-4 px-4 pl-12 border border-border-muted rounded-lg bg-bg-main/50 text-text-main text-base transition-all outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 disabled:opacity-50 disabled:cursor-not-allowed"
            />
          </div>

          <div className="relative">
            <Lock
              className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted"
              size={20}
            />
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              disabled={loading}
              className="w-full py-4 px-4 pl-12 border border-border-muted rounded-lg bg-bg-main/50 text-text-main text-base transition-all outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 disabled:opacity-50 disabled:cursor-not-allowed"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="flex items-center justify-center gap-2 cursor-pointer text-white bg-primary p-4 rounded-xl font-medium text-sm hover:bg-primary-hover transition-all shadow-lg shadow-primary/20 hover:-translate-y-px active:translate-y-0 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0"
          >
            {loading ? <Loader className="animate-spin" size={18} /> : null}
            <span>{loading ? 'Signing In...' : 'Sign In'}</span>
            {!loading && <ArrowRight size={18} />}
          </button>
        </form>

        <div className="mt-8 text-center text-text-muted">
          <p>
            Don't have an account?
            <Link
              to={ROUTES.SIGNUP}
              className="text-primary font-normal ml-1 hover:underline"
            >
              Sign Up
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
};

export default LoginPage;
