"use client";

import React, { useState } from 'react';
import { Send, Sparkles, Clock, Package } from 'lucide-react';

export default function CommandCenter() {
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: "Hello! I'm your industrial procurement assistant. I can help you find parts, compare prices, and manage your supply chain. What can I help you with today?"
    }
  ]);

  const handleSend = () => {
    if (!message.trim()) return;

    setMessages(prev => [...prev,
    { role: 'user', content: message },
    { role: 'assistant', content: 'Let me search our network of verified suppliers for you...' }
    ]);
    setMessage('');
  };

  return (
    <div className="min-h-screen bg-[#F8FAFB] flex flex-col">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-white" />
            </div>
            <h1 className="text-lg font-semibold text-gray-900">Al Sakr AI</h1>
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <Clock className="w-4 h-4" />
            <span>10 Agents Active</span>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-3xl mx-auto px-6 py-8 space-y-6">
          {messages.map((msg, i) => (
            <div key={i} className={`flex gap-4 animate-fadeIn ${msg.role === 'user' ? 'justify-end' : ''}`}>
              {msg.role === 'assistant' && (
                <div className="w-8 h-8 bg-blue-50 rounded-full flex items-center justify-center flex-shrink-0">
                  <Sparkles className="w-4 h-4 text-blue-500" />
                </div>
              )}
              <div className={`max-w-2xl ${msg.role === 'user' ? 'bg-blue-500 text-white' : 'bg-white border border-gray-200'} rounded-2xl px-5 py-3 shadow-sm`}>
                <p className={`text-[15px] leading-relaxed ${msg.role === 'user' ? 'text-white' : 'text-gray-800'}`}>
                  {msg.content}
                </p>
              </div>
              {msg.role === 'user' && (
                <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <Package className="w-4 h-4 text-gray-600" />
                </div>
              )}
            </div>
          ))}

          {/* Suggestions */}
          {messages.length === 1 && (
            <div className="grid grid-cols-2 gap-3 mt-8">
              <button className="card p-4 text-left hover:bg-blue-50 transition-colors">
                <div className="text-sm font-medium text-gray-900">Find SKF Bearings</div>
                <div className="text-xs text-gray-500 mt-1">Search our verified suppliers</div>
              </button>
              <button className="card p-4 text-left hover:bg-blue-50 transition-colors">
                <div className="text-sm font-medium text-gray-900">Compare Quotes</div>
                <div className="text-xs text-gray-500 mt-1">Get best prices instantly</div>
              </button>
              <button className="card p-4 text-left hover:bg-blue-50 transition-colors">
                <div className="text-sm font-medium text-gray-900">Check Inventory</div>
                <div className="text-xs text-gray-500 mt-1">Real-time stock levels</div>
              </button>
              <button className="card p-4 text-left hover:bg-blue-50 transition-colors">
                <div className="text-sm font-medium text-gray-900">Technical Specs</div>
                <div className="text-xs text-gray-500 mt-1">Browse datasheets</div>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Input */}
      <div className="bg-white border-t border-gray-200 sticky bottom-0">
        <div className="max-w-3xl mx-auto px-6 py-4">
          <div className="flex gap-3 items-end">
            <div className="flex-1 bg-gray-50 border border-gray-200 rounded-2xl px-4 py-3 focus-within:border-blue-500 focus-within:bg-white transition-all">
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSend();
                  }
                }}
                placeholder="Ask about parts, pricing, or inventory..."
                className="w-full bg-transparent resize-none outline-none text-gray-900 placeholder-gray-400 text-[15px]"
                rows={1}
                style={{ minHeight: '24px', maxHeight: '120px' }}
              />
            </div>
            <button
              onClick={handleSend}
              disabled={!message.trim()}
              className="bg-blue-500 hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed text-white w-10 h-10 rounded-xl flex items-center justify-center transition-all"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
          <div className="mt-2 text-xs text-gray-400 text-center">
            AI can make mistakes. Verify critical information.
          </div>
        </div>
      </div>
    </div>
  );
}
