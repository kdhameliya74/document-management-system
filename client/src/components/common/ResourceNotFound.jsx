import { FileQuestion } from "lucide-react";
import { useNavigate } from "react-router-dom";
import ROUTES from "@/utils/routes";

const ResourceNotFound = () => {
  const navigate = useNavigate();

  const onGoHome = () => {
    navigate(ROUTES.DASHBOARD.ROOT);
  };

  return (
    <div className="w-full h-full flex flex-col items-center justify-center text-text-muted text-center">
      <div className="w-[120px] h-[120px] bg-bg-panel rounded-full flex items-center justify-center mb-6 text-text-muted/30 border border-border-muted">
        <FileQuestion size={64} className="text-primary/50" />
      </div>

      <h3 className="text-xl font-normal text-text-main mb-2">
        Resource Not Found
      </h3>

      <p>The file or folder you’re looking for doesn’t exist or was removed.</p>

      <div className="flex gap-4 mt-6">
        <button
          onClick={(e) => {
            e.stopPropagation();
            onGoHome();
          }}
          className="py-2 px-4 rounded-lg cursor-pointer font-medium border border-border-muted transition-all hover:bg-bg-hover bg-bg-panel text-text-main text-sm"
        >
          Go Home
        </button>
      </div>
    </div>
  );
};

export default ResourceNotFound;