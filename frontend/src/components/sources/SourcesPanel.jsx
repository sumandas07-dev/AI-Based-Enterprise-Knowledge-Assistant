import React from 'react';
import { FileText, X, AlertCircle, Sparkles } from 'lucide-react';
import { SourceCard } from './SourceCard';

export const SourcesPanel = ({
  sources,
  activeSource,
  onClearActive,
  onSelectSource,
  onViewAllSources
}) => {
  return (
    <div className="h-full bg-panel-dark border-l border-border-subtle flex flex-col overflow-hidden w-full lg:w-80 shadow-xl">
      {/* Header */}
      <div className="px-5 py-4 border-b border-border-subtle flex items-center justify-between shrink-0 bg-panel-dark">
        <div className="flex items-center gap-2">
          <FileText size={16} className="text-accent-purple" />
          <h3 className="font-semibold text-xs text-white">Retrieved Sources</h3>
        </div>
        {activeSource && (
          <button
            onClick={onClearActive}
            className="text-text-secondary hover:text-text-primary p-1 rounded hover:bg-panel-secondary"
            title="Show list"
          >
            <X size={15} />
          </button>
        )}
      </div>

      {/* Main Container */}
      <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-4">
        {activeSource ? (
          /* Detailed Single Source Preview Mode */
          <div className="flex flex-col gap-4 animate-fade-in">
            <div className="bg-panel-light p-4 rounded-xl border border-border-subtle flex flex-col gap-2 shadow-sm">
              <div className="flex items-center gap-2 text-white font-semibold text-xs">
                <FileText size={14} className="text-accent-purple" />
                <span className="truncate">{activeSource.filename}</span>
              </div>
              
              <div className="flex flex-wrap gap-2.5 mt-1 text-[10px] text-text-secondary">
                {activeSource.page && (
                  <span className="px-2 py-0.5 bg-panel-dark rounded border border-border-subtle">
                    Page: {activeSource.page}
                  </span>
                )}
                {activeSource.relevanceScore && (
                  <span className="px-2 py-0.5 bg-panel-dark rounded border border-border-subtle text-green-400">
                    Relevance: {Math.round(activeSource.relevanceScore * 100)}%
                  </span>
                )}
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <span className="text-[9px] font-bold text-accent-purple uppercase tracking-wider">
                Source Document Chunk
              </span>
              <div className="bg-panel-light/30 border border-border-subtle rounded-xl p-4 text-xs text-text-secondary leading-relaxed whitespace-pre-wrap shadow-inner">
                {activeSource.preview || "No chunk snippet text preview available."}
              </div>
            </div>
          </div>
        ) : sources.length > 0 ? (
          /* Sources List Mode */
          <div className="flex flex-col gap-3 animate-fade-in">
            <div className="flex items-center gap-1.5 text-[9px] font-bold text-accent-purple uppercase tracking-wider mb-1">
              <Sparkles size={10} />
              <span>{sources.length} Citations Available</span>
            </div>
            
            {sources.map((source, index) => (
              <SourceCard
                key={index}
                source={source}
                index={index}
                onClick={() => onSelectSource(source)}
              />
            ))}

            {onViewAllSources && (
              <button 
                onClick={onViewAllSources}
                className="w-full mt-2 text-center text-xs font-bold text-accent-purple hover:text-accent-purpleHover transition-colors py-2 border border-dashed border-border-subtle rounded-xl hover:bg-panel-light/20"
              >
                View all sources
              </button>
            )}
          </div>
        ) : (
          /* Empty State */
          <div className="flex flex-col items-center justify-center text-center py-24 text-text-secondary gap-3">
            <AlertCircle size={22} className="text-text-secondary/20" />
            <div className="flex flex-col">
              <span className="text-xs font-semibold text-white">No sources yet</span>
              <span className="text-[10px] text-text-secondary max-w-[180px] mt-1 leading-normal">
                Ask a question to see the RAG retrieval model in action.
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
