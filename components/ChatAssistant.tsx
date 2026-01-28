import React, { useState, useRef, useEffect } from 'react';
import { chatWithAgronomist } from '../services/gemini';
import { ChatMessage, LoadingState } from '../types';
import { Send, User, Bot, Loader2 } from 'lucide-react';

export const ChatAssistant: React.FC = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      role: 'model',
      text: "Hello! I'm AgriSmart. Ask me anything about pest control, irrigation, market trends, or general farming advice.",
      timestamp: new Date()
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [loading, setLoading] = useState(LoadingState.IDLE);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim() || loading === LoadingState.LOADING) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      text: inputValue,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setLoading(LoadingState.LOADING);

    try {
      // Prepare history for API
      const history = messages.map(msg => ({
        role: msg.role === 'user' ? 'user' : 'model',
        parts: [{ text: msg.text }]
      }));

      const responseText = await chatWithAgronomist(userMessage.text, history);

      const botMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'model',
        text: responseText,
        timestamp: new Date()
      };

      setMessages(prev => [...prev, botMessage]);
      setLoading(LoadingState.SUCCESS);
    } catch (error) {
      setLoading(LoadingState.ERROR);
    }
  };

  return (
    <div className="h-[calc(100vh-8rem)] flex flex-col bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
      <div className="p-4 border-b border-gray-100 bg-green-50/50 flex items-center justify-between">
        <h2 className="font-semibold text-gray-800 flex items-center gap-2">
          <Bot className="w-5 h-5 text-green-600" />
          Farming Assistant
        </h2>
        <span className="text-xs text-green-600 bg-green-100 px-2 py-1 rounded-full font-medium">Online</span>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex items-start gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}
          >
            <div className={`
              w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0
              ${msg.role === 'user' ? 'bg-gray-800' : 'bg-green-600'}
            `}>
              {msg.role === 'user' ? <User className="w-4 h-4 text-white" /> : <Bot className="w-4 h-4 text-white" />}
            </div>
            
            <div className={`
              max-w-[80%] rounded-2xl px-4 py-3 text-sm leading-relaxed shadow-sm
              ${msg.role === 'user' 
                ? 'bg-gray-800 text-white rounded-tr-sm' 
                : 'bg-white border border-gray-100 text-gray-700 rounded-tl-sm'}
            `}>
              {msg.text}
            </div>
          </div>
        ))}
        {loading === LoadingState.LOADING && (
           <div className="flex items-start gap-3">
             <div className="w-8 h-8 rounded-full bg-green-600 flex items-center justify-center flex-shrink-0">
               <Bot className="w-4 h-4 text-white" />
             </div>
             <div className="bg-white border border-gray-100 rounded-2xl rounded-tl-sm px-4 py-3 shadow-sm">
               <Loader2 className="w-5 h-5 text-gray-400 animate-spin" />
             </div>
           </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="p-4 border-t border-gray-100 bg-gray-50">
        <form onSubmit={handleSend} className="flex gap-2 relative">
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder="Ask about crops, pests, or weather..."
            className="flex-1 pl-4 pr-12 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition-all shadow-sm"
          />
          <button
            type="submit"
            disabled={!inputValue.trim() || loading === LoadingState.LOADING}
            className="absolute right-2 top-2 p-1.5 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:hover:bg-green-600 transition-colors"
          >
            <Send className="w-5 h-5" />
          </button>
        </form>
      </div>
    </div>
  );
};
