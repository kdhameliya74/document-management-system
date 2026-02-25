import { FolderPlus } from "lucide-react";

const EmptyFolderScreen = ({ setActiveModal }) => {
  return (
    <div className="flex-1 flex flex-col items-center justify-center text-text-muted text-center p-12 animate-in fade-in zoom-in-95 duration-700">
      <div className="w-[180px] h-[180px] bg-bg-panel/40 rounded-[3rem] flex items-center justify-center mb-10 text-text-muted/20 border border-border-main shadow-inner relative group">
        <div className="absolute inset-0 bg-primary/5 blur-3xl rounded-full opacity-50 group-hover:bg-primary/10 transition-colors" />
        <FolderPlus
          size={80}
          className="text-primary/30 relative z-10 group-hover:scale-110 transition-transform duration-500"
          strokeWidth={1.5}
        />
        <div className="absolute -bottom-2 -right-2 w-12 h-12 bg-bg-hover rounded-2xl flex items-center justify-center border border-border-main shadow-lg text-primary animate-bounce">
          <FolderPlus size={20} strokeWidth={2.5} />
        </div>
      </div>

      <h3 className="text-3xl font-black text-text-main mb-3 tracking-tight">
        Your Drive is Empty
      </h3>
      <p className="max-w-[320px] text-text-dim text-sm font-medium leading-relaxed mb-10">
        Start by uploading your first file or create a organized folder structure to get things
        moving.
      </p>

      <div className="flex gap-5">
        <button
          onClick={(e) => {
            e.stopPropagation();
            setActiveModal("upload");
          }}
          className="py-3.5 px-8 rounded-2xl cursor-pointer font-bold bg-primary text-white text-sm shadow-xl shadow-primary/20 transition-all hover:bg-primary-hover hover:-translate-y-1 active:translate-y-0"
        >
          Upload File
        </button>
        <button
          onClick={(e) => {
            e.stopPropagation();
            setActiveModal("createFolder");
          }}
          className="py-3.5 px-8 rounded-2xl cursor-pointer font-bold bg-bg-panel text-text-main text-sm border border-border-main transition-all hover:bg-bg-hover hover:-translate-y-1 active:translate-y-0"
        >
          Create Folder
        </button>
      </div>
    </div>
  );
};

export default EmptyFolderScreen;
