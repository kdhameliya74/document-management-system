import React from 'react';
import { Trash2, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import ROUTES from '@/utils/routes';

const TrashPage = () => {
  const navigate = useNavigate();

  return (
    <div className="h-full flex flex-col">
      <div className="flex items-center justify-between pb-4 border-b border-border-muted -mx-6 px-6">
        <h2 className="text-2xl font-medium text-text-main">Trash</h2>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center text-slate-500 text-center">
        <div className="w-[120px] h-[120px] rounded-full flex items-center justify-center mb-6 bg-bg-panel">
          <Trash2 size={64} className="text-primary/50"/>
        </div>
        <h3 className="text-xl font-normal text-text-main mb-2">Trash is empty</h3>
        <p>Items moved to trash will appear here</p>
        <div className="mt-6">
          <button 
            onClick={() => navigate(ROUTES.DASHBOARD.FOLDER_ROOT)} 
            className="flex cursor-pointer items-center gap-2 py-2 px-4 rounded-lg font-medium transition-all bg-primary text-white hover:bg-primary-hover shadow-md hover:shadow-lg"
          >
            <ArrowLeft size={18} />
            <span>Go to My Drive</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default TrashPage;
