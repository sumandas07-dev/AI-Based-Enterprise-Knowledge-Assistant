import React, { useEffect, useState } from 'react';
import { 
  Database, 
  Search, 
  FileText, 
  Loader, 
  BookOpen
} from 'lucide-react';
import { documentApi } from '../api/api';
import { Input } from '../components/common/Input';
import { EmptyState } from '../components/common/EmptyState';

export const Sources = () => {
  const [sources, setSources] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSources = async () => {
      setLoading(true);
      try {
        const data = await documentApi.getSources();
        setSources(data);
      } catch (err) {
        console.error('Failed to load sources list:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchSources();
  }, []);

  const filteredSources = sources.filter(src =>
    src.filename.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="h-full w-full overflow-y-auto bg-background p-6">
      <div className="max-w-4xl mx-auto flex flex-col gap-6">
        
        {/* Header Toolbar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border-subtle pb-5">
          <div className="flex flex-col">
            <h2 className="text-base font-bold text-white">Knowledge Source Files</h2>
            <p className="text-xs text-text-secondary mt-0.5 font-medium">Browse vector-indexed databases segmenting your queries.</p>
          </div>
          
          <div className="w-full sm:w-80 relative">
            <span className="absolute left-3 top-2.5 text-text-secondary/40">
              <Search size={14} />
            </span>
            <input
              type="text"
              placeholder="Search source indexes..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-panel-dark border border-border-subtle focus:border-border-focus text-xs text-text-primary placeholder:text-text-secondary/30 rounded-lg focus:outline-none transition-colors"
            />
          </div>
        </div>

        {/* Content list */}
        {loading ? (
          <div className="py-24 flex flex-col items-center justify-center gap-3">
            <Loader size={20} className="animate-spin text-accent-purple" />
            <span className="text-xs text-text-secondary font-medium">Mapping knowledge sources...</span>
          </div>
        ) : filteredSources.length === 0 ? (
          <EmptyState
            icon={Database}
            title={search ? "No matches found" : "No indexed sources"}
            description={search ? "Try searching for a different source filename." : "Upload documents in the Ingestion page to populate sources."}
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredSources.map((source) => (
              <div 
                key={source.id} 
                className="bg-panel-light border border-border-subtle hover:border-border-focus p-4.5 rounded-xl flex flex-col gap-3.5 shadow-sm transition-all"
              >
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-panel-secondary text-accent-purple rounded-lg shrink-0">
                    <FileText size={15} />
                  </div>
                  <div className="flex flex-col min-w-0">
                    <span className="text-xs font-semibold text-white truncate">{source.filename}</span>
                    <span className="text-[10px] text-text-secondary mt-0.5 font-medium">Format: PDF</span>
                  </div>
                </div>

                <div className="flex items-center justify-between border-t border-border-subtle/50 pt-3 text-[10px] text-text-secondary font-semibold">
                  <div className="flex items-center gap-3">
                    <span className="px-2 py-0.5 bg-panel-dark border border-border-subtle rounded text-accent-purple">
                      {source.pageCount || 10} pages
                    </span>
                    <span className="px-2 py-0.5 bg-panel-dark border border-border-subtle rounded text-green-400">
                      Relevance {Math.round((source.relevanceScore || 0.90) * 100)}%
                    </span>
                  </div>
                  <span className="text-[9px] uppercase font-bold tracking-wider text-text-secondary/50">Active Index</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
