import React from "react";
import { Compass, Home } from "lucide-react";
import { useNavigate } from "react-router-dom";
import ROUTES from "@/shared/utils/routes";
import { motion } from "framer-motion";

const PageNotFound = () => {
  const navigate = useNavigate();

  const onGoHome = () => {
    navigate(ROUTES.APP.FOLDERS);
  };

  return (
    <div className="w-screen h-screen flex flex-col items-center justify-center bg-[#09090b] text-text-muted text-center p-10 overflow-hidden relative">
      {/* Background Glows */}
      <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-primary/10 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] bg-indigo-500/5 blur-[120px] rounded-full pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="relative z-10"
      >
        <div className="w-[200px] h-[200px] bg-bg-panel/40 backdrop-blur-3xl rounded-[3rem] flex items-center justify-center mb-10 mx-auto border border-white/5 shadow-2xl relative group">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
            className="absolute inset-0 p-8 opacity-20"
          >
            <Compass size="100%" className="text-primary" />
          </motion.div>

          <Compass
            size={100}
            className="text-primary/80 relative z-10 drop-shadow-[0_0_15px_rgba(99,102,241,0.3)]"
            strokeWidth={1.2}
          />

          <div className="absolute -top-4 -right-4 px-6 py-2 bg-primary text-white text-3xl font-black rounded-2xl shadow-xl shadow-primary/30 rotate-12">
            404
          </div>
        </div>

        <h1 className="text-5xl font-black text-text-main mb-6 tracking-tighter">Lost in Space?</h1>

        <p className="max-w-[420px] mx-auto text-text-dim text-lg font-medium leading-relaxed mb-12">
          The page you're searching for seems to have vanished into a black hole or never existed in
          the first place.
        </p>

        <div className="flex gap-5 justify-center">
          <button
            onClick={onGoHome}
            className="group flex items-center gap-3 py-4 px-10 rounded-2xl cursor-pointer font-black text-white bg-primary text-sm uppercase tracking-widest shadow-2xl shadow-primary/40 transition-all hover:bg-primary-hover hover:-translate-y-1 active:translate-y-0"
          >
            <Home
              size={18}
              strokeWidth={2.5}
              className="group-hover:scale-110 transition-transform"
            />
            <span>Return to Mission Control</span>
          </button>
        </div>
      </motion.div>

      <div className="absolute bottom-10 text-[10px] font-black uppercase tracking-[0.5em] text-text-dim/30">
        CloudDocs Error Protocol 404 // Access Denied
      </div>
    </div>
  );
};

export default PageNotFound;
