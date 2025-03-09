import React, { useState, useRef, useEffect } from 'react';
import {
  Box,
  Paper,
  TextField,
  IconButton,
  Typography,
  List,
  ListItem,
  ListItemText,
  Divider,
  CircularProgress,
  Button,
  Stack,
  Chip
} from '@mui/material';
import SendIcon from '@mui/icons-material/Send';
import SmartToyIcon from '@mui/icons-material/SmartToy';
import axios from '../../../config/axios';

const SAMPLE_QUERIES = [
  "What's the best possible team I can make?",
  "Tell me about Kavindu's batting stats",
  "How many wickets has Sandun taken?",
  "Help me select my team",
  "Show me all-rounders' performance"
];

const ChatbotTab = () => {
  const [messages, setMessages] = useState([
    { 
      text: "Hi! I'm Spiriter, your cricket team assistant. I can help you with:\n" +
            "• Finding the best possible team\n" +
            "• Player statistics and information\n" +
            "• Team selection advice\n" +
            "• Budget management\n\n" +
            "How can I assist you today?",
      sender: 'bot' 
    }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async (text = input) => {
    if (!text.trim()) return;

    const userMessage = text.trim();
    setInput('');
    setMessages(prev => [...prev, { text: userMessage, sender: 'user' }]);
    setLoading(true);

    try {
      const response = await axios.post('/api/chatbot/query', { query: userMessage });
      setMessages(prev => [...prev, { text: response.data.response, sender: 'bot' }]);
    } catch (error) {
      console.error('Error querying chatbot:', error);
      setMessages(prev => [...prev, { 
        text: "I'm having trouble processing your request right now. Please try again later.", 
        sender: 'bot' 
      }]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <Box sx={{ height: '80vh', display: 'flex', flexDirection: 'column' }}>
      {/* Chat Messages */}
      <Paper 
        elevation={3} 
        sx={{ 
          flex: 1, 
          mb: 2, 
          p: 2, 
          overflow: 'auto',
          backgroundColor: '#f5f5f5'
        }}
      >
        <List>
          {messages.map((message, index) => (
            <React.Fragment key={index}>
              <ListItem
                sx={{
                  justifyContent: message.sender === 'user' ? 'flex-end' : 'flex-start',
                  mb: 1
                }}
              >
                {message.sender === 'bot' && (
                  <SmartToyIcon 
                    color="primary" 
                    sx={{ mr: 1, alignSelf: 'flex-start', mt: 1 }} 
                  />
                )}
                <Paper
                  sx={{
                    p: 2,
                    maxWidth: '70%',
                    backgroundColor: message.sender === 'user' ? '#1976d2' : '#fff',
                    color: message.sender === 'user' ? '#fff' : 'inherit',
                    whiteSpace: 'pre-wrap'
                  }}
                >
                  <Typography>{message.text}</Typography>
                </Paper>
              </ListItem>
              {index < messages.length - 1 && <Divider />}
            </React.Fragment>
          ))}
          {loading && (
            <ListItem>
              <CircularProgress size={20} />
            </ListItem>
          )}
          <div ref={messagesEndRef} />
        </List>
      </Paper>

      {/* Sample Queries */}
      <Paper 
        elevation={3} 
        sx={{ 
          p: 2,
          mb: 2,
          backgroundColor: '#fff'
        }}
      >
        <Typography variant="subtitle2" gutterBottom>
          Try asking:
        </Typography>
        <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
          {SAMPLE_QUERIES.map((query, index) => (
            <Chip
              key={index}
              label={query}
              onClick={() => handleSend(query)}
              sx={{ mb: 1 }}
              clickable
            />
          ))}
        </Stack>
      </Paper>
      
      {/* Input Box */}
      <Paper 
        elevation={3} 
        sx={{ 
          p: 2,
          backgroundColor: '#fff'
        }}
      >
        <Box sx={{ display: 'flex', gap: 1 }}>
          <TextField
            fullWidth
            variant="outlined"
            placeholder="Ask me anything about players or teams..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={handleKeyPress}
            multiline
            maxRows={4}
          />
          <IconButton 
            color="primary" 
            onClick={() => handleSend()}
            disabled={!input.trim() || loading}
          >
            <SendIcon />
          </IconButton>
        </Box>
      </Paper>
    </Box>
  );
};

export default ChatbotTab;
