import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Search, 
  MessageSquare, 
  Trash2, 
  Edit3, 
  Calendar,
  ChevronRight,
  Loader,
  Check
} from 'lucide-react';
import { historyApi } from '../api/api';
import { EmptyState } from '../components/common/EmptyState';
import { Button } from '../components/common/Button';
import { Input } from '../components/common/Input';

export const History = () => {
  const navigate = useNavigate();
  const [history, setHistory] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [renamingId, setRenamingId] = useState(null);
  const [renamingTitle, setRenamingTitle] = useState('');

  const fetchHistory = async () => {
    setLoading(true);
    try {
      const data = await historyApi.getHistory();
      setHistory(data);
    } catch (err) {
      console.error('Failed to load history list:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  const handleDelete = async (e, id) => {
    e.stopPropagation(); // Avoid navigating into the conversation when clicking delete
    if (window.confirm('Are you sure you want to delete this chat session?')) {
      try {
        await historyApi.deleteConversation(id);
        setHistory(prev => prev.filter(c => c.id !== id));
      } catch (err) {
        console.error('Failed to delete history item:', err);
      }
    }
  };

  const startRename = (e, id, currentTitle) => {
    e.stopPropagation();
    setRenamingId(id);
    setRenamingTitle(currentTitle);
  };

  const saveRename = async (e, id) => {
    e.stopPropagation();
    if (!renamingTitle.trim()) return;

    try {
      await historyApi.renameConversation(id, renamingTitle.trim());
      setHistory(prev => prev.map(c => c.id === id ? { ...c, title: renamingTitle.trim() } : c));
      setRenamingId(null);
    } catch (err) {
      console.error('Failed to rename session:', err);
    }
  };

  // Grouped history
  const filteredHistory = history.filter(convo =>
    convo.title.toLowerCase().includes(search.toLowerCase())
  );

  // Grouping matches helper
  const groupedConvos = {
    'Today': filteredHistory.filter(c => c.group === 'Today'),
    'Yesterday': filteredHistory.filter(c => c.group === 'Yesterday'),
    'Previous 7 days': filteredHistory.filter(c => c.group === 'Previous 7 days' || !c.group)
  };

  const hasItems = filteredHistory.length > 0;

  return (
    <div className="h-full w-full overflow-y-auto bg-background p-6">
      <div className="max-w-4xl mx-auto flex flex-col gap-6">
        
        {/* Header toolbar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border-subtle pb-5">
          <div className="flex flex-col">
            <h2 className="text-base font-bold text-white">Chat History</h2>
            <p className="text-xs text-text-secondary mt-0.5">Manage and resume past conversational sessions.</p>
          </div>
          
          <div className="w-full sm:w-80 relative">
            <span className="absolute left-3 top-2.5 text-text-secondary/40">
              <Search size={14} />
            </span>
            <input
              type="text"
              placeholder="Search chat titles..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-panel-dark border border-border-subtle focus:border-border-focus text-xs text-text-primary placeholder:text-text-secondary/30 rounded-lg focus:outline-none transition-colors"
            />
          </div>
        </div>

        {/* List Content */}
        {loading ? (
          <div className="py-24 flex flex-col items-center justify-center gap-3">
            <Loader size={20} className="animate-spin text-accent-purple" />
            <span className="text-xs text-text-secondary font-medium">Fetching history...</span>
          </div>
        ) : !hasItems ? (
          <EmptyState
            icon={MessageSquare}
            title={search ? "No matches found" : "No chats yet"}
            description={search ? "Try refining your search terms." : "Start a new conversation thread from the sidebar."}
            action={
              !search && (
                <Button onClick={() => navigate('/dashboard')}>
                  New Chat Session
                </Button>
              )
            }
          />
        ) : (
          <div className="flex flex-col gap-6">
            {Object.entries(groupedConvos).map(([groupTitle, list]) => {
              if (list.length === 0) return null;

              return (
                <div key={groupTitle} className="flex flex-col gap-2.5">
                  <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-wider text-accent-purple">
                    <Calendar size={11} />
                    <span>{groupTitle}</span>
                  </div>

                  <div className="flex flex-col bg-panel-dark/30 border border-border-subtle rounded-xl overflow-hidden divide-y divide-border-subtle">
                    {list.map((convo) => (
                      <div
                        key={convo.id}
                        onClick={() => navigate(`/dashboard?c=${convo.id}`)}
                        className="group flex items-center justify-between p-4 hover:bg-panel-light/35 cursor-pointer transition-all"
                      >
                        <div className="flex items-center gap-3.5 flex-1 min-w-0 pr-4">
                          <div className="p-2 bg-panel-secondary text-text-secondary rounded-lg shrink-0 group-hover:text-accent-purple transition-colors">
                            <MessageSquare size={14} />
                          </div>

                          {/* Title / Inline edit box */}
                          {renamingId === convo.id ? (
                            <div className="flex items-center gap-2 flex-1" onClick={(e) => e.stopPropagation()}>
                              <input
                                type="text"
                                value={renamingTitle}
                                onChange={(e) => setRenamingTitle(e.target.value)}
                                className="px-2 py-1 bg-panel-dark border border-border-focus text-xs text-text-primary rounded focus:outline-none flex-1 max-w-[280px]"
                                autoFocus
                                onKeyDown={(e) => {
                                  if (e.key === 'Enter') saveRename(e, convo.id);
                                  if (e.key === 'Escape') setRenamingId(null);
                                }}
                              />
                              <button
                                onClick={(e) => saveRename(e, convo.id)}
                                className="p-1 text-green-400 hover:bg-panel-secondary rounded"
                              >
                                <Check size={14} />
                              </button>
                            </div>
                          ) : (
                            <div className="flex flex-col min-w-0">
                              <span className="text-xs font-semibold text-white group-hover:text-accent-purple truncate transition-colors">
                                {convo.title}
                              </span>
                              <span className="text-[9px] text-text-secondary/50 font-bold mt-0.5 uppercase tracking-wide">
                                {new Date(convo.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                              </span>
                            </div>
                          )}
                        </div>

                        {/* Actions buttons */}
                        <div className="flex items-center gap-1 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={(e) => startRename(e, convo.id, convo.title)}
                            className="p-1.5 text-text-secondary hover:text-white rounded-lg hover:bg-panel-secondary transition-colors"
                            title="Rename chat"
                          >
                            <Edit3 size={12} />
                          </button>
                          <button
                            onClick={(e) => handleDelete(e, convo.id)}
                            className="p-1.5 text-text-secondary hover:text-red-400 rounded-lg hover:bg-panel-secondary transition-colors"
                            title="Delete conversation"
                          >
                            <Trash2 size={12} />
                          </button>
                          <div className="pl-2 pr-1 text-text-secondary/40 shrink-0">
                            <ChevronRight size={14} />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
