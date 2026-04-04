import React, { useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import {
  Folder,
  Download,
  Trash2,
  Share2,
  Clock,
  Info,
  X,
  Pencil,
  Eye,
} from "lucide-react";
import { setShowDetails, setActiveModal, setModalProps, clearUISelection } from "@/store/documents.slice";
import { format } from "date-fns";

import FileIcon from "@/components/common/FileIcon";
import { truncateName } from "@/helpers/utils";
import { FOLDER_COLORS } from "@/helpers/constants";
import { useDownloadDocument } from "@/hooks/useDownloadDocument";
import UserTag from "@/components/common/UserTag";
import ActivityLog from "@/components/common/ActivityLog";

const RightSidebar = () => {
  const dispatch = useDispatch();
  const { documents, currentFolderId, selectedId, showDetails } = useSelector(
    (state) => state.documentSystem,
  );
  const { downloadFile, downloadFolder } = useDownloadDocument();
  const { user } = useSelector((state) => state.auth);

  const [activeTab, setActiveTab] = useState("info"); // "info" or "activity"

  const currentFolder = documents[currentFolderId];
  const selectedItem = selectedId ? documents[selectedId] : currentFolder;

  if (!showDetails || !selectedItem) return null;

  const isFolder = selectedItem.docType === "folder";
  const type = isFolder ? "folder" : "file";

  const isOwner = selectedItem?.owner === user?.id || selectedItem?.owner?.id === user?.id;
  const sharedWithMe = selectedItem?.sharedWith || [];

  const permissions =
    selectedItem?.permissions ||
    (isOwner
      ? {
          canView: true,
          canEdit: true,
          canDelete: true,
          canShare: true,
          canMove: true,
          canDownload: true,
        }
      : {});

  const ACTION_CONFIG = [
    {
      id: "view",
      icon: Eye,
      title: "View",
      show: permissions?.canView && !isFolder,
      onClick: () => {
        dispatch(setModalProps({ item: selectedItem, itemType: type, source: "sidebar" }));
        dispatch(setActiveModal("view"));
      },
    },
    {
      id: "edit",
      icon: Pencil,
      title: "Edit",
      show: permissions?.canEdit,
      onClick: () => {
        dispatch(setModalProps({ item: selectedItem, itemType: type, source: "sidebar" }));
        dispatch(setActiveModal("edit"));
      },
    },
    {
      id: "share",
      icon: Share2,
      title: "Share",
      show: permissions?.canShare,
      onClick: () => {
        dispatch(setModalProps({ item: selectedItem, itemType: type, source: "sidebar" }));
        dispatch(setActiveModal("share"));
      },
    },
    {
      id: "download",
      icon: Download,
      title: "Download",
      show: permissions?.canDownload,
      onClick: () => {
        if (isFolder) {
          downloadFolder({ docId: selectedItem.id, name: selectedItem.name || "folder" });
        } else {
          downloadFile({ docId: selectedItem.id, force: true });
        }
      },
    },
    {
      id: "delete",
      icon: Trash2,
      title: "Delete",
      show: permissions?.canDelete,
      className: "hover:text-error hover:bg-error/10",
      onClick: () => {
        dispatch(setModalProps({ item: selectedItem, itemType: type, source: "sidebar" }));
        dispatch(setActiveModal("delete"));
      },
    },
  ];

  const TABS = [
    { id: "info", label: "Basic Info", icon: Info },
    { id: "activity", label: "Activity Logs", icon: Clock },
  ];

  const handleClose = () => {
    dispatch(setShowDetails(false))
    dispatch(clearUISelection())
  }

  return (
    <>
      <div className="w-[370px] absolute right-0 bg-bg-panel/60 backdrop-blur-xl border-l border-border-main flex flex-col h-full overflow-hidden text-text-main animate-in slide-in-from-right duration-500 z-50 shadow-2xl">
        <div className="p-5 border-b border-border-muted flex items-center justify-between bg-bg-panel/40">
          <h3 className="text-xl font-black tracking-tight">{truncateName(selectedItem, 20)}</h3>
          <button
            onClick={handleClose}
            className="p-2 rounded-xl text-text-muted hover:text-text-main hover:bg-bg-hover transition-all cursor-pointer"
          >
            <X size={18} strokeWidth={2.5} />
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="flex px-5 border-b border-border-muted/30">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 py-4 px-4 text-[11px] font-black uppercase tracking-[0.15em] transition-all relative group ${
                activeTab === tab.id ? "text-primary" : "text-text-dim hover:text-text-muted"
              }`}
            >
              <tab.icon size={14} strokeWidth={activeTab === tab.id ? 3 : 2} />
              {tab.label}
              {activeTab === tab.id && (
                <div className="absolute bottom-0 left-0 right-0 h-[3px] bg-primary rounded-t-full shadow-[0_-4px_12px_rgba(var(--primary-rgb),0.3)]" />
              )}
            </button>
          ))}
        </div>

        <div className="flex-1 overflow-y-auto custom-scrollbar relative">
          <div className="p-4">
            {activeTab === "info" ? (
              <div className="">
                <div className="flex flex-col items-center mb-5 text-center mt-4">
                  <div className="w-[140px] h-[140px] bg-bg-hover rounded-[2.5rem] flex items-center justify-center mb-6 border border-border-main shadow-inner relative group">
                    <div className="absolute inset-0 bg-primary/5 blur-3xl rounded-full opacity-50" />
                    {isFolder ? (
                      <Folder
                        size={80}
                        fill={selectedItem.color || FOLDER_COLORS.DEFAULT}
                        color={selectedItem.color || FOLDER_COLORS.DEFAULT}
                        strokeWidth={1}
                        className="relative z-10 drop-shadow-2xl"
                      />
                    ) : (
                      <FileIcon
                        mimeType={selectedItem.mimeType}
                        size={80}
                        strokeWidth={1.5}
                        className="text-primary/60 relative z-10 drop-shadow-xl"
                      />
                    )}
                  </div>
                  <h4 className="text-lg font-bold mb-1 break-words max-w-full px-2 leading-tight text-text-main uppercase tracking-tight">
                    {selectedItem.name}
                  </h4>
                </div>

                <div className="flex items-center justify-center gap-2 mb-6 p-2">
                  {ACTION_CONFIG.filter((action) => action.show).map((action) => (
                    <button
                      key={action.id}
                      onClick={(e) => {
                        e.stopPropagation();
                        action.onClick(e);
                      }}
                      className={`sidebar-item ${action.className || ""}`}
                      title={action.title}
                    >
                      <action.icon size={18} />
                    </button>
                  ))}
                </div>

                {sharedWithMe.length > 0 && (
                  <div className="w-full mb-3 p-4 rounded-3xl bg-bg-panel/50 border border-border-muted/50 backdrop-blur-sm">
                    <div className="text-[10px] font-black uppercase tracking-[0.2em] text-text-dim mb-3">
                      Shared With
                    </div>
                    <div className="flex flex-wrap gap-2 max-h-48 overflow-y-auto pr-1">
                      {sharedWithMe.map((collaborator, index) => (
                        <UserTag key={`new-${index}`} collaborator={collaborator} />
                      ))}
                    </div>
                  </div>
                )}

                <div className="flex flex-col gap-4 p-4 rounded-3xl bg-bg-panel/50 border border-border-muted/50 backdrop-blur-sm">
                  <div className="flex gap-4 items-start">
                    <div className="w-8 h-8 rounded-xl bg-bg-hover flex items-center justify-center text-primary/70">
                      <Info size={16} />
                    </div>
                    <div className="flex flex-col">
                      <span className="text-[10px] font-black uppercase tracking-[0.2em] text-text-dim mb-1">
                        Type
                      </span>
                      <span className="text-sm font-bold text-text-main uppercase">
                        {isFolder ? "Folder" : selectedItem.extension || "Document"}
                      </span>
                    </div>
                  </div>

                  {!isFolder && (
                    <div className="flex gap-4 items-start">
                      <div className="w-8 h-8 rounded-xl bg-bg-hover flex items-center justify-center text-primary/70">
                        <Info size={16} />
                      </div>
                      <div className="flex flex-col">
                        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-text-dim mb-1">
                          Size
                        </span>
                        <span className="text-sm font-bold text-text-main font-mono">
                          {selectedItem.size ? `${(selectedItem.size / 1024).toFixed(2)} KB` : "N/A"}
                        </span>
                      </div>
                    </div>
                  )}

                  {selectedItem?.createdAt && (
                    <div className="flex gap-4 items-start">
                      <div className="w-8 h-8 rounded-xl bg-bg-hover flex items-center justify-center text-primary/70">
                        <Clock size={16} />
                      </div>
                      <div className="flex flex-col">
                        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-text-dim mb-1">
                          Created
                        </span>
                        <span className="text-sm font-bold text-text-main">
                          {format(new Date(selectedItem.createdAt), "MMM d, yyyy")}
                        </span>
                      </div>
                    </div>
                  )}

                  <div className="flex gap-4 items-start">
                    <div className="w-8 h-8 text-xs font-black rounded-xl bg-bg-hover flex items-center justify-center text-primary/70 uppercase">
                      {isOwner ? user?.firstName?.charAt(0) : selectedItem?.owner?.name?.charAt(0)}
                    </div>
                    <div className="flex flex-col">
                      <span className="text-[10px] font-black uppercase tracking-[0.2em] text-text-dim mb-1">
                        Owner
                      </span>
                      <div className="flex items-center gap-2 text-sm font-bold text-text-main">
                        {isOwner
                          ? user?.fullName || user?.firstName
                          : selectedItem?.owner?.name || ""}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="py-2 px-1">
                <ActivityLog />
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default RightSidebar;
