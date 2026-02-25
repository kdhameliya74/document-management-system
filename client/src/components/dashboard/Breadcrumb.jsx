import React from "react";
import { ChevronRight, Home } from "lucide-react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import ROUTES from "@/utils/routes";
import { truncateFolderName } from "@/helpers/utils.js";

const Breadcrumb = ({ currentFolderId }) => {
  const navigate = useNavigate();
  const { documents } = useSelector((state) => state.documentSystem);

  const crumbs = React.useMemo(() => {
    const crumbs = [];
    let currentId = currentFolderId ?? "root";

    while (currentId && documents[currentId]) {
      crumbs.unshift(documents[currentId]);
      currentId = documents[currentId].parentId;
    }

    return crumbs;
  }, [currentFolderId, documents]);
  return (
    <nav className="flex items-center gap-1.5 text-sm overflow-x-auto whitespace-nowrap scrollbar-hide py-1">
      <button
        onClick={() => navigate(ROUTES.APP.FOLDERS)}
        className="p-2 hover:bg-bg-hover text-text-muted hover:text-text-main rounded-xl transition-all duration-200 cursor-pointer flex items-center shadow-sm"
      >
        <Home size={16} strokeWidth={2} />
      </button>

      {crumbs.map((crumb, index) => (
        <React.Fragment key={crumb.id}>
          <ChevronRight size={14} className="text-text-dim shrink-0 mx-0.5" strokeWidth={3} />
          <button
            onClick={() =>
              navigate(ROUTES.APP.FOLDER_DYNAMIC(crumb.id === "root" ? null : crumb.id))
            }
            className={`px-3 py-1.5 rounded-xl transition-all duration-200 cursor-pointer max-w-[180px] truncate font-medium ${
              index === crumbs.length - 1
                ? "text-primary bg-primary/10 shadow-sm shadow-primary/5"
                : "text-text-muted hover:bg-bg-hover hover:text-text-main"
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
