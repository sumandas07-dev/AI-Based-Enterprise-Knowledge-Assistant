import React, { useState, useEffect, useRef } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { 
  Trash2, 
  SidebarOpen, 
  SidebarClose, 
  AlertCircle,
  Sparkles,
  BookOpen
} from 'lucide-react';
import { ChatWindow } from '../components/chat/ChatWindow';
import { QuestionInput } from '../components/chat/QuestionInput';
import { SuggestedQuestions } from '../components/chat/SuggestedQuestions';
import { SourcesPanel } from '../components/sources/SourcesPanel';
import { chatApi, historyApi, documentApi } from '../api/api';

export const Dashboard = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const activeConvoId = searchParams.get('c');

  const [messages, setMessages] = useState([]);
  const [sources, setSources] = useState([]);
  const [activeSource, setActiveSource] = useState(null);
  const [loading, setLoading] = useState(false);
  const [ragStage, setRagStage] = useState('idle'); // idle, sending, retrieving, generating, completed, error
  const [errorMsg, setErrorMsg] = useState('');
  const [showSources, setShowSources] = useState(true);

  const [documents, setDocuments] = useState([]);
  const [selectedDocId, setSelectedDocId] = useState(null);
  const chatEndRef = useRef(null);

  // Fetch document lists on mount
  useEffect(() => {
    const fetchDocuments = async () => {
      try {
        const docList = await documentApi.getDocuments();
        setDocuments(docList || []);
      } catch (err) {
        console.error('Failed to load documents in Dashboard:', err);
      }
    };
    fetchDocuments();
  }, []);

  // Load conversation details when activeConvoId changes
  useEffect(() => {
    const loadConversation = async () => {
      if (!activeConvoId) {
        setMessages([]);
        setSources([]);
        setActiveSource(null);
        setRagStage('idle');
        return;
      }

      setLoading(true);
      setErrorMsg('');
      try {
        const convo = await historyApi.getConversation(activeConvoId);
        setMessages(convo.messages || []);
        
        // Load sources from the last assistant message in this convo
        const assistantMsgs = convo.messages.filter(m => m.sender === 'assistant');
        if (assistantMsgs.length > 0) {
          const lastMsg = assistantMsgs[assistantMsgs.length - 1];
          setSources(lastMsg.sources || []);
        } else {
          setSources([]);
        }
        setActiveSource(null);
        setRagStage('completed');
      } catch (err) {
        console.error('Failed to load conversation:', err);
        setErrorMsg('Failed to load conversation details.');
        setSearchParams({});
      } finally {
        setLoading(false);
      }
    };

    loadConversation();
  }, [activeConvoId, setSearchParams]);

  // Auto-scroll to bottom of conversation
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  const handleSendMessage = async (text) => {
    if (!text.trim() || loading) return;

    setLoading(true);
    setErrorMsg('');
    
    // Add user message locally
    const userMessage = {
      id: `user-${Date.now()}`,
      sender: 'user',
      content: text,
      createdAt: new Date().toISOString()
    };
    setMessages(prev => [...prev, userMessage]);

    // RAG Pipeline Stages Simulation
    setRagStage('sending');
    setTimeout(() => setRagStage('retrieving'), 400);

    try {
      // Send message to api
      const res = await chatApi.sendMessage(text, activeConvoId || undefined, selectedDocId || undefined);
      
      setRagStage('generating');
      setTimeout(() => {
        const assistantMessage = {
          id: `ai-${Date.now()}`,
          sender: 'assistant',
          content: res.answer,
          sources: res.sources || [],
          createdAt: new Date().toISOString()
        };

        setMessages(prev => [...prev, assistantMessage]);
        setSources(res.sources || []);
        setRagStage('completed');

        // Update URL query param if new conversation was created
        if (!activeConvoId && res.conversationId) {
          setSearchParams({ c: res.conversationId });
        }
      }, 500);

    } catch (err) {
      console.error(err);
      setRagStage('error');
      setErrorMsg(
        err.response?.data?.error || 
        'Unable to query the knowledge database. Please verify backend services are active.'
      );
    } finally {
      setTimeout(() => setLoading(false), 900);
    }
  };

  const handleRegenerate = () => {
    const userMsgs = messages.filter(m => m.sender === 'user');
    if (userMsgs.length === 0) return;
    const lastUserMsg = userMsgs[userMsgs.length - 1];

    setMessages(prev => {
      const copy = [...prev];
      if (copy[copy.length - 1]?.sender === 'assistant') {
        copy.pop();
      }
      return copy;
    });

    handleSendMessage(lastUserMsg.content);
  };

  const handleClearConversation = async () => {
    if (!activeConvoId) {
      setMessages([]);
      setSources([]);
      return;
    }

    if (window.confirm('Delete this conversation history?')) {
      try {
        await historyApi.deleteConversation(activeConvoId);
        setSearchParams({});
        navigate('/dashboard');
      } catch (err) {
        console.error('Failed to clear conversation:', err);
      }
    }
  };

  const hasMessages = messages.length > 0;

  return (
    <div className="flex h-full w-full overflow-hidden relative">
      {/* Center Chat area */}
      <div className="flex-1 flex flex-col h-full min-w-0 bg-background">
        
        {/* Subheader status bar */}
        <div className="h-12 border-b border-border-subtle bg-panel-dark/50 flex items-center justify-between px-6 shrink-0">
          <div className="flex items-center gap-4 flex-wrap">
            {loading && (
              <div className="flex items-center gap-2 text-[10px] text-text-secondary font-bold uppercase tracking-wider animate-pulse">
                <span className="w-1.5 h-1.5 bg-accent-purple rounded-full animate-ping" />
                <span>
                  {ragStage === 'sending' && 'Initializing session...'}
                  {ragStage === 'retrieving' && 'Retrieving knowledge vectors...'}
                  {ragStage === 'generating' && 'Synthesizing response...'}
                </span>
              </div>
            )}
            {!loading && hasMessages && (
              <span className="text-[10px] text-text-secondary uppercase font-bold tracking-wider">Active Chat Session</span>
            )}
            
            {/* Document filter dropdown */}
            <div className="flex items-center gap-1.5 ml-2">
              <span className="text-[9px] text-text-secondary uppercase font-bold tracking-wider">Source:</span>
              <select
                value={selectedDocId || ''}
                onChange={(e) => setSelectedDocId(e.target.value || null)}
                className="bg-panel-dark border border-border-subtle text-[9px] text-text-primary px-2 py-1 rounded-md focus:outline-none focus:border-border-focus cursor-pointer font-bold uppercase max-w-[150px] truncate"
              >
                <option value="">All Documents</option>
                {documents.filter(d => d.status === 'Indexed').map(d => (
                  <option key={d.id} value={d.id}>{d.filename}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {hasMessages && (
              <button
                onClick={handleClearConversation}
                className="flex items-center gap-1.5 text-[10px] font-bold text-text-secondary hover:text-red-400 transition-colors px-2.5 py-1.5 rounded-lg hover:bg-red-950/10 border border-transparent hover:border-red-950/20 uppercase"
                title="Clear current session"
              >
                <Trash2 size={13} />
                <span className="hidden sm:inline">Delete Session</span>
              </button>
            )}

            <button
              onClick={() => setShowSources(!showSources)}
              className="text-text-secondary hover:text-text-primary p-1.5 rounded-lg hover:bg-panel-secondary border border-border-subtle transition-all"
              title={showSources ? 'Hide Sources Panel' : 'Show Sources Panel'}
            >
              {showSources ? <SidebarClose size={14} /> : <SidebarOpen size={14} />}
            </button>
          </div>
        </div>

        {/* Error Alert */}
        {errorMsg && (
          <div className="mx-6 mt-4 bg-red-500/10 border border-red-500/20 text-red-400 text-xs px-4 py-3 rounded-lg flex items-center gap-2.5 shrink-0 animate-fade-in">
            <AlertCircle size={16} className="shrink-0" />
            <span className="flex-1">{errorMsg}</span>
            <button onClick={() => setErrorMsg('')} className="font-bold hover:underline">Dismiss</button>
          </div>
        )}

        {/* Chat window list */}
        <div className="flex-1 overflow-y-auto min-h-0 relative">
          {hasMessages ? (
            <ChatWindow
              messages={messages}
              loading={loading && ragStage !== 'completed'}
              ragStage={ragStage}
              onRegenerate={handleRegenerate}
              onSourceClick={(s) => {
                setActiveSource(s);
                setShowSources(true);
              }}
            />
          ) : (
            /* Dashboard Empty State */
            <div className="flex flex-col items-center justify-center text-center h-full px-6 py-12 animate-fade-in max-w-xl mx-auto my-auto">
              <div className="p-4 rounded-2xl bg-accent-purple/10 border border-accent-purple/20 text-accent-purple mb-5 shadow-inner">
                <Sparkles size={32} />
              </div>
              <h2 className="text-lg font-bold text-white mb-2">How can I help you today?</h2>
              <p className="text-xs text-text-secondary leading-relaxed mb-6">
                Ask questions about your documents and knowledge base. I will search through your indexed resources and synthesize responses with citations.
              </p>
              
              {/* Suggestions Grid */}
              <SuggestedQuestions onSelectQuestion={handleSendMessage} />
            </div>
          )}
          <div ref={chatEndRef} />
        </div>

        {/* Composer section */}
        <div className="p-4 border-t border-border-subtle bg-panel-dark/20 shrink-0">
          <QuestionInput
            onSend={handleSendMessage}
            disabled={loading}
          />
        </div>
      </div>

      {/* Right side cited sources sidebar */}
      {showSources && (
        <div className="hidden md:block shrink-0 animate-slide-in">
          <SourcesPanel
            sources={sources}
            activeSource={activeSource}
            onClearActive={() => setActiveSource(null)}
            onSelectSource={(s) => setActiveSource(s)}
            onViewAllSources={() => navigate('/sources')}
          />
        </div>
      )}
    </div>
  );
};
