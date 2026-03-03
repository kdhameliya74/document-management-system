import React, { useState, useCallback } from "react";
import { Mail, Loader, Share2, User, ChevronDown, Plus } from "lucide-react";
import { DEFAULT_MESSAGES, PERMISSION_LEVELS, SHARE_MESSAGES } from "@/helpers/constants.js";
import toast from "react-hot-toast";
import Modal from "@/components/common/Modal";
import UserTag from "@/components/common/UserTag";
import { isValidEmail } from "@/helpers/utils";
import { useDispatch } from "react-redux";
import { shareDocument } from "@/store/documents.slice";

const SharingModal = ({ item, isOpen, onClose }) => {
  const dispatch = useDispatch();
  const [email, setEmail] = useState("");
  const [newCollaborators, setNewCollaborators] = useState([]);
  const [errors, setErrors] = useState({});
  const [permission, setPermission] = useState(PERMISSION_LEVELS.VIEW);
  const [isLoading, setIsLoading] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const collaborators = item?.sharedWith || [];

  const handleShare = async () => {
    if (newCollaborators.length === 0) {
      return;
    }
    setIsLoading(true);
    try {
      const payload = {
        id: item.id,
        collaborators: newCollaborators.map((c) => ({ email: c.email, permission: c.permission })),
      };
      await dispatch(shareDocument(payload)).unwrap();
      toast.success(SHARE_MESSAGES.SHARE_SUCCESS);
      onClose();
    } catch (err) {
      toast.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddCollaborator = () => {
    setErrors({});
    if (!isValidEmail(email)) {
      setErrors({ email: DEFAULT_MESSAGES.INVALID_EMAIL });
      return;
    }
    if (collaborators.some((c) => c.email === email)) {
      setErrors({ email: "User already has access" });
      return;
    }
    setNewCollaborators((prev) => [...prev, { email, permission }]);
    setEmail("");
    setErrors({});
  };

  const handleRemoveCollaborator = useCallback((index) => {
    setNewCollaborators((prev) => prev.filter((_, i) => i !== index));
  }, []);

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
              <Mail
                className="absolute left-4 top-1/2 -translate-y-1/2 text-text-dim group-focus-within:text-primary transition-colors"
                size={18}
              />
              <input
                type="email"
                placeholder="Enter email address"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  setErrors({});
                }}
                className="w-full py-2.5 pl-12 pr-5 rounded-2xl bg-bg-panel text-text-main text-base outline-none border border-border-main focus:border-primary/50 focus:ring-4 focus:ring-primary/5 transition-all duration-300 shadow-inner"
              />
            </div>

            <div className="relative">
              <button
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className="cursor-pointer h-full px-4 rounded-2xl bg-bg-panel border border-border-main flex items-center gap-2 text-sm text-text-main hover:bg-bg-hover transition-all"
              >
                <span className="capitalize">{permission}</span>
                <ChevronDown
                  size={14}
                  className={`transition-transform ${isDropdownOpen ? "rotate-180" : ""}`}
                />
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
            <div className="flex items-center justify-center">
              <button
                onClick={handleAddCollaborator}
                className="py-3 px-6 rounded-2xl font-bold text-sm transition-all duration-300 bg-primary text-white hover:bg-primary-hover cursor-pointer"
              >
                <Plus size={18} />
              </button>
            </div>
          </div>
          {errors?.email && <p className="text-xs text-red-500">{errors?.email}</p>}
          {newCollaborators.length > 0 && (
            <div className="flex flex-wrap gap-2 max-h-48 overflow-y-auto pr-1">
              {newCollaborators.map((collaborator, index) => (
                <UserTag
                  key={`new-${index}`}
                  label={collaborator.email}
                  subLabel={collaborator.permission}
                  onClose={() => handleRemoveCollaborator(index)}
                />
              ))}
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end gap-3 px-1">
          <button
            onClick={handleShare}
            disabled={isLoading || newCollaborators.length === 0}
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
            {collaborators.length > 0 ? (
              collaborators.map((collab, index) => (
                <UserTag
                  key={`existing-${index}`}
                  label={collab.email}
                  subLabel={collab.permission}
                />
              ))
            ) : (
              <div className="flex items-center gap-2 px-2 py-1.5 rounded-full border transition-all duration-200 bg-bg-panel border-border-main text-text-main hover:border-border-muted hover:bg-bg-hover">
                <div className="flex items-center gap-1.5">
                  <span className="text-xs truncate max-w-[150px]">No one has access</span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </Modal>
  );
};

export default SharingModal;
