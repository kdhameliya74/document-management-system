import React from 'react';
import { ChevronRight, Home } from 'lucide-react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import ROUTES from '@/utils/routes';
import { truncateFolderName } from '@/helpers/utils.js';

const Breadcrumb = ({ currentFolderId }) => {
  const navigate = useNavigate();
  const { folders } = useSelector((state) => state.fileSystem);

  const getBreadcrumbs = () => {
    const crumbs = [];
    let currentId = currentFolderId;

    while (currentId && folders[currentId]) {
      crumbs.unshift(folders[currentId]);
      currentId = folders[currentId].parentId;
    }

    return crumbs;
  };

  const crumbs = getBreadcrumbs();

  return (
    <nav className="flex items-center gap-1 text-sm text-text-muted my-2 overflow-x-auto whitespace-nowrap scrollbar-hide">
      <button 
        onClick={() => navigate(ROUTES.DASHBOARD.FOLDER_ROOT)}
        className="p-1 hover:bg-bg-hover hover:text-text-main rounded transition-colors cursor-pointer flex items-center"
      >
        <Home size={16} />
      </button>

      {crumbs.map((crumb, index) => (
        <React.Fragment key={crumb.id}>
          <ChevronRight size={14} className="text-border shrink-0" />
          <button
            onClick={() => navigate(ROUTES.DASHBOARD.FOLDER_DYNAMIC(crumb.id))}
            className={`px-2 py-1 rounded transition-colors cursor-pointer max-w-[150px] truncate ${
              index === crumbs.length - 1 
                ? 'text-text-main bg-primary/10' 
                : 'hover:bg-bg-hover hover:text-text-main'
            }`}
            title={crumb.name}
          >
            {truncateFolderName(crumb.name)}
          </button>
        </React.Fragment>
      ))}
    </nav>
  );
};

export default Breadcrumb;
