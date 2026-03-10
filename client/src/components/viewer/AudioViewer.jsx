import { motion } from "framer-motion";
import { Music } from "lucide-react";

const AudioViewer = ({ url, name }) => (
  <div className="w-full max-w-lg bg-white/5 backdrop-blur-2xl border border-white/10 p-12 rounded-[4rem] shadow-3xl flex flex-col items-center gap-10 group relative overflow-hidden">
    {/* Animated background elements */}
    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-primary/50 to-transparent opacity-30 shadow-[0_0_20px_#4f46e5]" />

    <motion.div
      animate={{
        scale: [1, 1.05, 1],
        rotate: [0, 5, -5, 0],
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
      <p className="text-primary/70 font-black uppercase tracking-[0.2em] text-[10px]">
        Now Playing
      </p>
    </div>

    <audio
      src={url}
      controls
      autoPlay
      className="w-full relative z-10 brightness-110 contrast-125"
    />
  </div>
);

export default AudioViewer;