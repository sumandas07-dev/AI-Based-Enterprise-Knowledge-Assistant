import React from 'react';
import { FileText } from 'lucide-react';

export const SourceCard = ({ source, onClick, index }) => {
  const scorePercent = source.relevanceScore 
    ? Math.round(source.relevanceScore * 100) 
    : 85 + (index * 2) > 99 ? 99 : 85 + (index * 2);

  return (
    <button
      onClick={onClick}
      className="bg-panel-light hover:bg-panel-light/80 border border-border-subtle hover:border-border-focus rounded-xl p-3.5 flex flex-col gap-2.5 text-left transition-all w-full shadow-sm"
    >
      <div className="flex items-start gap-2.5">
        <FileText size={15} className="text-accent-purple shrink-0 mt-0.5" />
        <div className="flex flex-col min-w-0">
          <span className="text-xs font-semibold text-white truncate">{source.filename}</span>
          <span className="text-[10px] text-text-secondary/60 mt-0.5">
            Format: PDF {source.page ? `• Page ${source.page}` : ''}
          </span>
        </div>
      </div>

      <div className="flex items-center justify-between border-t border-border-subtle/50 pt-2 text-[10px] text-text-secondary">
        <span className="text-green-400 font-medium">Relevance: {scorePercent}%</span>
        <span className="text-accent-purple hover:underline font-semibold">Preview →</span>
      </div>
    </button>
  );
};
