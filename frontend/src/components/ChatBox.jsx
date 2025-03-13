import { useState, useEffect, useRef } from 'react';
import { Paper, Box, TextField, Button, Typography, List, ListItem } from '@mui/material';
import { wsService } from '../services/websocket';

const ChatBox = ({ recipientId, recipientName }) => {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const messagesEndRef = useRef(null);

  useEffect(() => {
    // Connect to WebSocket
    wsService.connect();

    // Subscribe to messages
    const unsubscribe = wsService.subscribe((data) => {
      if (data.type === 'chat_message' && data.sender_id === recipientId) {
        addMessage('them', data.message);
      }
    });

    return () => unsubscribe();
  }, [recipientId]);

  const addMessage = (sender, text) => {
    const newMsg = {
      id: Date.now(),
      sender,
      text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
    setMessages(prev => [...prev, newMsg]);
    scrollToBottom();
  };

  const handleSend = () => {
    if (newMessage.trim()) {
      // Send message through WebSocket
      wsService.sendMessage({
        type: 'chat_message',
        recipient_id: recipientId,
        message: newMessage
      });

      // Add message to local state
      addMessage('me', newMessage);
      setNewMessage('');
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <Paper sx={{ height: '70vh', display: 'flex', flexDirection: 'column', p: 2 }}>
      <Typography variant="h6" sx={{ mb: 2 }}>
        Chat with {recipientName}
      </Typography>

      <List sx={{ flexGrow: 1, overflow: 'auto', mb: 2 }}>
        {messages.map((message) => (
          <ListItem
            key={message.id}
            sx={{
              justifyContent: message.sender === 'me' ? 'flex-end' : 'flex-start',
              mb: 1
            }}
          >
            <Box
              sx={{
                maxWidth: '70%',
                backgroundColor: message.sender === 'me' ? 'primary.main' : 'grey.200',
                color: message.sender === 'me' ? 'white' : 'text.primary',
                borderRadius: 2,
                p: 2
              }}
            >
              <Typography variant="body1">{message.text}</Typography>
              <Typography variant="caption" sx={{ display: 'block', textAlign: 'right', mt: 1 }}>
                {message.timestamp}
              </Typography>
            </Box>
          </ListItem>
        ))}
        <div ref={messagesEndRef} />
      </List>

      <Box sx={{ display: 'flex', gap: 1 }}>
        <TextField
          fullWidth
          variant="outlined"
          placeholder="Type a message..."
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && handleSend()}
        />
        <Button
          variant="contained"
          onClick={handleSend}
          sx={{ px: 4 }}
        >
          Send
        </Button>
      </Box>
    </Paper>
  );
};

export default ChatBox;
