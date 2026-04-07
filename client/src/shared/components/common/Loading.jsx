const Loading = ({ text = "Loading..." }) => {
  return (
    <div className="absolute inset-0 bg-bg-main/50 backdrop-blur-[1px] z-10 flex flex-col items-center justify-center gap-4 transition-all animate-in fade-in duration-300">
      <div className="relative">
        <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div>
      </div>
      <div className="text-text-muted font-medium animate-pulse text-sm">{text}</div>
    </div>
  );
};

export default Loading;
