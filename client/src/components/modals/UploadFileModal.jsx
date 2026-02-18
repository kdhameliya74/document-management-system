import React, { useState } from "react";
// import { useDispatch } from "react-redux";
import axios from "axios";
import { Upload, X, Loader2, Check, AlertCircle } from "lucide-react";
// import { fetchDocuments } from "@/store/documentSystemSlice";
import Modal from "@/components/common/Modal";
import fileSystemAPI from "@/services/fileSystemService";
import { logError, uuidToBase64 } from "@/helpers/utils";

const CHUNK_SIZE = 3;
const STATUS = {
  PENDING: "pending",
  UPLOADING: "uploading",
  COMPLETED: "completed",
  ERROR: "error",
};

const UploadFileModal = ({ isOpen, onClose, currentFolderId }) => {
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState({});
  // const dispatch = useDispatch();

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    const filesStatus = {};
    const newFiles = files.map((file) => {
      const uid = uuidToBase64(crypto.randomUUID());
      filesStatus[uid] = STATUS.PENDING;
      return {
        file,
        uid,
        name: file.name,
        size: file.size,
        type: file.type,
        status: STATUS.PENDING,
        progress: 0,
      };
    });
    setSelectedFiles((prev) => [...prev, ...newFiles]);
    setUploadStatus((prev) => ({ ...prev, ...filesStatus }));
    console.log("selectedFiles", selectedFiles);
    console.log("uploadStatus", uploadStatus);
  };

  const onUploadProgress = (progressEvent, fileObj) => {
    const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
    setSelectedFiles((prev) =>
      prev.map((f) => (f.uid === fileObj.uid ? { ...f, progress: percentCompleted } : f)),
    );
  };

  const uploadFile = async (uploadInfo, fileObj) => {
    try {
      // 1. Upload to S3
      const response = await axios.put(uploadInfo.uploadUrl, fileObj.file, {
        headers: {
          "Content-Type": fileObj.type,
        },
        onUploadProgress: (progressEvent) => onUploadProgress(progressEvent, fileObj),
      });

      // // 2. Confirm Upload to Backend
      // const confirmData = {
      //   name: fileObj.name,
      //   size: fileObj.size,
      //   type: fileObj.type,
      //   storageKey: uploadInfo.storageKey,
      //   bucket: "dms-s3-bucket-developer", // This should ideally come from env or response
      //   folderId: folderId === "root" ? null : folderId,
      // };

      // const response = await fileSystemAPI.confirmUpload(confirmData);

      if (response.status === 200) {
        setUploadStatus((prev) => ({ ...prev, [fileObj.uid]: STATUS.COMPLETED }));
        return response.file;
      } else {
        throw new Error("Confirmation failed");
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

    console.log("pendingFiles", pendingFiles);
    if (pendingFiles.length === 0) return;

    try {
      setIsUploading(true);

      const filesToGetUrls = pendingFiles.map((f) => ({
        uid: f.uid,
        fileName: f.name,
        fileType: f.type,
      }));

      const response = await fileSystemAPI.getPresignedUrls(filesToGetUrls);

      if (response?.success) {
        const { successfulUploads } = response;

        if (successfulUploads) {
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

          // // Refresh documents after all uploads in this batch are done
          // dispatch(fetchDocuments(currentFolderId));
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

  const completedCount = selectedFiles.filter((f) => f.status === STATUS.COMPLETED).length;
  const totalCount = selectedFiles.length;

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Upload Files">
      <div className="flex flex-col gap-6">
        <div className="border-2 border-dashed border-border-muted rounded-2xl p-4 text-center relative cursor-pointer transition-all hover:border-primary hover:bg-primary/5 group">
          <input
            type="file"
            multiple
            onChange={handleFileChange}
            disabled={isUploading}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed"
          />
          <div className="flex flex-col items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-bg-hover flex items-center justify-center text-text-muted group-hover:text-primary transition-colors">
              <Upload size={24} />
            </div>
            <div className="text-text-main font-medium">Click to select or drag files here</div>
            <div className="text-text-muted text-sm">Support for all file types</div>
          </div>
        </div>

        {selectedFiles.length > 0 && (
          <div className="flex flex-col gap-3">
            <div className="flex justify-between items-center text-sm">
              <span className="text-text-main font-medium">Files to upload</span>
              <span className="text-text-muted">
                {completedCount}/{totalCount} uploaded
              </span>
            </div>
            <div className="max-h-48 overflow-y-auto pr-2 flex flex-col gap-2 custom-scrollbar">
              {selectedFiles.map((fileObj) => (
                <div
                  key={fileObj.uid}
                  className="flex gap-2 items-center justify-between p-3 bg-bg-hover rounded-xl border border-border-muted"
                >
                  <div className="flex-1 flex items-center gap-3 min-w-0">
                    <div className="flex-1 text-text-main truncate text-sm font-medium">
                      {fileObj.name}
                    </div>
                    <div className="text-text-muted text-xs whitespace-nowrap">
                      {(fileObj.size / 1024).toFixed(1)} KB
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {uploadStatus[fileObj.uid] === STATUS.UPLOADING && (
                      <Loader2 size={16} className="text-primary animate-spin" />
                    )}
                    {uploadStatus[fileObj.uid] === STATUS.COMPLETED && (
                      <Check size={16} className="text-green-500" />
                    )}
                    {uploadStatus[fileObj.uid] === STATUS.ERROR && (
                      <AlertCircle size={16} className="text-red-500" />
                    )}
                    {(uploadStatus[fileObj.uid] === STATUS.PENDING ||
                      uploadStatus[fileObj.uid] === STATUS.ERROR) &&
                      !isUploading && (
                        <button
                          onClick={() => removeFile(fileObj.uid)}
                          className="cursor-pointer text-text-muted hover:text-red-500 transition-colors"
                        >
                          <X size={16} />
                        </button>
                      )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="flex justify-end gap-4">
          <button
            onClick={handleClose}
            disabled={isUploading}
            className="py-2.5 px-5 rounded-xl font-normal text-sm transition-all bg-bg-hover text-text-muted hover:text-text-main cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {completedCount === totalCount && totalCount > 0 ? "Done" : "Cancel"}
          </button>
          <button
            onClick={handleUpload}
            disabled={selectedFiles.length === 0 || isUploading || completedCount === totalCount}
            className="py-2.5 px-5 rounded-xl font-medium text-sm transition-all bg-primary text-white hover:bg-primary-hover shadow-lg shadow-primary/20 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
          >
            {isUploading ? "Uploading..." : "Upload Files"}
          </button>
        </div>
      </div>
    </Modal>
  );
};

export default UploadFileModal;
