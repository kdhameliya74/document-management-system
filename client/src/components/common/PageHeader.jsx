import React from "react";

const PageHeader = ({ children, className = "" }) => {
  return <div className={`flex items-center justify-between mb-8 ${className}`}>{children}</div>;
};

const Left = ({ title, subtitle, children, className = "" }) => {
  return (
    <div className={className}>
      {title && (
        <h2 className="text-3xl font-bold text-text-main tracking-tight mb-1 h-9">{title}</h2>
      )}
      {subtitle && <p className="text-sm text-text-dim">{subtitle}</p>}
      {children}
    </div>
  );
};

const Middle = ({ children, className = "" }) => {
  return <div className={className}>{children}</div>;
};

const Right = ({ children, className = "" }) => {
  return <div className={`flex items-center gap-3 ${className}`}>{children}</div>;
};

PageHeader.Left = Left;
PageHeader.Right = Right;
PageHeader.Middle = Middle;

export default PageHeader;
