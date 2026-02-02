import React from 'react';
import { FileText, Image, File, Video } from 'lucide-react';
import { truncateFileName } from '@/helpers/utils.js';

const getFileIcon = (type) => {
  if (type.startsWith('image/')) return <Image size={40} className="text-violet-500" />;
  if (type.startsWith('video/')) return <Video size={40} className="text-red-500" />;
  if (type === 'application/pdf') return <FileText size={40} className="text-orange-500" />;
  return <File size={40} className="text-slate-500" />;
};

const FileItem = ({ file, isSelected, onSelect, onContextMenu }) => {

  const displayName = truncateFileName(file.name);

  return (
    <div 
      className={`flex flex-col items-center gap-2 p-4 rounded-2xl cursor-pointer transition-all group border-2 ${
        isSelected 
          ? 'bg-primary/10 border-primary/40 shadow-lg shadow-primary/10' 
          : 'border-transparent hover:bg-bg-hover hover:border-border-muted'
      }`}
      onClick={(e) => { e.stopPropagation(); onSelect(file.id); }}
      onContextMenu={(e) => onContextMenu(e, file, 'file')}
      title={file.name}
    >
      <div className="p-2 rounded-xl bg-bg-panel border border-border-muted group-hover:border-primary/30 transition-colors">
        {React.cloneElement(getFileIcon(file.type), { size: 48, strokeWidth: 1.5 })}
      </div>
      <span className={`text-sm text-center break-all line-clamp-2 px-1 ${
        isSelected ? 'text-primary' : 'text-text-main'
      }`}>
        {displayName}
      </span>
      <span className="text-[10px] text-text-muted uppercase tracking-wider">
        {file.size ? `${(file.size / 1024).toFixed(1)} KB` : '--'}
      </span>
    </div>
  );
};

export default FileItem;
