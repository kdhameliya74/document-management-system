import React, { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import { login, clearError } from "@/features/auth/store/auth.slice";
import { motion } from "framer-motion";
import { useSelector } from "react-redux";
import { Lock, Mail, ArrowRight, AlertCircle } from "lucide-react";
import AuthBackground from "@/shared/components/auth/AuthBackground";
import ROUTES from "@/shared/utils/routes";

const LoginPage = () => {
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();
  const { loading, error, isAuthenticated } = useSelector((state) => state.auth);
  const dispatch = useDispatch();

  const handleSubmit = (e) => {
    e.preventDefault();
    dispatch(login({ identifier: identifier, password }));
  };

  useEffect(() => {
    if (!loading && isAuthenticated) {
      navigate(ROUTES.APP.ROOT, { replace: true });
    }
  }, [loading, isAuthenticated, navigate]);

  useEffect(() => {
    dispatch(clearError());
  }, [identifier, password, dispatch]);

  return (
    <div className="flex items-center justify-center min-h-screen relative overflow-hidden bg-[#09090b]">
      <AuthBackground />
      <motion.div
        className="relative z-10 p-1 md:p-1.5 rounded-[2.5rem] bg-linear-to-b from-white/10 to-white/5 border border-white/10 shadow-[0_32px_64px_-16px_rgba(0,0,0,0.6)] w-full max-w-[460px] mx-4"
        initial={{ opacity: 0, scale: 0.95, y: 30 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
      >
        <div className="bg-bg-panel/60 backdrop-blur-3xl rounded-[2.2rem] p-8 md:p-12 border border-white/5">
          <div className="text-center mb-12">
            <div className="inline-block p-4 rounded-3xl bg-primary/10 border border-primary/20 mb-6 shadow-inner">
              <Mail className="text-primary" size={32} strokeWidth={1.5} />
            </div>
            <h1 className="text-4xl font-black text-text-main mb-3 tracking-tighter">
              Welcome back
            </h1>
            <p className="text-text-dim text-base font-medium">Access your secure document vault</p>
          </div>

          {error && (
            <motion.div
              className="mb-8 p-4 bg-red-500/5 border border-red-500/20 rounded-2xl flex items-center gap-3 text-red-400 text-sm font-bold"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
            >
              <AlertCircle size={20} />
              <span>{error}</span>
            </motion.div>
          )}

          <form onSubmit={handleSubmit} className="flex flex-col gap-6">
            <div className="flex flex-col gap-2">
              <label className="text-[10px] font-black uppercase tracking-[0.2em] text-text-dim px-1">
                Login Identity
              </label>
              <div className="relative group">
                <Mail
                  className="absolute left-5 top-1/2 -translate-y-1/2 text-text-muted group-focus-within:text-primary transition-colors"
                  size={20}
                  strokeWidth={2}
                />
                <input
                  type="text"
                  placeholder="Username or email address"
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  required
                  disabled={loading}
                  className="w-full py-4.5 px-6 pl-14 border border-border-main rounded-2xl bg-bg-panel/50 text-text-main text-base transition-all duration-300 outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 disabled:opacity-50 shadow-inner group-hover:border-border-muted"
                />
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <div className="flex justify-between items-center px-1">
                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-text-dim">
                  Passkey
                </label>
                <button
                  type="button"
                  className="text-[10px] font-black uppercase tracking-[0.1em] text-primary hover:text-primary-hover transition-colors"
                >
                  Forgot?
                </button>
              </div>
              <div className="relative group">
                <Lock
                  className="absolute left-5 top-1/2 -translate-y-1/2 text-text-muted group-focus-within:text-primary transition-colors"
                  size={20}
                  strokeWidth={2}
                />
                <input
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  disabled={loading}
                  className="w-full py-4.5 px-6 pl-14 border border-border-main rounded-2xl bg-bg-panel/50 text-text-main text-base transition-all duration-300 outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 disabled:opacity-50 shadow-inner group-hover:border-border-muted"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="mt-4 flex items-center justify-center gap-3 cursor-pointer text-white bg-primary py-5 rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-primary-hover transition-all duration-300 shadow-2xl shadow-primary/30 hover:-translate-y-1 active:translate-y-0 disabled:opacity-50 disabled:cursor-not-allowed group"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <span>Initialize Session</span>
                  <ArrowRight
                    size={18}
                    className="group-hover:translate-x-1 transition-transform"
                    strokeWidth={3}
                  />
                </>
              )}
            </button>
          </form>

          <div className="mt-12 text-center">
            <p className="text-text-dim text-sm font-medium">
              New to the platform?
              <Link
                to={ROUTES.SIGNUP}
                className="text-primary font-bold ml-2 hover:text-primary-hover transition-colors underline underline-offset-4 decoration-2"
              >
                Create Vault
              </Link>
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default LoginPage;
