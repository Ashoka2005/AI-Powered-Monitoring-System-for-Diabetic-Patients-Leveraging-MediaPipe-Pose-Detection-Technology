import React, { useState, useRef, useEffect } from 'react';
import { View, Text, ScrollView, StyleSheet, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import api from '../utils/api';

const QUICK_QUESTIONS = [
  'What is diabetes?',
  'Best exercises for blood sugar',
  'Low GI food recommendations',
  'How to manage blood sugar',
  'When to see a doctor',
];

export default function Chat() {
  const [messages, setMessages] = useState([{ id: '1', role: 'bot', text: "Hello! I'm your AI health assistant. Ask me about diabetes, exercise, diet, or general health!" }]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef(null);

  const sendMessage = async (text) => {
    const msg = text || input.trim();
    if (!msg) return;
    setInput('');

    const userMsg = { id: Date.now().toString(), role: 'user', text: msg };
    setMessages(prev => [...prev, userMsg]);
    setLoading(true);

    try {
      const { data } = await api.post('/chat', { message: msg });
      const botMsg = { id: (Date.now() + 1).toString(), role: 'bot', text: data.data?.reply || data.data?.message || 'I\'m not sure about that. Please consult your healthcare provider.' };
      setMessages(prev => [...prev, botMsg]);
    } catch (err) {
      setMessages(prev => [...prev, { id: (Date.now() + 1).toString(), role: 'bot', text: 'Sorry, I\'m having trouble connecting. Please try again.' }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : undefined} keyboardVerticalOffset={90}>
      {/* Quick Questions */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.quickRow}>
        {QUICK_QUESTIONS.map(q => (
          <TouchableOpacity key={q} style={styles.quickChip} onPress={() => sendMessage(q)}>
            <Text style={styles.quickText}>{q}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Messages */}
      <ScrollView ref={scrollRef} style={styles.messages} contentContainerStyle={styles.messagesContent} onContentSizeChange={() => scrollRef.current?.scrollToEnd()}>
        {messages.map(msg => (
          <View key={msg.id} style={[styles.bubble, msg.role === 'user' ? styles.userBubble : styles.botBubble]}>
            <Text style={[styles.bubbleText, msg.role === 'user' && styles.userBubbleText]}>{msg.text}</Text>
          </View>
        ))}
        {loading && (
          <View style={[styles.bubble, styles.botBubble]}>
            <ActivityIndicator size="small" color="#4F46E5" />
          </View>
        )}
      </ScrollView>

      {/* Input */}
      <View style={styles.inputBar}>
        <TextInput
          style={styles.input}
          placeholder="Ask about health, diet, exercise..."
          value={input}
          onChangeText={setInput}
          placeholderTextColor="#9CA3AF"
          returnKeyType="send"
          onSubmitEditing={() => sendMessage()}
        />
        <TouchableOpacity style={styles.sendBtn} onPress={() => sendMessage()} disabled={!input.trim()}>
          <Ionicons name="send" size={20} color="#fff" />
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F9FAFB' },
  quickRow: { paddingHorizontal: 16, paddingVertical: 8, gap: 8, borderBottomWidth: 1, borderBottomColor: '#E5E7EB', backgroundColor: '#fff' },
  quickChip: { paddingHorizontal: 14, paddingVertical: 7, borderRadius: 20, backgroundColor: '#EEF2FF', borderWidth: 1, borderColor: '#C7D2FE' },
  quickText: { fontSize: 12, color: '#4F46E5', fontWeight: '500' },
  messages: { flex: 1 },
  messagesContent: { padding: 16, gap: 8 },
  bubble: { maxWidth: '82%', padding: 12, borderRadius: 16 },
  userBubble: { alignSelf: 'flex-end', backgroundColor: '#4F46E5', borderBottomRightRadius: 4 },
  botBubble: { alignSelf: 'flex-start', backgroundColor: '#fff', borderBottomLeftRadius: 4, borderWidth: 1, borderColor: '#E5E7EB' },
  bubbleText: { fontSize: 14, lineHeight: 20 },
  userBubbleText: { color: '#fff' },
  inputBar: { flexDirection: 'row', alignItems: 'center', padding: 12, gap: 8, backgroundColor: '#fff', borderTopWidth: 1, borderTopColor: '#E5E7EB' },
  input: { flex: 1, backgroundColor: '#F3F4F6', borderRadius: 24, paddingHorizontal: 16, paddingVertical: 10, fontSize: 15, borderWidth: 1, borderColor: '#E5E7EB' },
  sendBtn: { width: 42, height: 42, borderRadius: 21, backgroundColor: '#4F46E5', justifyContent: 'center', alignItems: 'center' },
});
