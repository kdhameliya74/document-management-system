import { ExternalLink } from "lucide-react";

const PdfViewer = ({ url, name }) => (
  <div className="w-full h-full max-w-[1200px] max-h-[90vh] bg-neutral-900 rounded-[2.5rem] overflow-hidden flex flex-col shadow-3xl border border-white/10 relative">
    <iframe
      src={`${url}#toolbar=0`}
      title={name}
      className="w-full flex-1 border-none bg-white"
    />
    <div className="absolute top-4 right-4 z-50 flex gap-2">
      <button
        onClick={() => window.open(url, "_blank")}
        className="p-3 bg-black/60 backdrop-blur-md text-white/80 hover:text-white rounded-2xl border border-white/10 transition-all hover:bg-black/80 cursor-pointer"
        title="Fullscreen"
      >
        <ExternalLink size={18} />
      </button>
    </div>
  </div>
);

export default PdfViewer;