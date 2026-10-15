import { useState, useRef, useEffect } from 'react';
import Layout from '../../components/Layout';
import api from '../../utils/api';
import { FiSend, FiMessageCircle, FiUser, FiRefreshCw, FiAlertCircle } from 'react-icons/fi';
import { motion } from 'framer-motion';

const generateSessionId = () => {
  if (typeof crypto !== 'undefined' && crypto && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  return 'sess_' + Date.now() + '_' + Math.random().toString(36).substring(2, 9);
};

export default function Chat() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [sessionId, setSessionId] = useState(generateSessionId);
  const messagesEndRef = useRef(null);

  const initChat = () => {
    setMessages([
      {
        role: 'assistant',
        content: "Hello! I'm DiaFit AI, your clinical healthcare assistant. I can guide you on diabetes management, safe exercises, low-glycemic diets, glucose ranges, hypoglycemia SOS, and Indian emergency numbers. How can I help you today?",
      },
    ]);
  };

  useEffect(() => {
    initChat();
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  const handleNewSession = () => {
    setSessionId(generateSessionId());
    initChat();
  };

  const sendMessage = async (e, textOverride) => {
    if (e && e.preventDefault) e.preventDefault();
    const query = (textOverride || input).trim();
    if (!query || loading) return;

    const userMsg = { role: 'user', content: query };
    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      const res = await api.post('/chat/message', { message: query, sessionId });
      const botReply = res?.data?.data?.response || res?.data?.response || "I am here to assist you with diabetes management. Please ask any health question.";
      setMessages((prev) => [...prev, { role: 'assistant', content: botReply }]);
    } catch (err) {
      console.error('Chat error:', err);
      const errMsg = err?.response?.data?.message || 'Sorry, I encountered a connection issue. Please check your network and try again.';
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: `⚠️ ${errMsg}\n\n*If this is a medical emergency, please call 112 or 108 immediately.*`,
          isError: true,
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const quickQuestions = [
    'What is diabetes?',
    'Low sugar SOS (Hypoglycemia)',
    'Normal blood sugar ranges',
    'Exercise tips for diabetes',
    'Diet recommendations',
    'Indian Emergency Helplines',
    'Medication info',
  ];

  return (
    <Layout>
      <div className="page-container max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">AI Healthcare Chatbot</h1>
            <p className="text-sm text-gray-500">Instant clinical guidance for diabetes care, workouts, and emergency protocols</p>
          </div>
          <button
            onClick={handleNewSession}
            title="Start New Conversation"
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-lg transition"
          >
            <FiRefreshCw className="w-3.5 h-3.5" /> New Chat
          </button>
        </div>

        <div className="card flex flex-col shadow-sm border border-gray-200 bg-white rounded-xl" style={{ height: 'calc(100vh - 210px)', minHeight: '500px' }}>
          {/* Quick Prompts Bar */}
          <div className="px-4 py-2.5 bg-gray-50/80 border-b border-gray-100 flex items-center gap-2 overflow-x-auto text-xs scrollbar-none">
            <span className="font-semibold text-gray-400 uppercase tracking-wider whitespace-nowrap text-[10px]">Quick:</span>
            {quickQuestions.map((q) => (
              <button
                key={q}
                onClick={() => sendMessage(null, q)}
                disabled={loading}
                className="whitespace-nowrap px-2.5 py-1 bg-white hover:bg-primary-50 hover:text-primary-700 hover:border-primary-200 border border-gray-200 rounded-full text-gray-700 transition shadow-2xs font-medium disabled:opacity-50"
              >
                {q}
              </button>
            ))}
          </div>

          {/* Messages Container */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.map((msg, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2 }}
                className={`flex gap-3 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                {msg.role === 'assistant' && (
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white flex-shrink-0 shadow-xs ${msg.isError ? 'bg-red-500' : 'bg-primary-600'}`}>
                    {msg.isError ? <FiAlertCircle className="w-4 h-4" /> : <FiMessageCircle className="w-4 h-4" />}
                  </div>
                )}
                <div
                  className={`max-w-2xl px-4 py-3 rounded-2xl text-sm leading-relaxed shadow-2xs ${
                    msg.role === 'user'
                      ? 'bg-primary-600 text-white rounded-tr-none'
                      : msg.isError
                      ? 'bg-red-50 text-red-900 border border-red-200 rounded-tl-none'
                      : 'bg-gray-100/90 text-gray-800 rounded-tl-none border border-gray-100'
                  }`}
                >
                  <p className="whitespace-pre-wrap">{msg.content}</p>
                </div>
                {msg.role === 'user' && (
                  <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center text-gray-600 flex-shrink-0">
                    <FiUser className="w-4 h-4" />
                  </div>
                )}
              </motion.div>
            ))}
            {loading && (
              <div className="flex gap-3">
                <div className="w-8 h-8 bg-primary-600 text-white rounded-full flex items-center justify-center flex-shrink-0 shadow-xs">
                  <FiMessageCircle className="w-4 h-4" />
                </div>
                <div className="bg-gray-100 px-4 py-3 rounded-2xl rounded-tl-none border border-gray-100">
                  <div className="flex gap-1.5 items-center h-5">
                    <div className="w-2 h-2 bg-primary-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                    <div className="w-2 h-2 bg-primary-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                    <div className="w-2 h-2 bg-primary-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Form */}
          <form onSubmit={sendMessage} className="p-3 border-t border-gray-200 flex gap-2 bg-white">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask about blood sugar, diet, safe exercises, emergency helplines..."
              className="input-field flex-1 text-sm py-2.5 px-4 rounded-xl border-gray-300 focus:border-primary-500 focus:ring-1 focus:ring-primary-500"
              disabled={loading}
            />
            <button
              type="submit"
              disabled={loading || !input.trim()}
              className="btn-primary px-5 py-2.5 rounded-xl flex items-center justify-center gap-1.5 shadow-sm disabled:opacity-50 transition"
            >
              <FiSend className="w-4 h-4" />
              <span className="hidden sm:inline text-xs font-semibold">Send</span>
            </button>
          </form>
        </div>
      </div>
    </Layout>
  );
}
