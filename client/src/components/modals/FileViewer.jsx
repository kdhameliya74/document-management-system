import React from "react";
import { X, Download, Maximize2, Minimize2, Music, ExternalLink } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const FileViewer = ({ isOpen, onClose, file }) => {
  if (!isOpen || !file) return null;
  const renderContent = () => {
    const { mimeType, previewUrl, url, name } = file;
    const contentUrl = previewUrl || url;

    if (!contentUrl) {
      return (
        <div className="bg-bg-panel/20 backdrop-blur-xl p-12 rounded-[3.5rem] border border-white/5 flex flex-col items-center gap-6 text-center max-w-md shadow-3xl">
          <div className="w-24 h-24 bg-red-400/10 rounded-[2rem] flex items-center justify-center text-red-400 mb-2">
            <X size={48} strokeWidth={1.5} />
          </div>
          <div>
            <h3 className="text-2xl font-black text-white mb-2 leading-tight">Missing Preview URL</h3>
            <p className="text-white/40 font-medium px-4 leading-relaxed">
              We couldn't locate the media source for <span className="text-white/70 italic">"{name}"</span>. 
              The server might still be processing this upload.
            </p>
          </div>
          <button
            onClick={onClose}
            className="mt-4 px-8 py-3.5 bg-white/10 hover:bg-white/20 text-white rounded-2xl transition-all font-bold text-sm tracking-wide border border-white/5"
          >
           Return to Drive
          </button>
        </div>
      );
    }

    if (mimeType?.startsWith("image/")) {
      return (
        <div className="relative group max-w-[90vw] max-h-[80vh]">
           <motion.img
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            src={contentUrl}
            alt={name}
            className="w-full h-full object-contain rounded-2xl shadow-[0_0_100px_rgba(0,0,0,0.5)] border border-white/10 select-none pointer-events-none"
          />
          <div className="absolute inset-x-0 bottom-0 p-6 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity rounded-b-2xl">
             <p className="text-white/80 text-xs font-bold text-center tracking-widest uppercase">Image Preview</p>
          </div>
        </div>
      );
    }

    if (mimeType?.startsWith("video/")) {
      console.log("video")
      return (
        <div className="w-full max-w-5xl aspect-video rounded-3xl overflow-hidden shadow-[0_0_120px_rgba(0,0,0,0.6)] border border-white/10 bg-black">
          <video
            src={contentUrl}
            controls
            autoPlay
            className="w-full h-full"
          />
        </div>
      );
    }

    if (mimeType?.startsWith("audio/")) {
      return (
        <div className="w-full max-w-lg bg-white/5 backdrop-blur-2xl border border-white/10 p-12 rounded-[4rem] shadow-3xl flex flex-col items-center gap-10 group relative overflow-hidden">
            {/* Animated background elements */}
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-primary/50 to-transparent opacity-30 shadow-[0_0_20px_#4f46e5]" />
            
            <motion.div 
               animate={{ 
                  scale: [1, 1.05, 1],
                  rotate: [0, 5, -5, 0]
               }}
               transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
               className="w-40 h-40 bg-gradient-to-br from-primary/20 to-primary/5 rounded-[3rem] flex items-center justify-center text-primary shadow-2xl relative z-10"
            >
                <Music size={80} strokeWidth={1.5} className="drop-shadow-[0_0_15px_rgba(79,70,229,0.5)]" />
                 {/* Radial Glow */}
                 <div className="absolute inset-0 bg-primary/20 blur-[50px] -z-10 rounded-full" />
            </motion.div>

            <div className="text-center relative z-10">
                <h3 className="text-2xl font-black text-white mb-2 leading-none">{name}</h3>
                <p className="text-primary/70 font-black uppercase tracking-[0.2em] text-[10px]">Now Playing</p>
            </div>

            <audio src={contentUrl} controls autoPlay className="w-full relative z-10 brightness-110 contrast-125" />
        </div>
      );
    }

    if (mimeType === "application/pdf") {
      return (
        <div className="w-full h-full max-w-[1200px] max-h-[90vh] bg-neutral-900 rounded-[2.5rem] overflow-hidden flex flex-col shadow-3xl border border-white/10 relative">
          <iframe
            src={`${contentUrl}#toolbar=0`}
            title={name}
            className="w-full flex-1 border-none bg-white"
          />
          <div className="absolute top-4 right-4 z-50 flex gap-2">
             <button 
                onClick={() => window.open(contentUrl, '_blank')}
                className="p-3 bg-black/60 backdrop-blur-md text-white/80 hover:text-white rounded-2xl border border-white/10 transition-all hover:bg-black/80"
                title="Fullscreen"
             >
                <ExternalLink size={18} />
             </button>
          </div>
        </div>
      );
    }

    return (
      <div className="bg-white/5 backdrop-blur-xl p-16 rounded-[4rem] border border-white/10 flex flex-col items-center gap-8 text-center max-w-xl shadow-3xl overflow-hidden relative">
        <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent pointer-events-none" />
        <div className="w-24 h-24 bg-white/10 rounded-[2.5rem] flex items-center justify-center text-white/40">
           <Maximize2 size={48} strokeWidth={1} />
        </div>
        <div>
            <h3 className="text-2xl font-black text-white mb-3">Preview Not Supported</h3>
            <p className="text-white/40 font-medium px-8 leading-relaxed">
             We don't support online viewing for <span className="text-white/80 italic">.{mimeType?.split('/')[1] || 'this'}</span> files yet. 
             But you can still download it to your device.
            </p>
        </div>
        <div className="flex gap-4 relative z-10">
            <button
                className="px-8 py-4 bg-primary text-white rounded-2xl hover:scale-105 transition-all font-black text-sm tracking-widest uppercase shadow-xl shadow-primary/20 flex items-center gap-2"
                onClick={() => window.open(contentUrl, "_blank")}
            >
                <Download size={18} />
                Download Now
            </button>
        </div>
      </div>
    );
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[2000] flex flex-col overflow-hidden">
        {/* Deep Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 bg-black/80 backdrop-blur-sm"
          onClick={onClose}
        />

        {/* Dynamic Background Accents */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
            <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/5 blur-[150px] rounded-full" />
            <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-indigo-500/5 blur-[150px] rounded-full" />
        </div>

        {/* Premium Header */}
        <motion.div
          initial={{ y: -50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="relative z-20 flex items-center justify-between px-8 py-6"
        >
          <div className="flex items-center gap-6">
             <button 
                onClick={onClose}
                className="p-4 bg-white/5 text-white/40 hover:text-white hover:bg-white/10 rounded-2xl transition-all border border-white/5 group"
             >
                <X size={20} className="group-hover:rotate-90 transition-transform duration-300" />
             </button>
             <div className="flex flex-col">
                <h2 className="text-lg font-black text-white tracking-tight truncate max-w-[200px] md:max-w-xl leading-none mb-1">
                  {file.name}
                </h2>
                <span className="text-[10px] text-white/30 font-black uppercase tracking-[0.2em]">
                    {file.mimeType} • File Viewer
                </span>
             </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => window.open(file.url || file.previewUrl, "_blank")}
              className="px-6 py-3 bg-white/5 text-white/70 hover:text-white hover:bg-white/10 rounded-2xl transition-all font-bold text-sm border border-white/5 flex items-center gap-2.5"
              title="Download"
            >
              <Download size={18} />
              <span className="hidden sm:inline">Download</span>
            </button>
          </div>
        </motion.div>

        {/* Content Area */}
        <motion.div
          initial={{ opacity: 0, scale: 0.98, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ type: "spring", damping: 25, stiffness: 200 }}
          className="relative z-10 flex-1 flex items-center justify-center p-6 md:p-12 overflow-hidden"
        >
          {renderContent()}
        </motion.div>

        {/* Bottom Metadata Bar */}
        <div className="relative z-20 px-12 py-8 flex justify-center opacity-0 hover:opacity-100 transition-opacity duration-500">
             <div className="bg-black/40 backdrop-blur-md px-6 py-2 rounded-full border border-white/5 flex items-center gap-4">
                 <div className="flex items-center gap-2">
                     <span className="text-[10px] font-black text-white/40 uppercase tracking-widest">Size</span>
                     <span className="text-[10px] font-black text-white/80 uppercase tracking-widest">{file.size ? (file.size / 1024).toFixed(2) + ' KB' : 'N/A'}</span>
                 </div>
                 <div className="w-px h-3 bg-white/10" />
                 <div className="flex items-center gap-2">
                     <span className="text-[10px] font-black text-white/40 uppercase tracking-widest">Type</span>
                     <span className="text-[10px] font-black text-white/80 uppercase tracking-widest">{file.extension || 'Document'}</span>
                 </div>
             </div>
        </div>
      </div>
    </AnimatePresence>
  );
};

export default FileViewer;
