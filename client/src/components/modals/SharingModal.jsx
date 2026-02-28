import React, { useState } from "react";
import { Mail, Loader, Share2, User, ChevronDown } from "lucide-react";
import { PERMISSION_LEVELS, SHARE_MESSAGES } from "@/helpers/constants.js";
import DocumentService from "@/services/document.service";
import toast from "react-hot-toast";
import Modal from "@/components/common/Modal";

const SharingModal = ({ item, isOpen, onClose }) => {
  const [email, setEmail] = useState("");
  const [permission, setPermission] = useState(PERMISSION_LEVELS.VIEW);
  const [isLoading, setIsLoading] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  // Mocked collaborators for now
  const collaborators = item?.collaborators || [
    { email: "owner@example.com", permission: "admin", isOwner: true },
    { email: "kaushik@example.com", permission: "edit", isOwner: false },
    { email: "team@company.com", permission: "view", isOwner: false },
    { email: "designer@studio.io", permission: "edit", isOwner: false },
    { email: "guest@external.com", permission: "view", isOwner: false },
  ];

  const handleShare = async () => {
    if (!email.trim()) {
      toast.error("Please enter an email address");
      return;
    }

    setIsLoading(true);
    try {
      await DocumentService.shareDocument(item.id, email.trim(), permission);
      toast.success(SHARE_MESSAGES.SHARE_SUCCESS);
      setEmail("");
      // In a real app, we might want to refresh the collaborator list here
    } catch (err) {
      toast.error(err?.message || SHARE_MESSAGES.SHARE_FAILED);
    } finally {
      setIsLoading(false);
    }
  };

  const modalProps = {
    title: `Share "${item?.name}"`,
    icon: <Share2 className="text-text-muted" />,
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} {...modalProps}>
      <div className="flex flex-col gap-6">
        {/* Email Input & Permission Select */}
        <div className="flex flex-col gap-3">
          <label className="text-sm font-bold text-text-muted px-1 uppercase tracking-wider">
            Add people
          </label>
          <div className="flex gap-2">
            <div className="relative flex-1 group">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-text-dim group-focus-within:text-primary transition-colors" size={18} />
              <input
                type="email"
                placeholder="Enter email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full py-2.5 pl-12 pr-5 rounded-2xl bg-bg-panel text-text-main text-base outline-none border border-border-main focus:border-primary/50 focus:ring-4 focus:ring-primary/5 transition-all duration-300 shadow-inner"
              />
            </div>
            
            <div className="relative">
              <button
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className="cursor-pointer h-full px-4 rounded-2xl bg-bg-panel border border-border-main flex items-center gap-2 text-sm text-text-main hover:bg-bg-hover transition-all"
              >
                <span className="capitalize">{permission}</span>
                <ChevronDown size={14} className={`transition-transform ${isDropdownOpen ? "rotate-180" : ""}`} />
              </button>
              
              {isDropdownOpen && (
                <div className="absolute top-full right-0 mt-2 w-32 bg-bg-panel border border-border-main rounded-xl shadow-xl z-50 p-1">
                  {Object.values(PERMISSION_LEVELS).map((lvl) => (
                    <button
                      key={lvl}
                      onClick={() => {
                        setPermission(lvl);
                        setIsDropdownOpen(false);
                      }}
                      className={`cursor-pointer w-full text-left px-3 py-2 rounded-lg text-sm capitalize hover:bg-white/5 ${permission === lvl ? "text-primary font-bold" : "text-text-main"}`}
                    >
                      {lvl}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end gap-3 px-1">
          <button
            onClick={handleShare}
            disabled={isLoading || !email.trim()}
            className="flex-1 flex items-center justify-center gap-2 py-3 px-6 rounded-2xl font-bold text-sm transition-all duration-300 bg-primary text-white hover:bg-primary-hover shadow-xl shadow-primary/20 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
          >
            {isLoading ? <Loader className="animate-spin" size={18} /> : <span>Share</span>}
          </button>
        </div>

        {/* Separator */}
        <div className="h-px bg-border-main w-full" />

        {/* People with access */}
        <div className="flex flex-col gap-4">
          <label className="text-sm font-bold text-text-muted px-1 uppercase tracking-wider">
            People with access
          </label>
          <div className="flex flex-wrap gap-2 max-h-48 overflow-y-auto pr-1">
            {collaborators.map((collab, index) => (
              <div
                key={index}
                className={`flex items-center gap-2 px-2 py-1 rounded-full border transition-all duration-200 ${
                  collab.isOwner
                    ? "bg-primary/10 border-primary/30 text-primary shadow-sm shadow-primary/5"
                    : "bg-bg-panel border-border-main text-text-main hover:border-border-muted hover:bg-bg-hover"
                }`}
              >
                <div
                  className={`w-4 h-4 rounded-full flex items-center justify-center ${
                    collab.isOwner ? "bg-primary text-white" : "bg-bg-hover text-text-muted"
                  }`}
                >
                  <User size={12} />
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="text-xs truncate max-w-[150px]">
                    {collab.email}
                  </span>
                  <span className="text-[9px] font-semibold uppercase font-black tracking-tight opacity-50">
                    {collab.isOwner ? "Owner" : collab.permission}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </Modal>
  );
};

export default SharingModal;
