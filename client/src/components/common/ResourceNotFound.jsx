import { FileQuestion } from "lucide-react";
import { useNavigate } from "react-router-dom";
import ROUTES from "@/utils/routes";

const ResourceNotFound = () => {
  const navigate = useNavigate();

  const onGoHome = () => {
    navigate(ROUTES.APP.FOLDERS);
  };

  return (
    <div className="w-full h-full flex flex-col items-center justify-center text-text-muted text-center p-10 animate-in fade-in zoom-in-95 duration-500">
      <div className="w-[160px] h-[160px] bg-bg-panel/50 rounded-[2.5rem] flex items-center justify-center mb-8 text-text-muted/20 border border-border-main shadow-inner relative group">
        <div className="absolute inset-0 bg-primary/5 blur-3xl rounded-full opacity-50" />
        <FileQuestion
          size={80}
          className="text-primary/40 relative z-10 group-hover:scale-110 transition-transform duration-500"
          strokeWidth={1.5}
        />
      </div>

      <h3 className="text-2xl font-black text-text-main mb-3 tracking-tight">Resource Not Found</h3>

      <p className="max-w-[300px] text-text-dim text-sm font-medium leading-relaxed">
        The file or folder you're looking for doesn't exist or was removed recently.
      </p>

      <div className="flex gap-4 mt-10">
        <button
          onClick={(e) => {
            e.stopPropagation();
            onGoHome();
          }}
          className="py-3 px-8 rounded-2xl cursor-pointer font-bold bg-primary text-white text-sm shadow-xl shadow-primary/20 transition-all hover:bg-primary-hover hover:-translate-y-1 active:translate-y-0"
        >
          Return to Safety
        </button>
      </div>
    </div>
  );
};

export default ResourceNotFound;
