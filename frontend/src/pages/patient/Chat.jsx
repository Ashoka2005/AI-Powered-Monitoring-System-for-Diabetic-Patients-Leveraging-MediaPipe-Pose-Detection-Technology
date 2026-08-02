import { useState, useRef, useEffect } from 'react';
import Layout from '../../components/Layout';
import api from '../../utils/api';
import { FiSend, FiMessageCircle, FiUser } from 'react-icons/fi';
import { motion } from 'framer-motion';

export default function Chat() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [sessionId, setSessionId] = useState(crypto.randomUUID());
  const messagesEndRef = useRef(null);

  useEffect(() => {
    // Welcome message
    setMessages([{ role: 'assistant', content: "Hello! I'm DiaFit AI, your healthcare assistant. I can help you with diabetes management, exercise tips, diet recommendations, blood sugar monitoring, and more. How can I help you today?" }]);
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMsg = { role: 'user', content: input.trim() };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      const res = await api.post('/chat/message', { message: input.trim(), sessionId });
      setMessages(prev => [...prev, { role: 'assistant', content: res.data.data.response }]);
    } catch {
      setMessages(prev => [...prev, { role: 'assistant', content: 'Sorry, I encountered an error. Please try again.' }]);
    }
    setLoading(false);
  };

  const quickQuestions = ['What is diabetes?', 'Exercise tips', 'Diet recommendations', 'Indian Helplines', 'Medication info'];

  return (
    <Layout>
      <div className="page-container">
        <h1 className="text-2xl font-bold mb-4">AI Healthcare Chatbot</h1>
        <div className="card flex flex-col" style={{ height: 'calc(100vh - 200px)' }}>
          {/* Messages */}
          <div className="flex-1 overflow-y-auto space-y-4 mb-4 pr-2">
            {messages.map((msg, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className={`flex gap-3 ${msg.role === 'user' ? 'justify-end' : ''}`}>
                {msg.role === 'assistant' && <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center text-primary-600 flex-shrink-0"><FiMessageCircle /></div>}
                <div className={`max-w-lg px-4 py-3 rounded-2xl text-sm ${msg.role === 'user' ? 'bg-primary-600 text-white rounded-tr-none' : 'bg-gray-100 text-gray-800 rounded-tl-none'}`}>
                  <p className="whitespace-pre-wrap">{msg.content}</p>
                </div>
                {msg.role === 'user' && <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center text-gray-600 flex-shrink-0"><FiUser /></div>}
              </motion.div>
            ))}
            {loading && (
              <div className="flex gap-3">
                <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center text-primary-600"><FiMessageCircle /></div>
                <div className="bg-gray-100 px-4 py-3 rounded-2xl rounded-tl-none">
                  <div className="flex gap-1">
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Quick questions */}
          {messages.length <= 1 && (
            <div className="flex flex-wrap gap-2 mb-3">
              {quickQuestions.map(q => (
                <button key={q} onClick={() => { setInput(q); }} className="px-3 py-1.5 bg-gray-100 hover:bg-gray-200 rounded-full text-sm text-gray-700 transition">{q}</button>
              ))}
            </div>
          )}

          {/* Input */}
          <form onSubmit={sendMessage} className="flex gap-2 border-t border-gray-200 pt-4">
            <input value={input} onChange={e => setInput(e.target.value)} placeholder="Ask about diabetes, exercise, diet..." className="input-field flex-1" disabled={loading} />
            <button type="submit" disabled={loading || !input.trim()} className="btn-primary px-4"><FiSend /></button>
          </form>
        </div>
      </div>
    </Layout>
  );
}
