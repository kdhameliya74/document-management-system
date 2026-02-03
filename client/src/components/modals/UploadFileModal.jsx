import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import { Upload } from 'lucide-react';
import { addFile } from '@/store/fileSystemSlice';
import Modal from '@/components/common/Modal';

const UploadFileModal = ({ isOpen, onClose, currentFolderId }) => {
  const [uploadFile, setUploadFile] = useState(null);
  const dispatch = useDispatch();

  const handleUpload = () => {
    if (uploadFile) {
      dispatch(addFile({
        name: uploadFile.name,
        type: uploadFile.type,
        size: uploadFile.size,
        parentId: currentFolderId,
        url: URL.createObjectURL(uploadFile)
      }));
      setUploadFile(null);
      onClose();
    }
  };

  const handleClose = () => {
    setUploadFile(null);
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Upload File">
      <div className="flex flex-col gap-6">
        <div className="border-2 border-dashed border-border-muted rounded-2xl p-10 text-center relative cursor-pointer transition-all hover:border-primary hover:bg-primary/5 group">
          <input 
            type="file" 
            onChange={(e) => setUploadFile(e.target.files[0])}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          />
          <div className="flex flex-col items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-bg-hover flex items-center justify-center text-text-muted group-hover:text-primary transition-colors">
              <Upload size={24} />
            </div>
            <div className="text-text-main font-medium">
              {uploadFile ? uploadFile.name : 'Click to select or drag file here'}
            </div>
            {!uploadFile && <div className="text-text-muted text-sm">Support for all file types</div>}
          </div>
        </div>
        <div className="flex justify-end gap-4">
          <button 
            onClick={handleClose} 
            className="py-2.5 px-5 rounded-xl font-normal text-sm transition-all bg-bg-hover text-text-muted hover:text-text-main cursor-pointer"
          >
            Cancel
          </button>
          <button 
            onClick={handleUpload} 
            disabled={!uploadFile} 
            className="py-2.5 px-5 rounded-xl font-medium text-sm transition-all bg-primary text-white hover:bg-primary-hover shadow-lg shadow-primary/20 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
          >
            Upload File
          </button>
        </div>
      </div>
    </Modal>
  );
};

export default UploadFileModal;
