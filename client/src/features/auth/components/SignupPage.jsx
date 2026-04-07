import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, Link } from "react-router-dom";
import { signup, clearError } from "@/features/auth/store/auth.slice";
import { motion } from "framer-motion";
import { Lock, Mail, ArrowRight, User, AlertCircle, Loader } from "lucide-react";
import AuthBackground from "@/shared/components/auth/AuthBackground";
import ROUTES from "@/shared/utils/routes";

const SignupPage = () => {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const [localError, setLocalError] = useState(null);

  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading, error, isAuthenticated } = useSelector((state) => state.auth);

  // Redirect if already authenticated
  React.useEffect(() => {
    if (isAuthenticated) {
      navigate(ROUTES.APP.ROOT);
    }
  }, [isAuthenticated, navigate]);

  // Clear errors on unmount
  React.useEffect(() => {
    return () => {
      dispatch(clearError());
    };
  }, [dispatch]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
    if (localError) setLocalError(null);
    if (error) dispatch(clearError());
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLocalError(null);

    if (formData.username.match(/[^a-zA-Z0-9_]/)) {
      setLocalError({
        field: "username",
        message: "Username can only contain letters, numbers, and underscores",
      });
      return;
    }

    // Signup Validation
    if (formData.password !== formData.confirmPassword) {
      setLocalError({ field: "confirmPassword", message: "Passwords do not match" });
      return;
    }
    if (formData.password.length < 8) {
      setLocalError({ field: "password", message: "Password must be at least 8 characters" });
      return;
    }

    // Dispatch Signup
    dispatch(
      signup({
        email: formData.email,
        firstName: formData.firstName,
        lastName: formData.lastName,
        username: formData.username,
        password: formData.password,
      }),
    );
  };

  return (
    <div className="flex items-center justify-center min-h-screen relative overflow-hidden bg-[#09090b]">
      <AuthBackground />

      <motion.div
        className="relative z-10 p-1 md:p-1.5 rounded-[2.5rem] bg-linear-to-b from-white/10 to-white/5 border border-white/10 shadow-[0_32px_64px_-16px_rgba(0,0,0,0.6)] w-full max-w-[540px] mx-4 my-10"
        initial={{ opacity: 0, scale: 0.95, y: 30 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
      >
        <div className="bg-bg-panel/60 backdrop-blur-3xl rounded-[2.2rem] p-8 md:p-12 border border-white/5">
          <div className="text-center mb-10">
            <div className="inline-block p-4 rounded-3xl bg-primary/10 border border-primary/20 mb-6 shadow-inner">
              <User className="text-primary" size={32} strokeWidth={1.5} />
            </div>
            <h1 className="text-4xl font-black text-text-main mb-3 tracking-tighter">
              Create account
            </h1>
            <p className="text-text-dim text-base font-medium">
              Join the secure document ecosystem
            </p>
          </div>

          {(error || localError) && (
            <motion.div
              className="mb-8 p-4 bg-red-500/5 border border-red-500/20 rounded-2xl flex items-center gap-3 text-red-400 text-sm font-bold"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
            >
              <AlertCircle size={20} />
              <span>{localError?.message || error}</span>
            </motion.div>
          )}

          <form onSubmit={handleSubmit} className="flex flex-col gap-5">
            <div className="grid grid-cols-2 gap-5">
              <div className="flex flex-col gap-2">
                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-text-dim px-1">
                  First Name
                </label>
                <div className="relative group">
                  <User
                    className="absolute left-5 top-1/2 -translate-y-1/2 text-text-muted group-focus-within:text-primary transition-colors"
                    size={18}
                    strokeWidth={2.5}
                  />
                  <input
                    type="text"
                    name="firstName"
                    placeholder="John"
                    value={formData.firstName}
                    onChange={handleChange}
                    required
                    disabled={loading}
                    className="w-full py-4 px-6 pl-13 border border-border-main rounded-2xl bg-bg-panel/50 text-text-main text-base transition-all duration-300 outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 shadow-inner group-hover:border-border-muted"
                  />
                </div>
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-text-dim px-1">
                  Last Name
                </label>
                <div className="relative group">
                  <User
                    className="absolute left-5 top-1/2 -translate-y-1/2 text-text-muted group-focus-within:text-primary transition-colors"
                    size={18}
                    strokeWidth={2.5}
                  />
                  <input
                    type="text"
                    name="lastName"
                    placeholder="Doe"
                    value={formData.lastName}
                    onChange={handleChange}
                    required
                    disabled={loading}
                    className="w-full py-4 px-6 pl-13 border border-border-main rounded-2xl bg-bg-panel/50 text-text-main text-base transition-all duration-300 outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 shadow-inner group-hover:border-border-muted"
                  />
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-[10px] font-black uppercase tracking-[0.2em] text-text-dim px-1">
                Username
              </label>
              <div className="relative group">
                <User
                  className="absolute left-5 top-1/2 -translate-y-1/2 text-text-muted group-focus-within:text-primary transition-colors"
                  size={18}
                  strokeWidth={2.5}
                />
                <input
                  type="text"
                  name="username"
                  placeholder="johndoe_99"
                  value={formData.username}
                  onChange={handleChange}
                  required
                  disabled={loading}
                  className={`w-full py-4 px-6 pl-13 border rounded-2xl bg-bg-panel/50 text-text-main text-base transition-all duration-300 outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 shadow-inner group-hover:border-border-muted ${localError?.field === "username" ? "border-red-500/50" : "border-border-main"}`}
                />
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-[10px] font-black uppercase tracking-[0.2em] text-text-dim px-1">
                Email Address
              </label>
              <div className="relative group">
                <Mail
                  className="absolute left-5 top-1/2 -translate-y-1/2 text-text-muted group-focus-within:text-primary transition-colors"
                  size={18}
                  strokeWidth={2.5}
                />
                <input
                  type="email"
                  name="email"
                  placeholder="john@example.com"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  disabled={loading}
                  className="w-full py-4 px-6 pl-13 border border-border-main rounded-2xl bg-bg-panel/50 text-text-main text-base transition-all duration-300 outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 shadow-inner group-hover:border-border-muted"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-5">
              <div className="flex flex-col gap-2">
                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-text-dim px-1">
                  Passkey
                </label>
                <div className="relative group">
                  <Lock
                    className="absolute left-5 top-1/2 -translate-y-1/2 text-text-muted group-focus-within:text-primary transition-colors"
                    size={18}
                    strokeWidth={2.5}
                  />
                  <input
                    type="password"
                    name="password"
                    placeholder="••••••••"
                    value={formData.password}
                    onChange={handleChange}
                    required
                    disabled={loading}
                    className={`w-full py-4 px-6 pl-13 border rounded-2xl bg-bg-panel/50 text-text-main text-base transition-all duration-300 outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 shadow-inner group-hover:border-border-muted ${localError?.field === "password" ? "border-red-500/50" : "border-border-main"}`}
                  />
                </div>
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-text-dim px-1">
                  Verify
                </label>
                <div className="relative group">
                  <Lock
                    className="absolute left-5 top-1/2 -translate-y-1/2 text-text-muted group-focus-within:text-primary transition-colors"
                    size={18}
                    strokeWidth={2.5}
                  />
                  <input
                    type="password"
                    name="confirmPassword"
                    placeholder="••••••••"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    required
                    disabled={loading}
                    className={`w-full py-4 px-6 pl-13 border rounded-2xl bg-bg-panel/50 text-text-main text-base transition-all duration-300 outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 shadow-inner group-hover:border-border-muted ${localError?.field === "confirmPassword" ? "border-red-500/50" : "border-border-main"}`}
                  />
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="mt-6 flex items-center justify-center gap-3 bg-primary text-white py-5 rounded-2xl font-black text-[11px] uppercase tracking-[0.2em] transition-all duration-300 shadow-2xl shadow-primary/30 hover:bg-primary-hover hover:-translate-y-1 active:translate-y-0 disabled:opacity-40 disabled:cursor-not-allowed group"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <span>Construct Account</span>
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
              Existing operative?
              <Link
                to={ROUTES.LOGIN}
                className="text-primary font-bold ml-2 hover:text-primary-hover transition-colors underline underline-offset-4 decoration-2"
              >
                Authorize Session
              </Link>
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default SignupPage;
