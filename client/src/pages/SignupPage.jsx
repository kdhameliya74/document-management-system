import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, Link } from 'react-router-dom';
import { signup, clearError } from '@/store/authSlice';
import { motion } from 'framer-motion';
import { Lock, Mail, ArrowRight, User, AlertCircle, Loader } from 'lucide-react';
import AuthBackground from '@/components/auth/AuthBackground';
import ROUTES from '@/utils/routes';

const SignupPage = () => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    username: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  
  const [localError, setLocalError] = useState(null);
  
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading, error, isAuthenticated } = useSelector((state) => state.auth);

  // Redirect if already authenticated
  React.useEffect(() => {
    if (isAuthenticated) {
      navigate(ROUTES.DASHBOARD.ROOT);
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
      [e.target.name]: e.target.value
    });
    if (localError) setLocalError(null);
    if (error) dispatch(clearError());
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLocalError(null);


    if(formData.username.match(/[^a-zA-Z0-9_]/)) {
      setLocalError({ field: 'username', message: "Username can only contain letters, numbers, and underscores" });
      return;
    }

    // Signup Validation
    if (formData.password !== formData.confirmPassword) {
      setLocalError({ field: 'confirmPassword', message: "Passwords do not match" });
      return;
    }
    if (formData.password.length < 8) {
      setLocalError({ field: 'password', message: "Password must be at least 8 characters" });
      return;
    }
    
    // Dispatch Signup
    dispatch(signup({ 
      email: formData.email, 
      firstName: formData.firstName,
      lastName: formData.lastName,
      username: formData.username,
      password: formData.password
    }));
  };

  return (
    <div className="flex items-center justify-center min-h-screen relative overflow-hidden bg-bg-main">
      <AuthBackground />
      
      <motion.div 
        className="relative z-10 bg-bg-panel/80 backdrop-blur-xl border border-border-muted p-8 md:p-12 rounded-3xl shadow-2xl w-full max-w-[500px] my-8"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="text-center mb-8">
          <h1 className="text-3xl font-medium text-text-main mb-2">Create Account</h1>
          <p className="text-text-muted">Get started with your free account</p>
        </div>

        {error && (
          <div className="mb-6 p-3 bg-red-500/10 border border-red-500/20 rounded-lg flex items-center gap-2 text-red-500 text-sm">
            <AlertCircle size={16} />
            <span>{error}</span>
          </div>
        )}
        {localError && (
          <div className="mb-6 p-3 bg-red-500/10 border border-red-500/20 rounded-lg flex items-center gap-2 text-red-500 text-sm">
            <AlertCircle size={16} />
            <span>{localError.message}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="flex gap-4">
            <div className="relative flex-1">
              <User className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted" size={20} />
              <input 
                type="text" 
                name="firstName"
                placeholder="First Name" 
                value={formData.firstName}
                onChange={handleChange}
                required
                disabled={loading}
                className="w-full py-3 px-4 pl-12 border border-border-muted rounded-lg bg-bg-main/50 text-text-main text-base transition-all outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 disabled:opacity-50 disabled:cursor-not-allowed"
              />
            </div>
            <div className="relative flex-1">
              <User className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted" size={20} />
              <input 
                type="text" 
                name="lastName"
                placeholder="Last Name" 
                value={formData.lastName}
                onChange={handleChange}
                required
                disabled={loading}
                className="w-full py-3 px-4 pl-12 border border-border-muted rounded-lg bg-bg-main/50 text-text-main text-base transition-all outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 disabled:opacity-50 disabled:cursor-not-allowed"
              />
            </div>
          </div>

            <div className="relative">
        <User className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted" size={20} />
            <input 
              type="text" 
              name="username"
              placeholder="Username" 
              value={formData.username}
              onChange={handleChange}
              required
              disabled={loading}
              className={`w-full py-3 px-4 pl-12 border rounded-lg bg-bg-main/50 text-text-main text-base transition-all outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 disabled:opacity-50 disabled:cursor-not-allowed ${localError?.field === 'username' ? 'border-red-500' : 'border-border-muted'}`}
              title="Username can only contain letters, numbers, and underscores"
            />
            </div>

          <div className="relative">
            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted" size={20} />
            <input 
              type="email" 
              name="email"
              placeholder="Email Address" 
              value={formData.email}
              onChange={handleChange}
              required
              disabled={loading}
              className="w-full py-3 px-4 pl-12 border border-border-muted rounded-lg bg-bg-main/50 text-text-main text-base transition-all outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 disabled:opacity-50 disabled:cursor-not-allowed"
            />
          </div>
          
          <div className="relative">
            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted" size={20} />
            <input 
              type="password" 
              name="password"
              placeholder="Password" 
              value={formData.password}
              onChange={handleChange}
              required
              disabled={loading}
              className={`w-full py-3 px-4 pl-12 border rounded-lg bg-bg-main/50 text-text-main text-base transition-all outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 disabled:opacity-50 disabled:cursor-not-allowed ${localError?.field === 'password' ? 'border-red-500' : 'border-border-muted'}`}
            />
          </div>

          <div className="relative">
            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted" size={20} />
            <input 
              type="password" 
              name="confirmPassword"
              placeholder="Confirm Password" 
              value={formData.confirmPassword}
              onChange={handleChange}
              required
              disabled={loading}
              className={`w-full py-3 px-4 pl-12 border rounded-lg bg-bg-main/50 text-text-main text-base transition-all outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 disabled:opacity-50 disabled:cursor-not-allowed ${localError?.field === 'confirmPassword' ? 'border-red-500' : 'border-border-muted'}`}
            />
          </div>

          <button type="submit" className="flex items-center justify-center gap-2 bg-primary text-white p-4 rounded-xl font-medium text-sm transition-all shadow-lg shadow-primary/20 hover:bg-primary-hover hover:-translate-y-px active:translate-y-0 disabled:opacity-50 disabled:cursor-not-allowed mt-2" disabled={loading}>
            {loading ? <Loader className="animate-spin" size={18} /> : null}
            <span>{loading ? 'Creating Account...' : 'Sign Up'}</span>
            {!loading && <ArrowRight size={18} />}
          </button>
        </form>

        <div className="mt-8 text-center text-text-muted">
          <p>
            Already have an account? 
            <Link to={ROUTES.LOGIN} className="text-primary font-normal ml-1 hover:underline">
              Sign In
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
};

export default SignupPage;
