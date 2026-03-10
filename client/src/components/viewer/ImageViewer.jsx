import { motion } from "framer-motion";

const ImageViewer = ({ url, name }) => (
  <div className="relative group max-w-[90vw] max-h-[80vh]">
    <motion.img
      initial={{ scale: 0.9, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      src={url}
      alt={name}
      loading="lazy"
      className="w-full h-full object-contain rounded-2xl shadow-[0_0_100px_rgba(0,0,0,0.5)] border border-white/10 select-none pointer-events-none"
    />
  </div>
);

export default ImageViewer;

