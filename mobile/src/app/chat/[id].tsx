import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, ScrollView, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform, ActivityIndicator } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { FontAwesome, Ionicons, MaterialIcons } from '@expo/vector-icons';
import { OnDeviceAI } from '../../services/OnDeviceAI';
import * as FileSystem from 'expo-file-system';

export default function ChatThread() {
  const router = useRouter();
  const { id, name } = useLocalSearchParams();
  const [messages, setMessages] = useState([
    { id: 1, text: "Hello! I am your AI assistant. How can I help you today?", isMe: false, time: "10:00 AM" }
  ]);
  const [input, setInput] = useState('');
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [modelReady, setModelReady] = useState(false);
  const [downloadProgress, setDownloadProgress] = useState(0);
  const [isDownloading, setIsDownloading] = useState(false);
  
  const downloadResumableRef = useRef<FileSystem.DownloadResumable | null>(null);

  const isAiChat = name === 'AI Scavenger' || name === 'AI Assistant';

  useEffect(() => {
    if (isAiChat && OnDeviceAI.isReady()) {
      setModelReady(true);
    }
  }, [isAiChat]);

  const downloadAndInitModel = async () => {
    try {
      setIsDownloading(true);
      // Ensure you replace this placeholder URL with your real hosted Gemma .bin file URL!
      const modelUrl = 'https://models.petbuddy.com/gemma-2b.bin'; 
      const modelPath = FileSystem.documentDirectory + 'gemma.bin';
      
      const fileInfo = await FileSystem.getInfoAsync(modelPath);
      if (!fileInfo.exists) {
        // Real download implementation using expo-file-system
        downloadResumableRef.current = FileSystem.createDownloadResumable(
          modelUrl,
          modelPath,
          {},
          (progressEvent) => {
            const progress = progressEvent.totalBytesWritten / progressEvent.totalBytesExpectedToWrite;
            // Prevent NaN if totalBytes is unknown
            if (progressEvent.totalBytesExpectedToWrite > 0) {
              setDownloadProgress(Math.floor(progress * 100));
            }
          }
        );
        
        await downloadResumableRef.current.downloadAsync();
      }
      
      // Initialize the on-device AI native module
      await OnDeviceAI.initialize(modelPath);
      setModelReady(true);
      setIsDownloading(false);
    } catch (e) {
      console.error(e);
      setIsDownloading(false);
      alert('Failed to download or initialize AI on-device. URL might be invalid.');
    }
  };

  const sendMessage = async () => {
    if (!input.trim()) return;
    const userMsg = { id: Date.now(), text: input, isMe: true, time: "Just now" };
    setMessages(prev => [...prev, userMsg]);
    setInput('');

    if (isAiChat) {
      setIsAiLoading(true);
      try {
        let responseText = "";
        if (modelReady) {
          // Native Kotlin Offline Inference
          responseText = await OnDeviceAI.generateResponse(userMsg.text);
        } else {
          // Cloud Fallback Simulation (hitting FastAPI)
          await new Promise(r => setTimeout(r, 1500));
          responseText = "This is a cloud response from Gemini Pro! (Model not downloaded)";
        }
        setMessages(prev => [...prev, { id: Date.now() + 1, text: responseText, isMe: false, time: "Just now" }]);
      } catch (err) {
        setMessages(prev => [...prev, { id: Date.now() + 1, text: "Error: Could not generate response.", isMe: false, time: "Just now" }]);
      } finally {
        setIsAiLoading(false);
      }
    }
  };

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
       <View style={styles.header}>
         <TouchableOpacity onPress={() => router.back()} style={{ padding: 10, marginRight: 10 }}>
            <Ionicons name="chevron-back" size={24} color="#1e293b" />
         </TouchableOpacity>
         <View style={styles.avatar}>
           <Text style={styles.avatarText}>{isAiChat ? '🤖' : (name ? (name as string).charAt(0) : 'U')}</Text>
         </View>
         <View>
           <Text style={styles.title}>{name}</Text>
           {isAiChat && (
             <Text style={styles.modelIndicator}>
               {modelReady ? '🟢 Local AI (Gemma)' : '☁️ Cloud AI (Gemini Pro)'}
             </Text>
           )}
         </View>
       </View>
       
       {isAiChat && !modelReady && (
         <View style={styles.aiNotice}>
           <MaterialIcons name="memory" size={32} color="#7c3aed" />
           <Text style={styles.aiNoticeTitle}>Offline AI Mode</Text>
           <Text style={styles.aiNoticeText}>Download the on-device AI model to chat without an internet connection. It will be saved securely to Internal Storage.</Text>
           <TouchableOpacity style={styles.downloadBtn} onPress={downloadAndInitModel} disabled={isDownloading}>
             <Text style={styles.downloadBtnText}>{isDownloading ? `Downloading... ${downloadProgress}%` : 'Download Model (1.5GB)'}</Text>
           </TouchableOpacity>
         </View>
       )}

       <ScrollView style={styles.messagesContainer} contentContainerStyle={{ padding: 20 }}>
         {messages.map(msg => (
           <View key={msg.id} style={[styles.messageBubble, msg.isMe ? styles.myMessage : styles.theirMessage]}>
             <Text style={[styles.messageText, msg.isMe ? styles.myMessageText : styles.theirMessageText]}>{msg.text}</Text>
             <Text style={[styles.messageTime, !msg.isMe && { color: '#64748b' }]}>{msg.time}</Text>
           </View>
         ))}
         {isAiLoading && (
            <View style={[styles.messageBubble, styles.theirMessage, { paddingVertical: 10 }]}>
               <ActivityIndicator size="small" color="#7c3aed" />
            </View>
         )}
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
         <TouchableOpacity style={[styles.sendButton, !input.trim() && { opacity: 0.5 }]} onPress={sendMessage} disabled={!input.trim()}>
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
  modelIndicator: { fontSize: 12, color: '#64748b', marginTop: 2, fontWeight: '600' },
  aiNotice: { margin: 20, padding: 20, backgroundColor: '#f3e8ff', borderRadius: 16, alignItems: 'center' },
  aiNoticeTitle: { fontSize: 16, fontWeight: '700', color: '#7c3aed', marginTop: 10, marginBottom: 5 },
  aiNoticeText: { textAlign: 'center', color: '#6b7280', marginBottom: 15, fontSize: 13 },
  downloadBtn: { backgroundColor: '#7c3aed', paddingHorizontal: 20, paddingVertical: 10, borderRadius: 20 },
  downloadBtnText: { color: 'white', fontWeight: '700' },
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
