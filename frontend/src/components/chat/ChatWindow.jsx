import React, { useState } from 'react';
import { 
  ThumbsUp, 
  ThumbsDown, 
  Copy, 
  Check, 
  RotateCw,
  FileText,
  User,
  Loader
} from 'lucide-react';

export const ChatWindow = ({
  messages,
  loading,
  ragStage,
  onRegenerate,
  onSourceClick,
}) => {
  const [copiedId, setCopiedId] = useState(null);
  const [feedback, setFeedback] = useState({});

  const handleCopy = (id, text) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleLike = (id) => {
    setFeedback(prev => ({
      ...prev,
      [id]: prev[id] === 'like' ? null : 'like'
    }));
  };

  const handleDislike = (id) => {
    setFeedback(prev => ({
      ...prev,
      [id]: prev[id] === 'dislike' ? null : 'dislike'
    }));
  };

  return (
    <div className="flex flex-col gap-6 px-6 py-6 overflow-y-auto h-full min-h-0 bg-background">
      {messages.map((message, index) => {
        const isUser = message.sender === 'user';
        const isLast = index === messages.length - 1;

        return (
          <div 
            key={message.id || index}
            className={`flex gap-4 ${isUser ? 'justify-end' : 'justify-start'}`}
          >
            {/* AI Avatar */}
            {!isUser && (
              <div className="w-8 h-8 rounded-lg bg-accent-purple/10 text-accent-purple border border-accent-purple/20 flex items-center justify-center shrink-0 shadow-sm">
                <span className="text-[10px] font-bold">AI</span>
              </div>
            )}

            {/* Bubble Container */}
            <div className="max-w-[80%] flex flex-col gap-2">
              <div 
                className={`rounded-xl px-4 py-3.5 text-xs leading-relaxed ${
                  isUser 
                    ? 'bg-accent-purple text-white rounded-tr-none shadow-md' 
                    : 'bg-panel-light text-text-primary border border-border-subtle rounded-tl-none shadow-sm'
                }`}
              >
                <p className="whitespace-pre-wrap">{message.content}</p>

                {/* Sources list under bubble */}
                {!isUser && message.sources && message.sources.length > 0 && (
                  <div className="mt-4 pt-3.5 border-t border-border-subtle/50 flex flex-col gap-2">
                    <span className="text-[9px] font-bold uppercase tracking-wider text-accent-purple">
                      Citations
                    </span>
                    <div className="flex flex-wrap gap-2">
                      {message.sources.map((source, idx) => (
                        <button
                          key={idx}
                          onClick={() => onSourceClick(source)}
                          className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-panel-dark border border-border-subtle hover:border-border-focus text-text-secondary hover:text-white rounded-md text-[10px] transition-colors"
                        >
                          <FileText size={10} className="text-accent-purple" />
                          <span className="truncate max-w-[120px]">{source.filename}</span>
                          {source.page && (
                            <span className="text-text-secondary/50 font-semibold">(Pg {source.page})</span>
                          )}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Actions panel */}
              {!isUser && (
                <div className="flex items-center gap-4 px-2 text-text-secondary">
                  {/* Copy */}
                  <button
                    onClick={() => handleCopy(message.id, message.content)}
                    className="hover:text-text-primary p-0.5 rounded transition-colors"
                    title="Copy response"
                  >
                    {copiedId === message.id ? <Check size={12} className="text-green-400" /> : <Copy size={12} />}
                  </button>

                  {/* Likes/Dislikes */}
                  <button
                    onClick={() => handleLike(message.id)}
                    className={`hover:text-text-primary p-0.5 rounded transition-colors ${
                      feedback[message.id] === 'like' ? 'text-accent-purple' : ''
                    }`}
                    title="Helpful"
                  >
                    <ThumbsUp size={12} />
                  </button>
                  <button
                    onClick={() => handleDislike(message.id)}
                    className={`hover:text-text-primary p-0.5 rounded transition-colors ${
                      feedback[message.id] === 'dislike' ? 'text-red-400' : ''
                    }`}
                    title="Not helpful"
                  >
                    <ThumbsDown size={12} />
                  </button>

                  {/* Regenerate */}
                  {isLast && (
                    <button
                      onClick={onRegenerate}
                      className="hover:text-text-primary p-0.5 rounded transition-colors flex items-center gap-1 text-[10px] font-semibold"
                      title="Regenerate answer"
                    >
                      <RotateCw size={10} />
                      <span>Regenerate</span>
                    </button>
                  )}
                </div>
              )}
            </div>

            {/* User Avatar */}
            {isUser && (
              <div className="w-8 h-8 rounded-lg bg-card-secondary text-text-secondary border border-border-subtle flex items-center justify-center shrink-0 shadow-sm">
                <User size={13} />
              </div>
            )}
          </div>
        );
      })}

      {/* RAG Typing/Loading Indicator */}
      {loading && (
        <div className="flex gap-4 justify-start animate-fade-in">
          <div className="w-8 h-8 rounded-lg bg-accent-purple/10 text-accent-purple border border-accent-purple/20 flex items-center justify-center shrink-0">
            <span className="text-[10px] font-bold">AI</span>
          </div>
          <div className="bg-panel-light border border-border-subtle rounded-xl rounded-tl-none px-4 py-3.5 text-xs flex flex-col gap-2 max-w-[80%] shadow-sm">
            <div className="flex items-center gap-2 text-text-secondary text-xs">
              <Loader size={12} className="animate-spin text-accent-purple" />
              <span className="font-semibold capitalize text-[11px]">
                {ragStage === 'sending' && 'Initializing session...'}
                {ragStage === 'retrieving' && 'Retrieving knowledge vectors...'}
                {ragStage === 'generating' && 'Synthesizing response...'}
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
