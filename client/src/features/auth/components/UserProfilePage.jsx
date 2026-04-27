import React, { useState, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Camera, User, Mail, Lock, CheckCircle, Save, Loader, Calendar, Clock } from "lucide-react";
import { updateProfile, changePassword } from "@/features/auth/store/auth.slice";
import PageHeader from "@/shared/components/common/PageHeader";
import { USER_PROFILE_MESSAGES } from "@/shared/utils/constants";
import toast from "react-hot-toast";
import authService from "@/features/auth/api/auth.api";
import { format } from "date-fns";
import userAvatar from "@/assets/avatar.png";
import { createThumbnail } from "@/shared/utils/image.utils";

const UserProfilePage = () => {
  const dispatch = useDispatch();
  const { user, loading } = useSelector((state) => state.auth);
  const [errors, setErrors] = useState({});
  const fileInputRef = useRef(null);

  const [details, setDetails] = useState({
    firstName: user?.firstName || "",
    lastName: user?.lastName || "",
  });
  const [avatarPreview, setAvatarPreview] = useState(user?.avatarUrl);

  const [passwords, setPasswords] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const handleDetailsChange = (e) => {
    setDetails({ ...details, [e.target.name]: e.target.value });
  };

  const handlePasswordChange = (e) => {
    setErrors({ [e.target.name]: "" });
    setPasswords({ ...passwords, [e.target.name]: e.target.value });
  };

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        toast.error(USER_PROFILE_MESSAGES.AVATAR_SIZE_ERROR);
        return;
      }
      try {
        const loadingToast = toast.loading(USER_PROFILE_MESSAGES.AVATAR_UPLOAD_LOADING);
        const thumbnailBlob = await createThumbnail(file, 150, 150);
        const { uploadUrl, storageKey, bucket } = await authService.getAvatarUploadUrl(file.name);

        await fetch(uploadUrl, {
          method: "PUT",
          body: thumbnailBlob,
          headers: {
            "Content-Type": "image/webp",
          },
        });

        setAvatarPreview(URL.createObjectURL(thumbnailBlob));
        await dispatch(updateProfile({ avatar: { storageKey, bucket } })).unwrap();
        toast.dismiss(loadingToast);
        toast.success(USER_PROFILE_MESSAGES.AVATAR_UPLOAD_SUCCESS);
      } catch (err) {
        toast.error(USER_PROFILE_MESSAGES.AVATAR_UPLOAD_ERROR);
        console.error(err);
      }
    }
  };

  const handleUpdateDetails = async (e) => {
    e.preventDefault();
    try {
      await dispatch(updateProfile(details)).unwrap();
      toast.success(USER_PROFILE_MESSAGES.UPDATE_SUCCESS);
    } catch (err) {
      toast.error(err);
    }
  };

  const handleUpdatePassword = async (e) => {
    e.preventDefault();
    if (passwords.newPassword.length < 8) {
      setErrors({ ...errors, newPassword: USER_PROFILE_MESSAGES.PASSWORD_LENGTH });
      return;
    }
    if (passwords.newPassword !== passwords.confirmPassword) {
      setErrors({ ...errors, confirmPassword: USER_PROFILE_MESSAGES.PASSWORD_MISMATCH });
      return;
    }
    try {
      await dispatch(
        changePassword({
          currentPassword: passwords.currentPassword,
          newPassword: passwords.newPassword,
        }),
      ).unwrap();
      toast.success(USER_PROFILE_MESSAGES.PASSWORD_SUCCESS);
      setPasswords({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
    } catch (err) {
      toast.error(err);
    }
  };

  return (
    <div className="max-w-4xl mx-auto pb-12">
      <PageHeader>
        <PageHeader.Left
          title="Account Settings"
          subtitle="Manage your profile information and security settings"
        />
      </PageHeader>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Profile Sidebar */}
        <div className="lg:col-span-1 space-y-6">
          <div className="glass-panel p-8 rounded-3xl border border-border-main flex flex-col items-center text-center">
            <div
              className="relative group cursor-pointer"
              onClick={() => fileInputRef.current.click()}
            >
              <div className="w-32 h-32 rounded-3xl overflow-hidden border-4 border-primary/20 bg-bg-panel flex items-center justify-center text-primary text-4xl font-bold shadow-premium group-hover:border-primary/50 transition-all">
                {avatarPreview ? (
                  <img
                    src={avatarPreview || userAvatar}
                    alt="Profile"
                    className="w-full h-full object-cover"
                    loading="lazy"
                    onError={(e) => {
                      e.target.src = userAvatar;
                    }}
                  />
                ) : (
                  details.firstName?.charAt(0).toUpperCase()
                )}
              </div>
              <div className="absolute inset-0 bg-black/40 rounded-3xl flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                <Camera className="text-white" size={24} />
              </div>
              <input
                type="file"
                ref={fileInputRef}
                className="hidden"
                accept="image/*"
                onChange={handleFileChange}
              />
            </div>
            <h3 className="mt-4 text-xl font-bold text-text-main">{user.fullName}</h3>
            <p className="text-sm text-text-dim">@{user.username}</p>
            <div className="mt-6 w-full pt-6 border-t border-border-muted flex flex-col gap-3">
              <div className="flex items-center gap-3 text-sm text-text-muted px-2">
                <CheckCircle size={16} className="text-primary" />
                <span>Account Verified</span>
              </div>
              <div className="flex items-center gap-3 text-sm text-text-muted px-2">
                <User size={16} className="text-secondary" />
                <span>Standard Member</span>
              </div>
              <div className="flex items-center gap-3 text-sm text-text-muted px-2">
                <Calendar size={16} className="text-secondary" />
                <span>
                  Since:{" "}
                  <span className="text-primary">
                    {format(new Date(user.createdAt), "MMM dd, yyyy")}
                  </span>
                </span>
              </div>
              <div className="flex items-center gap-3 text-sm text-text-muted px-2">
                <Clock size={16} className="text-secondary" />
                <span>
                  Last Login:{" "}
                  <span className="text-primary">
                    {format(new Date(user.lastLogin), "MMM dd, yyyy")}
                  </span>
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Forms Area */}
        <div className="lg:col-span-2 space-y-8">
          {/* Basic Details */}
          <section className="glass-panel p-8 rounded-3xl border border-border-main">
            <div className="flex items-center gap-3 mb-8">
              <div className="p-2.5 bg-primary/10 rounded-xl text-primary">
                <User size={20} />
              </div>
              <h4 className="text-lg font-bold text-text-main">Personal Information</h4>
            </div>

            <form onSubmit={handleUpdateDetails} className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label htmlFor="firstName" className="text-sm font-medium text-text-muted ml-1">First Name</label>
                  <input
                    type="text"
                    id="firstName"
                    name="firstName"
                    value={details.firstName}
                    onChange={handleDetailsChange}
                    className="w-full bg-bg-panel border border-border-main rounded-2xl py-3 px-4 text-text-main outline-none focus:border-primary/50 focus:ring-4 focus:ring-primary/5 transition-all"
                  />
                </div>
                <div className="space-y-2">
                  <label htmlFor="lastName" className="text-sm font-medium text-text-muted ml-1">Last Name</label>
                  <input
                    type="text"
                    id="lastName"
                    name="lastName"
                    value={details.lastName}
                    onChange={handleDetailsChange}
                    className="w-full bg-bg-panel border border-border-main rounded-2xl py-3 px-4 text-text-main outline-none focus:border-primary/50 focus:ring-4 focus:ring-primary/5 transition-all"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label htmlFor="username" className="text-sm font-medium text-text-muted ml-1">Username</label>
                <div className="relative">
                  <User
                    size={18}
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-text-dim"
                  />
                  <input
                    type="text"
                    id="username"
                    name="username"
                    value={user.username}
                    readOnly
                    className="w-full bg-bg-muted/50 border border-border-main rounded-2xl py-3 px-12 text-text-dim outline-none cursor-not-allowed"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label htmlFor="email" className="text-sm font-medium text-text-muted ml-1">Email Address</label>
                <div className="relative">
                  <Mail
                    size={18}
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-text-dim"
                  />
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={user.email}
                    onChange={handleDetailsChange}
                    readOnly
                    className="w-full bg-bg-muted/50 border border-border-main rounded-2xl py-3 px-12 text-text-dim outline-none cursor-not-allowed"
                  />
                </div>
              </div>

              <div className="pt-4">
                <button
                  type="submit"
                  disabled={loading}
                  className="cursor-pointer flex items-center gap-2 bg-primary hover:bg-primary-hover text-white font-medium py-3 px-8 rounded-2xl transition-all shadow-lg shadow-primary/20 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? <Loader className="animate-spin" size={20} /> : <Save size={20} />}
                  Save Changes
                </button>
              </div>
            </form>
          </section>

          {/* Password Section */}
          <section className="glass-panel p-8 rounded-3xl border border-border-main">
            <div className="flex items-center gap-3 mb-8">
              <div className="p-2.5 bg-secondary/10 rounded-xl text-secondary">
                <Lock size={20} />
              </div>
              <h4 className="text-lg font-bold text-text-main">Change Password</h4>
            </div>

            <form onSubmit={handleUpdatePassword} className="space-y-6">
              <div className="space-y-2">
                <label htmlFor="currentPassword" className="text-sm font-medium text-text-muted ml-1">Current Password</label>
                <input
                  type="password"
                  id="currentPassword"
                  name="currentPassword"
                  value={passwords.currentPassword}
                  onChange={handlePasswordChange}
                  className="w-full bg-bg-panel border border-border-main rounded-2xl py-3 px-4 text-text-main outline-none focus:border-primary/50 focus:ring-4 focus:ring-primary/5 transition-all"
                  placeholder="••••••••"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label htmlFor="newPassword" className="text-sm font-medium text-text-muted ml-1">New Password</label>
                  <input
                    type="password"
                    id="newPassword"
                    name="newPassword"
                    value={passwords.newPassword}
                    onChange={handlePasswordChange}
                    className={`w-full bg-bg-panel border rounded-2xl py-3 px-4 text-text-main outline-none focus:border-primary/50 focus:ring-4 focus:ring-primary/5 transition-all ${errors.newPassword ? "border-red-500/50" : "border-border-main"}`}
                    placeholder="••••••••"
                  />
                  <div className="min-h-[15px] mt-0.5">
                    {errors.newPassword && (
                      <p className="text-red-500 text-xs">{errors.newPassword}</p>
                    )}
                  </div>
                </div>
                <div className="space-y-2">
                  <label htmlFor="confirmPassword" className="text-sm font-medium text-text-muted ml-1">
                    Confirm New Password
                  </label>
                  <input
                    type="password"
                    id="confirmPassword"
                    name="confirmPassword"
                    value={passwords.confirmPassword}
                    onChange={handlePasswordChange}
                    className={`w-full bg-bg-panel border rounded-2xl py-3 px-4 text-text-main outline-none focus:border-primary/50 focus:ring-4 focus:ring-primary/5 transition-all ${errors.confirmPassword ? "border-red-500/50" : "border-border-main"}`}
                    placeholder="••••••••"
                  />
                  <div className="min-h-[15px] mt-0.5">
                    {errors.confirmPassword && (
                      <p className="text-red-500 text-xs">{errors.confirmPassword}</p>
                    )}
                  </div>
                </div>
              </div>

              <div className="pt-4">
                <button
                  type="submit"
                  disabled={loading}
                  className="cursor-pointer flex items-center gap-2 border border-border-main hover:bg-bg-hover text-text-main font-medium py-3 px-8 rounded-2xl transition-all disabled:opacity-50"
                >
                  {loading && <Loader className="animate-spin" size={20} />}
                  Update Password
                </button>
              </div>
            </form>
          </section>
        </div>
      </div>
    </div>
  );
};

export default UserProfilePage;
