import React from 'react';
import { HelpCircle } from 'lucide-react';

export const SuggestedQuestions = ({ onSelectQuestion }) => {
  const suggestions = [
    "What is this knowledge base about?",
    "Summarize the uploaded documents",
    "What are the key policies?",
    "Find information about..."
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-2xl w-full mt-4">
      {suggestions.map((question, idx) => (
        <button
          key={idx}
          onClick={() => onSelectQuestion(question)}
          className="bg-panel-light hover:bg-panel-light/80 border border-border-subtle hover:border-border-focus p-4 rounded-xl text-left text-xs text-text-secondary hover:text-white transition-all flex items-start gap-3.5 group shadow-sm"
        >
          <HelpCircle size={14} className="text-accent-purple shrink-0 mt-0.5" />
          <span className="font-semibold leading-relaxed">{question}</span>
        </button>
      ))}
    </div>
  );
};
