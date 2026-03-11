import React, { useEffect, useState } from "react";
import { X, Download, Maximize2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useDownloadDocument } from "@/hooks/useDownloadDocument";

import Loading from "@/components/common/Loading";
import ImageViewer from "@/components/viewer/ImageViewer";
import VideoViewer from "@/components/viewer/VideoViewer";
import AudioViewer from "@/components/viewer/AudioViewer";
import PdfViewer from "@/components/viewer/PdfViewer";
import { isViewableFile, getViewerType } from "@/helpers/utils";
import toast from "react-hot-toast";

const VIEWER_COMPONENTS = {
  image: ImageViewer,
  video: VideoViewer,
  audio: AudioViewer,
  pdf: PdfViewer,
};

const FileViewer = ({ isOpen, onClose, file }) => {
  const isViewable = isViewableFile(file?.mimeType);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [loading, setLoading] = useState(false);
  const { downloadFile, getFileUrl } = useDownloadDocument();

  if (!isOpen || !file) return null;

  const getURL = async () => {
    try {
      setLoading(true);
      const res = await getFileUrl(file.id);
      setPreviewUrl(res.url);
    } catch(err) {
      toast.error(err)
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    getURL();
  }, []);

  const viewerType = getViewerType(file?.mimeType);

  const renderContent = () => {
    if (!isViewable) {
      return (
        <div className="bg-white/5 backdrop-blur-xl p-16 rounded-[4rem] border border-white/10 flex flex-col items-center gap-8 text-center max-w-xl shadow-3xl overflow-hidden relative">
          <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent pointer-events-none" />
          <div className="w-24 h-24 bg-white/10 rounded-[2.5rem] flex items-center justify-center text-white/40">
            <Maximize2 size={48} strokeWidth={1} />
          </div>
          <div>
            <h3 className="text-2xl font-black text-white mb-3">Preview Not Supported</h3>
            <p className="text-white/40 font-medium px-8 leading-relaxed">
              We don't support online viewing for{" "}
              <span className="text-white/80 italic">
                .{file.mimeType?.split("/")[1] || "this"}
              </span>{" "}
              files yet. But you can still download it to your device.
            </p>
          </div>
          <div className="flex gap-4 relative z-10">
            <button
              className="px-8 py-4 bg-primary text-white rounded-2xl hover:scale-105 transition-all font-black text-sm tracking-widest uppercase shadow-xl shadow-primary/20 flex items-center gap-2 cursor-pointer"
              onClick={() => downloadFile({docId: file.id, force: true})}
            >
              <Download size={18} />
              Download Now
            </button>
          </div>
        </div>
      );
    }
    const ViewerComponent = VIEWER_COMPONENTS[viewerType];

    if (ViewerComponent && previewUrl) {
      return <ViewerComponent url={previewUrl} name={file.name} />;
    }

    return null;
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
              className="p-4 bg-white/5 text-white/40 hover:text-white hover:bg-white/10 rounded-2xl transition-all border border-white/5 group cursor-pointer"
            >
              <X size={20} className="group-hover:rotate-90 transition-transform duration-300" />
            </button>
            <div className="flex flex-col">
              <h2 className="text-lg font-black text-white tracking-tight truncate max-w-[200px] md:max-w-xl leading-none mb-1">
                {file.name}
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => downloadFile({ url: previewUrl })}
              className="px-6 py-3 bg-white/5 text-white/70 hover:text-white hover:bg-white/10 rounded-2xl transition-all font-bold text-sm border border-white/5 flex items-center gap-2.5 cursor-pointer"
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
          {loading ? <Loading text="Downloading..." /> : renderContent()}
        </motion.div>

        {/* Bottom Metadata Bar */}
        <div className="relative z-20 px-12 py-8 flex justify-center">
          <div className="bg-black/40 backdrop-blur-md px-6 py-2 rounded-full border border-white/5 flex items-center gap-4">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-black text-white/40 uppercase tracking-widest">
                Size
              </span>
              <span className="text-[10px] font-black text-white/80 uppercase tracking-widest">
                {file.size ? (file.size / 1024).toFixed(2) + " KB" : "N/A"}
              </span>
            </div>
            <div className="w-px h-3 bg-white/10" />
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-black text-white/40 uppercase tracking-widest">
                Type
              </span>
              <span className="text-[10px] font-black text-white/80 uppercase tracking-widest">
                {file.extension || "Document"}
              </span>
            </div>
          </div>
        </div>
      </div>
    </AnimatePresence>
  );
};

export default FileViewer;
