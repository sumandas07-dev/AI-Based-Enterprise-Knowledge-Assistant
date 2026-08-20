import React, { useState, useRef, useEffect } from 'react';
import { Send, Plus, Paperclip } from 'lucide-react';

export const QuestionInput = ({ onSend, disabled, onAttachClick }) => {
  const [text, setText] = useState('');
  const textareaRef = useRef(null);

  // Auto-resize textarea to fit content
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 180)}px`;
    }
  }, [text]);

  const handleSend = () => {
    if (text.trim() && !disabled) {
      onSend(text.trim());
      setText('');
      if (textareaRef.current) {
        textareaRef.current.style.height = 'auto';
      }
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="bg-panel-light border border-border-subtle rounded-xl p-3 flex flex-col gap-2 shadow-lg focus-within:border-border-focus transition-colors max-w-3xl mx-auto">
      <div className="flex items-start gap-3">
        {/* Attachment/Plus button */}
        <button
          type="button"
          onClick={onAttachClick || (() => alert('Document attachment is available in the Documents panel.'))}
          disabled={disabled}
          className="text-text-secondary hover:text-text-primary p-1.5 rounded-lg hover:bg-panel-secondary/60 mt-0.5 shrink-0 transition-colors"
          title="Attach document guidelines"
        >
          <Plus size={16} className="text-accent-purple" />
        </button>

        {/* Text area */}
        <textarea
          ref={textareaRef}
          rows={1}
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Ask anything about your knowledge base..."
          disabled={disabled}
          className="flex-1 bg-transparent text-xs text-text-primary placeholder:text-text-secondary/40 focus:outline-none resize-none min-h-[28px] max-h-[180px] pt-1"
        />

        {/* Send Action */}
        <button
          onClick={handleSend}
          disabled={disabled || !text.trim()}
          className={`flex items-center justify-center p-2 rounded-lg transition-all shrink-0 ${
            text.trim() && !disabled
              ? 'bg-accent-purple text-white hover:bg-accent-purpleHover shadow-md'
              : 'bg-panel-secondary text-text-secondary/30 pointer-events-none'
          }`}
          title="Send query"
        >
          <Send size={14} />
        </button>
      </div>
    </div>
  );
};
