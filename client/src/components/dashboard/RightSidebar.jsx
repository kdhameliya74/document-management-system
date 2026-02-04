import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { FileText, Folder, Download, Trash2, Share2, Clock, Info, User, X } from 'lucide-react';
import { deleteItem, setShowDetails } from '@/store/documentSystemSlice';
import { format } from 'date-fns';

const RightSidebar = () => {
  const dispatch = useDispatch();
  const { documents, files, currentFolderId, selectedId, showDetails } = useSelector((state) => state.documentSystem);
  const { user } = useSelector((state) => state.auth);
  
  const currentFolder = documents[currentFolderId];
  const selectedItem = selectedId ? (documents[selectedId] || files[selectedId]) : currentFolder;
  
  const [showDeleteModal, setShowDeleteModal] = React.useState(false);

  // Only show if showDetails is true AND we have an item to show
  if (!showDetails || !selectedItem) return null;

  const isFolder = !!documents[selectedItem.id];
  const type = isFolder ? 'folder' : 'file';

  const handleDelete = () => {
    dispatch(deleteItem({
      id: selectedItem.id,
      type,
      parentId: selectedItem.parentId
    }));
    setShowDeleteModal(false);
    dispatch(setShowDetails(false));
  };

  return (
    <>
      <div className="w-[300px] bg-bg-panel border-l border-border-muted flex flex-col p-6 h-full overflow-y-auto relative text-text-main">
        <button 
          onClick={() => dispatch(setShowDetails(false))}
          className="absolute top-4 right-4 text-text-muted hover:text-text-main transition-colors cursor-pointer"
        >
          <X size={20} />
        </button>

        <div className="mb-8 mt-2">
          <h3 className="text-lg font-normal">{isFolder ? 'Folder Details' : 'File Details'}</h3>
        </div>

        <div className="flex flex-col items-center mb-8 text-center">
          <div className="w-[100px] h-[100px] bg-bg-main rounded-xl flex items-center justify-center mb-4 border border-border-muted">
            {isFolder ? (
              <Folder size={64} fill="#6366f1" color="#4f46e5" strokeWidth={1} />
            ) : (
              <FileText size={64} color="#94a3b8" />
            )}
          </div>
          <h4 className="text-base font-normal mb-1 break-words">{selectedItem.name}</h4>
          <span className="text-sm text-text-muted">{isFolder ? 'Folder' : selectedItem.type}</span>
        </div>

        <div className="flex flex-col gap-3 mb-8 pb-8 border-b border-border-muted">
          <button className="flex items-center gap-3 p-2 border border-border-muted rounded-lg font-medium text-sm transition-all bg-bg-main hover:bg-bg-hover hover:border-primary cursor-pointer">
            <Download size={16} />
            <span>Download</span>
          </button>
          <button className="flex items-center gap-3 p-2 border border-border-muted rounded-lg font-medium text-sm transition-all bg-bg-main hover:bg-bg-hover hover:border-primary cursor-pointer">
            <Share2 size={16} />
            <span>Share</span>
          </button>
          {selectedItem.id !== 'root' && (
            <button className="flex items-center gap-3 p-2 border border-border-muted rounded-lg font-medium text-sm transition-all bg-bg-main hover:bg-red-500/10 hover:border-red-500/50 hover:text-red-500 cursor-pointer" onClick={() => setShowDeleteModal(true)}>
              <Trash2 size={16} />
              <span>Delete</span>
            </button>
          )}
        </div>

        <div className="flex flex-col gap-6">
          <div className="flex gap-4 items-start text-text-muted">
            <Info size={16} />
            <div className="flex flex-col gap-1">
              <span className="text-xs font-normal uppercase tracking-wider text-text-muted/60">Type</span>
              <span className="text-sm text-text-main">{isFolder ? 'Folder' : selectedItem.type}</span>
            </div>
          </div>
          
          {!isFolder && (
            <div className="flex gap-4 items-start text-text-muted">
              <Info size={16} />
              <div className="flex flex-col gap-1">
                <span className="text-xs font-normal uppercase tracking-wider text-text-muted/60">Size</span>
                <span className="text-sm text-text-main">{selectedItem.size ? `${(selectedItem.size / 1024).toFixed(2)} KB` : 'Unknown'}</span>
              </div>
            </div>
          )}

          <div className="flex gap-4 items-start text-text-muted">
            <Clock size={16} />
            <div className="flex flex-col gap-1">
              <span className="text-xs font-normal uppercase tracking-wider text-text-muted/60">Created</span>
              <span className="text-sm text-text-main">
                {selectedItem.createdAt ? format(new Date(selectedItem.createdAt), 'MMM d, yyyy') : 'Unknown'}
              </span>
            </div>
          </div>

          <div className="flex gap-4 items-start text-text-muted">
            <User size={16} />
            <div className="flex flex-col gap-1">
              <span className="text-xs font-normal uppercase tracking-wider text-text-muted/60">Owner</span>
              <span className="text-sm text-text-main">{user?.name || 'Me'}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Delete Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[2000]">
          <div className="bg-bg-panel border border-border-muted rounded-xl w-full max-w-[400px] p-6 shadow-2xl">
            <h3 className="text-lg font-normal mb-4 text-text-main">Delete Item</h3>
            <p className="text-text-muted mb-6">Are you sure you want to delete "{selectedItem.name}"?</p>
            <div className="flex justify-end gap-4">
              <button onClick={() => setShowDeleteModal(false)} className="py-2 px-4 rounded-lg font-medium text-sm transition-all bg-bg-hover text-text-main hover:bg-bg-hover/80 cursor-pointer">Cancel</button>
              <button onClick={handleDelete} className="py-2 px-4 rounded-lg font-medium text-sm transition-all bg-red-500 text-white hover:bg-red-600 cursor-pointer">Delete</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default RightSidebar;
