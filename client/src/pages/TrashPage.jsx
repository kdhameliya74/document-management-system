import React from 'react';
import { Trash2, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import ROUTES from '@/utils/routes';

const TrashPage = () => {
  const navigate = useNavigate();

  return (
    <div className="h-full flex flex-col">
      <div className="flex items-center gap-4 mb-8">
        <h2 className="text-2xl font-semibold text-slate-900">Trash</h2>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center text-slate-500 text-center -mt-20">
        <div className="w-[120px] h-[120px] bg-slate-100 rounded-full flex items-center justify-center mb-6 text-slate-300">
          <Trash2 size={64} />
        </div>
        <h3 className="text-xl font-semibold text-slate-900 mb-2">Trash is empty</h3>
        <p>Items moved to trash will appear here</p>
        <div className="mt-6">
          <button 
            onClick={() => navigate(ROUTES.DASHBOARD.FOLDER_ROOT)} 
            className="flex items-center gap-2 py-3 px-6 rounded-lg font-medium transition-all bg-primary text-white hover:bg-primary-hover shadow-md hover:shadow-lg"
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
