import React from 'react';
import { useDispatch } from 'react-redux';
import { deleteItem } from '@/store/fileSystemSlice';
import Modal from '@/components/common/Modal';

const DeleteModal = ({ isOpen, onClose, item, itemType, currentFolderId }) => {
  const dispatch = useDispatch();

  const handleDelete = () => {
    if (item) {
      dispatch(deleteItem({
        id: item.id,
        type: itemType,
        parentId: currentFolderId
      }));
      onClose();
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Delete Item">
      <div className="flex flex-col gap-6">
        <p className="text-text-main">Are you sure you want to delete <span className="font-medium text-primary">"{item?.name}"</span>? This action cannot be undone.</p>
        <div className="flex justify-end gap-4">
          <button 
            onClick={onClose} 
            className="py-2.5 px-5 rounded-xl font-normal text-sm transition-all bg-bg-hover text-text-muted hover:text-text-main cursor-pointer"
          >
            Cancel
          </button>
          <button 
            onClick={handleDelete} 
            className="py-2.5 px-5 rounded-xl font-medium text-sm transition-all bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white cursor-pointer"
          >
            Delete Item
          </button>
        </div>
      </div>
    </Modal>
  );
};

export default DeleteModal;
