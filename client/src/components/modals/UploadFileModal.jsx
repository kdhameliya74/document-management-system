import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Upload, X, Loader2, Check, AlertCircle } from "lucide-react";
import { uploadFileMeta } from "@/store/documentSystemSlice";
import Modal from "@/components/common/Modal";
import DocumentService from "@/services/document.service";
import { logError, uuidToBase64 } from "@/helpers/utils";

const CHUNK_SIZE = 3;
const STATUS = {
  PENDING: "pending",
  UPLOADING: "uploading",
  COMPLETED: "completed",
  ERROR: "error",
  DUPLICATE: "duplicate",
};

const REMOVABLE_STATUSES = [STATUS.PENDING, STATUS.DUPLICATE, STATUS.ERROR];

const UploadFileModal = ({ isOpen, onClose, currentFolderId }) => {
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState({});
  const { documents } = useSelector((state) => state.documentSystem);
  const currentDocument = documents[currentFolderId];
  const dispatch = useDispatch();

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    const filesStatus = {};
    const newFiles = files.map((file) => {
      const uid = uuidToBase64(crypto.randomUUID());
      filesStatus[uid] = isDuplicateName(file.name) ? STATUS.DUPLICATE : STATUS.PENDING;
      return {
        file,
        uid,
        name: file.name,
        size: file.size,
        mimeType: file.type,
      };
    });
    setSelectedFiles((prev) => [...prev, ...newFiles]);
    setUploadStatus((prev) => ({ ...prev, ...filesStatus }));
  };

  const isDuplicateName = (name) => {
    const sanitized = name.trim().toLowerCase();
    return currentDocument?.childDocuments?.some(
      (docId) => documents[docId]?.name.toLowerCase() === sanitized,
    );
  };

  const uploadFile = async (uploadInfo, fileObj) => {
    try {
      const response = await DocumentService.uploadFileOnS3(uploadInfo.uploadUrl, fileObj.file);
      if (response.status === 200) {
        const fileMeta = {
          name: fileObj.name,
          originalName: fileObj.name,
          size: fileObj.size,
          storageKey: uploadInfo.storageKey,
          bucket: uploadInfo.bucket,
          parentId: currentFolderId === "root" ? null : currentFolderId,
          extension: fileObj.name.split(".").pop(),
          mimeType: fileObj.mimeType,
          uploadStatus: STATUS.COMPLETED,
        };
        await dispatch(uploadFileMeta(fileMeta)).unwrap();
        setUploadStatus((prev) => ({ ...prev, [fileObj.uid]: STATUS.COMPLETED }));
      } else {
        throw new Error("Upload failed");
      }
    } catch (error) {
      setUploadStatus((prev) => ({ ...prev, [fileObj.uid]: STATUS.ERROR }));
      logError(error);
    }
  };

  const handleUpload = async () => {
    if (selectedFiles.length === 0 || isUploading) return;
    const pendingFiles = selectedFiles.filter(
      (f) => uploadStatus[f.uid] === STATUS.PENDING || uploadStatus[f.uid] === STATUS.ERROR,
    );
    if (pendingFiles.length === 0) return;

    try {
      setIsUploading(true);
      const filesToGetUrls = pendingFiles.map((f) => ({
        uid: f.uid,
        fileName: f.name,
        fileType: f.type,
      }));

      const response = await DocumentService.getPresignedUrls(filesToGetUrls);

      if (response?.success) {
        const { successfulUploads, failedUploads = [] } = response;

        if (failedUploads.length > 0) {
          failedUploads.forEach((f) => {
            setUploadStatus((prev) => ({ ...prev, [f.uid]: STATUS.ERROR }));
          });
        }

        if (successfulUploads.length > 0) {
          for (let i = 0; i < successfulUploads.length; i += CHUNK_SIZE) {
            const chunks = successfulUploads.slice(i, i + CHUNK_SIZE);

            // Set current chunk to UPLOADING status
            setUploadStatus((prev) => {
              const newStatus = { ...prev };
              chunks.forEach((chunk) => {
                newStatus[chunk.uid] = STATUS.UPLOADING;
              });
              return newStatus;
            });

            await Promise.allSettled(
              chunks.map((uploadInfo) => {
                const fileObj = pendingFiles.find((f) => f.uid === uploadInfo.uid);
                return uploadFile(uploadInfo, fileObj, currentFolderId);
              }),
            );
          }
        }
      }
    } catch (error) {
      logError(error);
    } finally {
      setIsUploading(false);
    }
  };

  const removeFile = (uid) => {
    setSelectedFiles((prev) => prev.filter((f) => f.uid !== uid));
  };

  const handleClose = () => {
    if (isUploading) return;
    setSelectedFiles([]);
    setUploadStatus({});
    setIsUploading(false);
    onClose();
  };

  const completedCount = selectedFiles.filter(
    (f) => uploadStatus[f.uid] === STATUS.COMPLETED,
  ).length;
  const totalCount = selectedFiles.length;

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Upload Documents" icon={<Upload />}>
      <div className="flex flex-col gap-8">
        {/* Dropzone Area */}
        <div className="group relative">
          <input
            type="file"
            multiple
            onChange={handleFileChange}
            disabled={isUploading}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10 disabled:cursor-not-allowed"
          />
          <div className="border-2 border-dashed border-border-main rounded-[2rem] p-10 text-center transition-all duration-300 bg-bg-panel/30 group-hover:border-primary/50 group-hover:bg-primary/5 group-hover:shadow-2xl group-hover:shadow-primary/5">
            <div className="flex flex-col items-center gap-4">
              <div className="w-16 h-16 rounded-2xl bg-bg-hover flex items-center justify-center text-text-dim group-hover:text-primary group-hover:scale-110 transition-all duration-300 shadow-inner">
                <Upload size={32} strokeWidth={1.5} />
              </div>
              <div>
                <p className="text-text-main font-bold text-lg tracking-tight">
                  Drop your files here
                </p>
                <p className="text-text-dim text-sm mt-1 font-medium">
                  or click to browse from your device
                </p>
              </div>
              <div className="px-4 py-1.5 bg-bg-hover rounded-full text-[10px] font-black text-text-dim border border-border-muted uppercase tracking-[0.2em]">
                Max 50MB per file
              </div>
            </div>
          </div>
        </div>

        {selectedFiles.length > 0 && (
          <div className="flex flex-col gap-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
            <div className="flex justify-between items-center px-1">
              <span className="text-sm font-bold text-text-muted uppercase tracking-wider">Queue</span>
              <div className="flex items-center gap-2">
                <div className="h-1.5 w-24 bg-bg-hover rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-primary transition-all duration-500" 
                    style={{ width: `${(completedCount / totalCount) * 100}%` }}
                  />
                </div>
                <span className="text-xs font-bold text-primary">
                  {completedCount}/{totalCount}
                </span>
              </div>
            </div>
            
            <div className="max-h-56 overflow-y-auto pr-2 flex flex-col gap-2.5 custom-scrollbar min-h-0">
              {selectedFiles.map((fileObj) => (
                <div
                  key={fileObj.uid}
                  className={`flex gap-4 items-center justify-between p-4 rounded-2xl border transition-all duration-200 ${
                    uploadStatus[fileObj.uid] === STATUS.DUPLICATE 
                      ? "border-red-500/20 bg-red-500/5" 
                      : "border-border-muted bg-bg-panel/50 hover:bg-bg-panel"
                  }`}
                >
                  <div className="flex-1 flex items-center gap-3.5 min-w-0">
                    <div className={`p-2 rounded-lg ${uploadStatus[fileObj.uid] === STATUS.COMPLETED ? "bg-green-500/10 text-green-500" : "bg-bg-hover text-text-dim"}`}>
                      {uploadStatus[fileObj.uid] === STATUS.COMPLETED ? <Check size={18} /> : <AlertCircle size={18} />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-text-main truncate text-sm font-bold leading-none mb-1">
                        {fileObj.name}
                      </p>
                      <p className="text-text-dim text-[11px] font-medium uppercase tracking-tight">
                        {(fileObj.size / 1024).toFixed(1)} KB • {uploadStatus[fileObj.uid]}
                        {uploadStatus[fileObj.uid] === STATUS.DUPLICATE && (
                          <span className="text-red-400 ml-1"> (Already exists)</span>
                        )}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {uploadStatus[fileObj.uid] === STATUS.UPLOADING && (
                      <div className="w-5 h-5 border-2 border-primary/20 border-t-primary rounded-full animate-spin" />
                    )}
                    {REMOVABLE_STATUSES.includes(uploadStatus[fileObj.uid]) && !isUploading && (
                      <button
                        onClick={() => removeFile(fileObj.uid)}
                        className="p-2 rounded-lg text-text-dim hover:text-red-400 hover:bg-red-400/10 transition-all cursor-pointer"
                      >
                        <X size={16} strokeWidth={2.5} />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="flex justify-end gap-3.5 pt-2">
          <button
            onClick={handleClose}
            disabled={isUploading}
            className="flex-1 py-3.5 px-6 rounded-2xl font-bold text-sm transition-all duration-200 bg-bg-hover text-text-muted hover:text-text-main cursor-pointer border border-transparent hover:border-border-muted shadow-sm disabled:opacity-50"
          >
            {completedCount === totalCount && totalCount > 0 ? "Done" : "Cancel"}
          </button>
          <button
            onClick={handleUpload}
            disabled={selectedFiles.length === 0 || isUploading || completedCount === totalCount}
            className="flex-[1.5] flex items-center justify-center gap-2 py-3.5 px-6 rounded-2xl font-bold text-sm transition-all duration-300 bg-primary text-white hover:bg-primary-hover shadow-xl shadow-primary/20 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer hover:-translate-y-0.5"
          >
            {isUploading ? (
              <>
                <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                <span>Uploading...</span>
              </>
            ) : (
              <span>Upload {selectedFiles.length > 0 ? `${selectedFiles.length} ` : ""}Files</span>
            )}
          </button>
        </div>
      </div>
    </Modal>
  );
};

export default UploadFileModal;
