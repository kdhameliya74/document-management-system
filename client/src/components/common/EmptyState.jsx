import React from "react";

const EmptyState = ({ 
  icon, 
  title, 
  description, 
  actions = [], 
  className = "" 
}) => {
  return (
    <div className={`flex-1 flex flex-col items-center justify-center text-text-muted text-center p-12 animate-in fade-in zoom-in-95 duration-700 ${className}`}>
      <div className="w-[180px] h-[180px] bg-bg-panel/40 rounded-[3rem] flex items-center justify-center mb-10 text-text-muted/20 border border-border-main shadow-inner relative group">
        <div className="absolute inset-0 bg-primary/5 blur-3xl rounded-full opacity-50 group-hover:bg-primary/10 transition-colors" />
        <div className="relative z-10 group-hover:scale-110 transition-transform duration-500 text-primary/30">
          {React.cloneElement(icon, { size: 80, strokeWidth: 1.5 })}
        </div>
        <div className="absolute -bottom-2 -right-2 w-12 h-12 bg-bg-hover rounded-2xl flex items-center justify-center border border-border-main shadow-lg text-primary animate-bounce">
          {React.cloneElement(icon, { size: 20, strokeWidth: 2.5 })}
        </div>
      </div>

      <h3 className="text-3xl font-black text-text-main mb-3 tracking-tight">
        {title}
      </h3>
      <p className="max-w-[400px] text-text-dim text-sm font-medium leading-relaxed mb-10">
        {description}
      </p>

      {actions.length > 0 && (
        <div className="flex flex-wrap justify-center gap-5">
          {actions.map((action, index) => (
            <button
              key={index}
              onClick={(e) => {
                e.stopPropagation();
                action.onClick();
              }}
              className={`py-3.5 px-8 rounded-2xl cursor-pointer font-bold text-sm transition-all hover:-translate-y-1 active:translate-y-0 ${
                action.variant === "secondary"
                  ? "bg-bg-panel text-text-main border border-border-main hover:bg-bg-hover"
                  : "bg-primary text-white shadow-xl shadow-primary/20 hover:bg-primary-hover"
              }`}
            >
              {action.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default EmptyState;
