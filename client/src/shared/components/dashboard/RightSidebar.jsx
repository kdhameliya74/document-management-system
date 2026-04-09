import React, { useEffect, useState, useCallback } from "react";
import { useSelector, useDispatch } from "react-redux";
import { Folder, Download, Trash2, Share2, Clock, Info, X, Pencil, Eye, Sparkles, Tag } from "lucide-react";
import {
  setShowDetails,
  setActiveModal,
  setModalProps,
  clearUISelection,
} from "@/features/documents/store/documents.slice";
import { summarizeDocument } from "@/features/documents/store/documents.slice";
import { format } from "date-fns";
import toast from "react-hot-toast";

import FileIcon from "@/shared/components/common/FileIcon";
import { truncateName } from "@/shared/utils/utils";
import { FOLDER_COLORS } from "@/shared/utils/constants";
import { useDownloadDocument } from "@/shared/hooks/useDownloadDocument";
import UserTag from "@/shared/components/common/UserTag";
import ActivityLog from "@/shared/components/common/ActivityLog";

const RightSidebar = () => {
  const dispatch = useDispatch();
  const { documents, currentFolderId, selectedId, showDetails, isSummarizing } = useSelector(
    (state) => state.documentSystem,
  );
  const { downloadFile, downloadFolder } = useDownloadDocument();
  const { user } = useSelector((state) => state.auth);

  const [activeTab, setActiveTab] = useState("info"); // "info" or "activity"

  const currentFolder = documents[currentFolderId];
  const selectedItem = selectedId ? documents[selectedId] : currentFolder;

  const handleClose = useCallback(() => {
    dispatch(setShowDetails(false));
    setActiveTab("info");
    dispatch(clearUISelection());
  }, [dispatch]);

  const handleSummarize = async () => {
    const docId = selectedItem?.id || selectedItem?._id;
    if (!docId) return;
    try {
      await dispatch(summarizeDocument(docId)).unwrap();
      toast.success("AI summary generated!");
    } catch (err) {
      toast.error(err || "Failed to generate summary.");
    }
  };

  useEffect(() => {
    return () => {
      if (showDetails) {
        handleClose();
      }
    };
  }, [showDetails, handleClose]);

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
                          {selectedItem.size
                            ? `${(selectedItem.size / 1024).toFixed(2)} KB`
                            : "N/A"}
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

                {/* ── AI Insights Section (files only) ── */}
                {!isFolder && (
                  <div className="mt-3 rounded-3xl border border-border-muted/50 overflow-hidden">
                    {/* Header */}
                    <div className="flex items-center justify-between px-4 py-3 bg-gradient-to-r from-violet-500/10 via-primary/10 to-fuchsia-500/10 border-b border-border-muted/30">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-violet-500 to-fuchsia-500 flex items-center justify-center shadow-md">
                          <Sparkles size={12} className="text-white" strokeWidth={2.5} />
                        </div>
                        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-text-main">
                          AI Insights
                        </span>
                      </div>
                      <button
                        onClick={handleSummarize}
                        disabled={isSummarizing}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-wider bg-gradient-to-r from-violet-500 to-fuchsia-500 text-white shadow-lg shadow-violet-500/25 hover:shadow-violet-500/40 hover:opacity-90 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                      >
                        {isSummarizing ? (
                          <>
                            <svg className="animate-spin w-3 h-3" viewBox="0 0 24 24" fill="none">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                            </svg>
                            <span>Thinking…</span>
                          </>
                        ) : (
                          <>
                            <Sparkles size={10} strokeWidth={3} />
                            <span>{selectedItem?.description ? "Re-summarize" : "Summarize"}</span>
                          </>
                        )}
                      </button>
                    </div>

                    <div className="p-4 flex flex-col gap-3 bg-bg-panel/30">
                      {/* Summary */}
                      {selectedItem?.description ? (
                        <div className="flex flex-col gap-1.5">
                          <span className="text-[10px] font-black uppercase tracking-[0.2em] text-text-dim">
                            Summary
                          </span>
                          <p className="text-sm text-text-muted leading-relaxed font-medium">
                            {selectedItem.description}
                          </p>
                        </div>
                      ) : !isSummarizing ? (
                        <p className="text-xs text-text-dim text-center py-2 font-medium">
                          Click <span className="text-violet-400 font-bold">Summarize</span> to generate an AI description for this file.
                        </p>
                      ) : (
                        <div className="flex flex-col gap-2 animate-pulse">
                          <div className="h-2.5 bg-bg-hover rounded-full w-full" />
                          <div className="h-2.5 bg-bg-hover rounded-full w-4/5" />
                          <div className="h-2.5 bg-bg-hover rounded-full w-3/5" />
                        </div>
                      )}

                      {/* Tags */}
                      {selectedItem?.tags?.length > 0 && (
                        <div className="flex flex-col gap-2">
                          <div className="flex items-center gap-1.5">
                            <Tag size={10} className="text-text-dim" />
                            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-text-dim">
                              AI Tags
                            </span>
                          </div>
                          <div className="flex flex-wrap gap-1.5">
                            {selectedItem.tags.map((tag, i) => (
                              <span
                                key={i}
                                className="px-2.5 py-1 rounded-xl text-[10px] font-bold bg-gradient-to-r from-violet-500/15 to-fuchsia-500/15 text-violet-300 border border-violet-500/20 tracking-wide"
                              >
                                #{tag}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="py-2 px-1">
                <ActivityLog docId={selectedItem._id || selectedItem.id} />
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default RightSidebar;
