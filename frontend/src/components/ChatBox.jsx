import { useState, useEffect, useRef } from 'react';
import { Paper, Box, TextField, IconButton, Typography, List, ListItem } from '@mui/material';
import SendIcon from '@mui/icons-material/Send';
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
    <Paper className="glass-panel" sx={{ height: '70vh', display: 'flex', flexDirection: 'column', p: 0, borderRadius: '24px', overflow: 'hidden', border: '1px solid rgba(0,0,0,0.05)' }}>
      <Box sx={{ p: 3, borderBottom: '1px solid rgba(0,0,0,0.05)', background: 'rgba(255,255,255,0.5)' }}>
        <Typography variant="h6" sx={{ fontWeight: 600 }}>
          {recipientName || 'Adoption Counselor'}
        </Typography>
        <Typography variant="caption" color="text.secondary">Online</Typography>
      </Box>

      <List sx={{ flexGrow: 1, overflow: 'auto', p: 3, display: 'flex', flexDirection: 'column', gap: 1 }}>
        {messages.length === 0 && (
          <Box sx={{ textAlign: 'center', my: 'auto', opacity: 0.5 }}>
            <Typography variant="body1">Send a message to start chatting!</Typography>
          </Box>
        )}
        {messages.map((message) => (
          <ListItem
            key={message.id}
            sx={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: message.sender === 'me' ? 'flex-end' : 'flex-start',
              p: 0
            }}
          >
            <Box
              sx={{
                maxWidth: '75%',
                background: message.sender === 'me' 
                  ? 'linear-gradient(135deg, var(--primary) 0%, var(--primary-hover) 100%)' 
                  : '#f1f5f9',
                color: message.sender === 'me' ? 'white' : 'text.primary',
                borderRadius: message.sender === 'me' ? '20px 20px 4px 20px' : '20px 20px 20px 4px',
                p: 2,
                boxShadow: '0 2px 5px rgba(0,0,0,0.02)'
              }}
            >
              <Typography variant="body1" sx={{ lineHeight: 1.4 }}>{message.text}</Typography>
            </Box>
            <Typography variant="caption" sx={{ color: 'text.secondary', mt: 0.5, px: 1 }}>
              {message.timestamp}
            </Typography>
          </ListItem>
        ))}
        <div ref={messagesEndRef} />
      </List>

      <Box sx={{ p: 2, background: 'rgba(255,255,255,0.8)', borderTop: '1px solid rgba(0,0,0,0.05)', display: 'flex', gap: 1, alignItems: 'center' }}>
        <TextField
          fullWidth
          variant="outlined"
          placeholder="Type your message..."
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && handleSend()}
          sx={{
            '& .MuiOutlinedInput-root': {
              borderRadius: '24px',
              backgroundColor: 'white',
              '& fieldset': { borderColor: 'rgba(0,0,0,0.1)' },
            }
          }}
          size="small"
        />
        <IconButton
          color="primary"
          onClick={handleSend}
          sx={{ 
            bgcolor: 'primary.main', 
            color: 'white', 
            '&:hover': { bgcolor: 'primary.dark' },
            width: 40, height: 40 
          }}
        >
          <SendIcon fontSize="small" sx={{ ml: '2px' }} />
        </IconButton>
      </Box>
    </Paper>
  );
};

export default ChatBox;
