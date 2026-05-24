import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { FontAwesome, Ionicons } from '@expo/vector-icons';

export default function ChatThread() {
  const router = useRouter();
  const { id, name } = useLocalSearchParams();
  const [messages, setMessages] = useState([
    { id: 1, text: "Hello! I saw your profile.", isMe: false, time: "10:00 AM" },
    { id: 2, text: "Hi! Yes, I'm interested in adopting.", isMe: true, time: "10:05 AM" },
    { id: 3, text: "Great, when are you free for a call?", isMe: false, time: "10:06 AM" }
  ]);
  const [input, setInput] = useState('');

  const sendMessage = () => {
    if (!input.trim()) return;
    setMessages([...messages, { id: Date.now(), text: input, isMe: true, time: "Just now" }]);
    setInput('');
  };

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
       <View style={styles.header}>
         <TouchableOpacity onPress={() => router.back()} style={{ padding: 10, marginRight: 10 }}>
            <Ionicons name="chevron-back" size={24} color="#1e293b" />
         </TouchableOpacity>
         <View style={styles.avatar}><Text style={styles.avatarText}>{name ? name.charAt(0) : 'U'}</Text></View>
         <Text style={styles.title}>{name}</Text>
       </View>
       
       <ScrollView style={styles.messagesContainer} contentContainerStyle={{ padding: 20 }}>
         {messages.map(msg => (
           <View key={msg.id} style={[styles.messageBubble, msg.isMe ? styles.myMessage : styles.theirMessage]}>
             <Text style={[styles.messageText, msg.isMe ? styles.myMessageText : styles.theirMessageText]}>{msg.text}</Text>
             <Text style={[styles.messageTime, !msg.isMe && { color: '#64748b' }]}>{msg.time}</Text>
           </View>
         ))}
       </ScrollView>

       <View style={styles.inputContainer}>
         <TextInput 
           style={styles.input} 
           placeholder="Type a message..." 
           placeholderTextColor="#94a3b8"
           value={input} 
           onChangeText={setInput} 
           multiline
         />
         <TouchableOpacity style={styles.sendButton} onPress={sendMessage}>
           <FontAwesome name="send" size={16} color="white" />
         </TouchableOpacity>
       </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8fafc' },
  header: { flexDirection: 'row', alignItems: 'center', padding: 20, paddingTop: 60, paddingBottom: 20, backgroundColor: 'white', borderBottomWidth: 1, borderBottomColor: '#f1f5f9' },
  avatar: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#7c3aed', justifyContent: 'center', alignItems: 'center', marginRight: 15 },
  avatarText: { color: 'white', fontSize: 16, fontWeight: '700' },
  title: { fontSize: 18, fontWeight: '700', color: '#1e293b' },
  messagesContainer: { flex: 1 },
  messageBubble: { maxWidth: '80%', padding: 15, borderRadius: 20, marginBottom: 15 },
  myMessage: { alignSelf: 'flex-end', backgroundColor: '#7c3aed', borderBottomRightRadius: 5 },
  theirMessage: { alignSelf: 'flex-start', backgroundColor: '#e2e8f0', borderBottomLeftRadius: 5 },
  messageText: { fontSize: 15, lineHeight: 22 },
  myMessageText: { color: 'white' },
  theirMessageText: { color: '#1e293b' },
  messageTime: { fontSize: 10, color: 'rgba(255,255,255,0.6)', marginTop: 5, alignSelf: 'flex-end' },
  inputContainer: { flexDirection: 'row', padding: 15, backgroundColor: 'white', alignItems: 'flex-end', borderTopWidth: 1, borderTopColor: '#f1f5f9' },
  input: { flex: 1, backgroundColor: '#f1f5f9', padding: 15, borderRadius: 25, maxHeight: 100, fontSize: 15, marginRight: 10 },
  sendButton: { width: 50, height: 50, borderRadius: 25, backgroundColor: '#7c3aed', justifyContent: 'center', alignItems: 'center' }
});
