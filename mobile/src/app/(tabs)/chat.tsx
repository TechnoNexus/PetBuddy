import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { FontAwesome } from '@expo/vector-icons';

export default function ChatScreen() {
  const router = useRouter();
  const [conversations] = useState([
    { id: 'ai', name: 'AI Assistant', lastMessage: 'Hi! I am your AI assistant. Download my model to chat offline!', avatar: '🤖', unread: 1 },
    { id: 1, name: 'John Doe', lastMessage: 'Hi, I\'m interested in your Golden Retriever!', avatar: 'J', unread: 2 },
    { id: 2, name: 'Sarah Wilson', lastMessage: 'When can I visit to see the cat?', avatar: 'S', unread: 0 },
    { id: 3, name: 'Mike Brown', lastMessage: 'Is the puppy still available?', avatar: 'M', unread: 1 }
  ]);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Messages</Text>
      </View>
      <ScrollView>
        {conversations.map(conv => (
          <TouchableOpacity key={conv.id} style={styles.chatRow} onPress={() => router.push(`/chat/${conv.id}?name=${encodeURIComponent(conv.name)}`)}>
            <View style={styles.avatar}>
               <Text style={styles.avatarText}>{conv.avatar}</Text>
            </View>
            <View style={styles.chatInfo}>
               <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                 <Text style={styles.chatName}>{conv.name}</Text>
                 <Text style={styles.timeText}>2m ago</Text>
               </View>
               <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 4 }}>
                 <Text style={[styles.lastMessage, conv.unread > 0 && { color: '#1e293b', fontWeight: '700' }]} numberOfLines={1}>{conv.lastMessage}</Text>
                 {conv.unread > 0 && (
                   <View style={styles.unreadBadge}>
                     <Text style={styles.unreadText}>{conv.unread}</Text>
                   </View>
                 )}
               </View>
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8fafc' },
  header: { padding: 20, paddingTop: 60, paddingBottom: 20, backgroundColor: 'white', borderBottomWidth: 1, borderBottomColor: '#f1f5f9' },
  title: { fontSize: 28, fontWeight: '800', color: '#1e293b' },
  chatRow: { flexDirection: 'row', padding: 20, borderBottomWidth: 1, borderBottomColor: '#f1f5f9', backgroundColor: 'white', alignItems: 'center' },
  avatar: { width: 50, height: 50, borderRadius: 25, backgroundColor: '#7c3aed', justifyContent: 'center', alignItems: 'center', marginRight: 15 },
  avatarText: { color: 'white', fontSize: 20, fontWeight: '700' },
  chatInfo: { flex: 1 },
  chatName: { fontSize: 16, fontWeight: '700', color: '#1e293b' },
  lastMessage: { fontSize: 14, color: '#64748b', flex: 1, marginRight: 10 },
  timeText: { fontSize: 12, color: '#94a3b8' },
  unreadBadge: { backgroundColor: '#f43f5e', width: 20, height: 20, borderRadius: 10, justifyContent: 'center', alignItems: 'center' },
  unreadText: { color: 'white', fontSize: 10, fontWeight: '800' }
});
