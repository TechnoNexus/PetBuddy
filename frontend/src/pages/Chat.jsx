import { useState } from 'react';
import { Container, Grid, List, ListItem, ListItemText, ListItemAvatar, Avatar, Typography, Paper } from '@mui/material';
import ChatBox from '../components/ChatBox';

const Chat = () => {
  const [selectedChat, setSelectedChat] = useState(null);
  const [conversations] = useState([
    { id: 1, name: 'John Doe', lastMessage: 'Hi, I\'m interested in your Golden Retriever!', avatar: 'J' },
    { id: 2, name: 'Sarah Wilson', lastMessage: 'When can I visit to see the cat?', avatar: 'S' },
    { id: 3, name: 'Mike Brown', lastMessage: 'Is the puppy still available?', avatar: 'M' }
  ]);

  return (
    <Container maxWidth="lg" sx={{ mt: 4 }}>
      <Typography variant="h4" sx={{ mb: 3 }}>Messages</Typography>
      <Grid container spacing={3}>
        <Grid item xs={12} md={4}>
          <Paper elevation={2} sx={{ height: '70vh' }}>
            <Typography variant="h6" sx={{ p: 2, borderBottom: 1, borderColor: 'divider' }}>
              Conversations
            </Typography>
            <List>
              {conversations.map((conv) => (
                <ListItem
                  key={conv.id}
                  button
                  onClick={() => setSelectedChat(conv)}
                  selected={selectedChat?.id === conv.id}
                  sx={{
                    '&:hover': {
                      backgroundColor: 'rgba(0, 0, 0, 0.04)'
                    }
                  }}
                >
                  <ListItemAvatar>
                    <Avatar sx={{ bgcolor: 'primary.main' }}>{conv.avatar}</Avatar>
                  </ListItemAvatar>
                  <ListItemText
  primary={conv.name}
  secondary={conv.lastMessage}
  secondaryTypographyProps={{
    noWrap: true,
    style: { maxWidth: '180px' }  // Adjusted width
  }}
  sx={{
    overflow: 'hidden',
    '& .MuiListItemText-secondary': {
      textOverflow: 'ellipsis'
    }
  }}
/>

                </ListItem>
              ))}
            </List>
          </Paper>
        </Grid>
        <Grid item xs={12} md={8}>
          {selectedChat ? (
            <ChatBox recipientId={selectedChat.id} recipientName={selectedChat.name} />
          ) : (
            <Paper elevation={2} sx={{ height: '70vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Typography variant="h6" color="text.secondary">
                Select a conversation to start chatting
              </Typography>
            </Paper>
          )}
        </Grid>
      </Grid>
    </Container>
  );
};

export default Chat;
