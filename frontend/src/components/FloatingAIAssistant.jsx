import { useState, useEffect, useRef } from 'react';
import { Bot, User, Send, Zap, MessageSquare, ChevronRight, ChevronLeft } from 'lucide-react';
import { chatWithDocument, getChatHistory, listDocuments } from '../services/documentService';
import { useAIAssistant } from '../context/AIAssistantContext';

const FloatingAIAssistant = () => {
  const { isOpen, setIsOpen, selectedDocumentId, setSelectedDocumentId } = useAIAssistant();
  const [chatMessages, setChatMessages] = useState([{ role: 'ai', content: 'Hello! Select a document and ask me anything about it.' }]);
  const [currentMessage, setCurrentMessage] = useState('');
  const [chatDocumentId, setChatDocumentId] = useState('');
  const [isChatting, setIsChatting] = useState(false);
  const [allDocs, setAllDocs] = useState([]);
  const [loadingDocs, setLoadingDocs] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    const fetchDocs = async () => {
      try {
        setLoadingDocs(true);
        const res = await listDocuments({ sort: 'desc', page: 1 });
        setAllDocs(res.data || []);
      } catch (err) {
        console.error('Error fetching docs for AI assistant', err);
      } finally {
        setLoadingDocs(false);
      }
    };
    fetchDocs();
  }, []);

  // Sync selectedDocumentId from context into local chatDocumentId
  useEffect(() => {
    if (selectedDocumentId) {
      setChatDocumentId(selectedDocumentId);
    }
  }, [selectedDocumentId]);

  // Auto-scroll messages to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages, isChatting]);

  useEffect(() => {
    if (!chatDocumentId) {
      setChatMessages([{ role: 'ai', content: 'Hello! Select a document and ask me anything about it.' }]);
      return;
    }
    
    const loadHistory = async () => {
      try {
        setIsChatting(true);
        const history = await getChatHistory(chatDocumentId);
        
        if (history && history.length > 0) {
          const formatted = history.map(h => ({
            role: h.role === 'assistant' ? 'ai' : 'user',
            content: h.content
          }));
          setChatMessages([{ role: 'ai', content: 'History loaded. What else would you like to know?' }, ...formatted]);
        } else {
          setChatMessages([{ role: 'ai', content: 'Hello! I have read this document. Ask me anything about it.' }]);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setIsChatting(false);
      }
    };
    
    loadHistory();
  }, [chatDocumentId]);

  const handleSendMessage = async (e) => {
    e?.preventDefault();
    if (!currentMessage.trim() || !chatDocumentId) return;

    const userMessage = currentMessage;
    setChatMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    setCurrentMessage('');
    setIsChatting(true);

    try {
      const response = await chatWithDocument(chatDocumentId, userMessage);
      setChatMessages(prev => [...prev, { role: 'ai', content: response }]);
    } catch (err) {
      setChatMessages(prev => [...prev, { role: 'ai', content: err.response?.data?.error || 'Sorry, I encountered an error processing your request.' }]);
    } finally {
      setIsChatting(false);
    }
  };

  const renderMessageContent = (content) => {
    if (typeof content === 'string') {
      return <p className="whitespace-pre-wrap">{content}</p>;
    }
    
    if (typeof content === 'object' && content !== null) {
      return (
        <div className="space-y-3">
          {content.answer && <p className="whitespace-pre-wrap">{content.answer}</p>}
          {content.summary && (
            <div className="bg-black/5 dark:bg-black/20 p-3 rounded-lg text-sm border border-black/5 dark:border-white/5">
              <strong className="block mb-1">Summary:</strong>
              {content.summary}
            </div>
          )}
          {content.keyPoints && content.keyPoints.length > 0 && (
            <div className="text-sm bg-black/5 dark:bg-black/20 p-3 rounded-lg border border-black/5 dark:border-white/5">
              <strong className="block mb-1">Key Points:</strong>
              <ul className="list-disc pl-5 space-y-1">
                {content.keyPoints.map((kp, i) => <li key={i}>{kp}</li>)}
              </ul>
            </div>
          )}
        </div>
      );
    }
    return null;
  };

  const handleQuickAction = (action) => {
    setCurrentMessage(action);
  };

  return (
    <>
      {/* Toggle button — visible when panel is closed */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed right-0 top-1/2 -translate-y-1/2 bg-blue-600 text-white p-3 rounded-l-2xl shadow-xl hover:bg-blue-700 transition-colors z-40 group flex items-center gap-2"
        >
          <ChevronLeft size={20} />
          <Bot size={24} className="group-hover:scale-110 transition-transform" />
        </button>
      )}

      {/* Backdrop on mobile */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/20 z-30 md:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      <aside className={`fixed right-0 top-0 bottom-0 w-[72vw] max-w-[270px] sm:w-80 lg:w-96 bg-white border-l border-gray-200 shadow-2xl flex flex-col h-full transition-transform duration-300 ease-in-out dark:bg-gray-900 dark:border-gray-800 z-40 ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}>
      {/* Header */}
      <div className="p-4 border-b border-gray-200 dark:border-gray-800 flex items-center justify-between bg-gray-50/50 dark:bg-gray-900/50">
        <div className="flex items-center gap-2">
          <Bot size={20} className="text-blue-600 dark:text-blue-400" />
          <h2 className="font-bold text-gray-900 dark:text-white">DocuMind AI</h2>
        </div>
        <button 
          onClick={() => setIsOpen(false)}
          className="p-1.5 text-gray-500 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg transition-colors"
        >
          <ChevronRight size={20} />
        </button>
      </div>

      {/* Document Selector */}
      <div className="p-4 border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900">
        <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">
          Selected Document
        </label>
        <select
          value={chatDocumentId}
          onChange={(e) => setChatDocumentId(e.target.value)}
          className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-sm text-gray-900 dark:text-white rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
        >
          <option value="">-- Choose a document --</option>
          {allDocs
            .filter((doc, index, self) => 
              index === self.findIndex((t) => t.original_filename === doc.original_filename)
            )
            .map(doc => (
            <option key={doc.id} value={doc.id}>
              {doc.original_filename}
            </option>
          ))}
        </select>
      </div>

      {/* Chat Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50/50 dark:bg-gray-950/50">
        {!chatDocumentId && chatMessages.length === 1 && (
           <div className="flex flex-col items-center justify-center h-full text-center p-4 opacity-50">
             <MessageSquare size={48} className="text-gray-300 dark:text-gray-700 mb-4" />
             <p className="text-sm text-gray-500 dark:text-gray-400">Select a document above to begin analysis.</p>
           </div>
        )}
        
        {chatMessages.map((msg, idx) => (
          <div key={idx} className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${msg.role === 'user' ? 'bg-blue-600 text-white' : 'bg-indigo-100 text-indigo-600 dark:bg-indigo-900/50 dark:text-indigo-400'}`}>
              {msg.role === 'user' ? <User size={14} /> : <Bot size={14} />}
            </div>
            <div className={`max-w-[85%] rounded-2xl p-3 text-sm leading-relaxed ${
              msg.role === 'user' 
                ? 'bg-blue-600 text-white rounded-tr-none shadow-sm' 
                : 'bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 text-gray-800 dark:text-gray-200 rounded-tl-none shadow-sm'
            }`}>
              {renderMessageContent(msg.content)}
            </div>
          </div>
        ))}
        {isChatting && (
          <div className="flex gap-3">
            <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-600 dark:bg-indigo-900/50 dark:text-indigo-400 flex items-center justify-center shrink-0">
              <Bot size={14} />
            </div>
            <div className="bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-2xl rounded-tl-none p-3 shadow-sm flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce"></span>
              <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></span>
              <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></span>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="border-t border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-3">
        {chatDocumentId && (
          <div className="flex gap-2 pb-3 overflow-x-auto hide-scrollbar">
            {["Summarize", "Explain", "Key Points", "Important Dates"].map(action => (
              <button 
                key={action}
                type="button"
                onClick={() => handleQuickAction(action)}
                className="shrink-0 text-xs px-2.5 py-1.5 bg-gray-50 hover:bg-blue-50 text-gray-700 hover:text-blue-700 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-blue-900/30 rounded-lg transition-colors flex items-center gap-1 border border-gray-200 dark:border-gray-700 whitespace-nowrap"
              >
                <Zap size={12} /> {action}
              </button>
            ))}
          </div>
        )}
        <form onSubmit={handleSendMessage} className="flex gap-2">
          <input
            type="text"
            value={currentMessage}
            onChange={(e) => setCurrentMessage(e.target.value)}
            disabled={!chatDocumentId || isChatting}
            placeholder={!chatDocumentId ? "Select document..." : "Ask something..."}
            className="flex-1 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-sm text-gray-900 dark:text-white rounded-xl px-3 py-2.5 outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all disabled:opacity-50"
          />
          <button
            type="submit"
            disabled={!chatDocumentId || !currentMessage.trim() || isChatting}
            className="p-2.5 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 disabled:dark:bg-gray-700 disabled:cursor-not-allowed text-white rounded-xl transition-colors shadow-sm shrink-0 flex items-center justify-center"
          >
            <Send size={16} />
          </button>
        </form>
      </div>
    </aside>
    </>
  );
};

export default FloatingAIAssistant;
