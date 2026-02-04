import { FolderPlus } from "lucide-react";

const EmptyFolderScreen = ({ setActiveModal }) => {
  return (
    <div className="flex-1 flex flex-col items-center justify-center text-text-muted text-center">
      <div className="w-[120px] h-[120px] bg-bg-panel rounded-full flex items-center justify-center mb-6 text-text-muted/30 border border-border-muted">
        <FolderPlus size={64} className="text-primary/50" />
      </div>
      <h3 className="text-xl font-normal text-text-main mb-2">This folder is empty</h3>
      <p>Upload files or create a new folder to get started</p>
      <div className="flex gap-4 mt-6">
        <button
          onClick={(e) => {
            e.stopPropagation();
            setActiveModal("upload");
          }}
          className="py-2 px-4 rounded-lg cursor-pointer font-medium transition-all hover:-translate-y-px hover:shadow-lg bg-primary text-white text-sm"
        >
          Upload File
        </button>
        <button
          onClick={(e) => {
            e.stopPropagation();
            setActiveModal("createFolder");
          }}
          className="py-2 px-4 rounded-lg cursor-pointer font-medium border border-border-muted transition-all hover:bg-bg-hover bg-bg-panel text-text-main text-sm"
        >
          Create Folder
        </button>
      </div>
    </div>
  );
};

export default EmptyFolderScreen;
