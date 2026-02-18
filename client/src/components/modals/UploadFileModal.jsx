import React, { useState } from "react";
import { useDispatch } from "react-redux";
import { Upload, X, Loader2, Check, AlertCircle } from "lucide-react";
import { fetchDocuments } from "@/store/documentSystemSlice";
import Modal from "@/components/common/Modal";
import fileSystemAPI from "@/services/fileSystemService";
import { logError, uuidToBase64 } from "@/helpers/utils";

const CHUNK_SIZE = 3;

const UploadFileModal = ({ isOpen, onClose, currentFolderId }) => {
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [isUploading, setIsUploading] = useState(false);
  const dispatch = useDispatch();

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    const newFiles = files.map((file) => ({
      file,
      id: Math.random().toString(36).substr(2, 9),
      name: file.name,
      size: file.size,
      type: file.type,
      status: "pending", // pending, uploading, completed, error
      progress: 0,
    }));
    setSelectedFiles((prev) => [...prev, ...newFiles]);
  };

  const removeFile = (id) => {
    if (isUploading) return;
    setSelectedFiles((prev) => prev.filter((f) => f.id !== id));
  };

  const uploadFile = async (fileObj) => {
    setSelectedFiles((prev) =>
      prev.map((f) => (f.id === fileObj.id ? { ...f, status: "uploading" } : f)),
    );

    try {

      // 2. Upload to S3
      await axios.put(uploadUrl, fileObj.file, {
        headers: {
          "Content-Type": fileObj.type,
        },
        onUploadProgress: (progressEvent) => {
          const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          setSelectedFiles((prev) =>
            prev.map((f) => (f.id === fileObj.id ? { ...f, progress } : f)),
          );
        },
      });

      setSelectedFiles((prev) =>
        prev.map((f) => (f.id === fileObj.id ? { ...f, status: "completed", progress: 100 } : f)),
      );
    } catch (error) {
      logError(error);
    }
  };

  const handleUpload = async () => {
    if (selectedFiles.length === 0 || isUploading) return;

    const filesObj = selectedFiles.map((file) => ({uid:uuidToBase64(crypto.randomUUID()), fileName: file.name, fileType: file.type }));

    try {
      setIsUploading(true);
      const response = await fileSystemAPI.getPresignedUrls(filesObj);
      if(response?.success){
        const {successfulUploads, failedUploads} = response?.data;
        if(successfulUploads) {
          const filesMetadata = [];
          for (let i = 0; i < successfulUploads.length; i += CHUNK_SIZE) {
            const chunk = successfulUploads.slice(i, i + CHUNK_SIZE);
            await Promise.all(chunk.map((fileObj) => uploadFile(fileObj)));
          }
        }
      }
    } catch (error) {
      logError(error)
    } finally {
      setIsUploading(false);
    }


    // const CHUNK_SIZE = 3; // Concurrent uploads
    // const pendingFiles = selectedFiles.filter(
    //   (f) => f.status === "pending" || f.status === "error",
    // );

    // for (let i = 0; i < pendingFiles.length; i += CHUNK_SIZE) {
    //   const chunk = pendingFiles.slice(i, i + CHUNK_SIZE);
    //   await Promise.all(chunk.map((fileObj) => uploadFile(fileObj)));
    // }
  };

  const handleClose = () => {
    if (isUploading) return;
    setSelectedFiles([]);
    setIsUploading(false);
    onClose();
  };

  const completedCount = selectedFiles.filter((f) => f.status === "completed").length;
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
                  key={fileObj.id}
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
                    {fileObj.status === "uploading" && (
                      <Loader2 size={16} className="text-primary animate-spin" />
                    )}
                    {fileObj.status === "completed" && (
                      <Check size={16} className="text-green-500" />
                    )}
                    {fileObj.status === "error" && (
                      <AlertCircle size={16} className="text-red-500" />
                    )}
                    {(fileObj.status === "pending" || fileObj.status === "error") &&
                      !isUploading && (
                        <button
                          onClick={() => removeFile(fileObj.id)}
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
