import React, { useState, useEffect, useRef  }  from 'react';
//  'r    const initializeChat = async () => {
//       try {
//         // Check if session_id exists in URL
//         const sessionIdFromUrl = searchParams.get('session_id');
//         let sessionId: string;
//         let isExistingSession = false;

//         if (sessionIdFromUrl) {
//           console.log('📌 Using session from URL:', sessionIdFromUrl);
//           sessionId = sessionIdFromUrl;
//           isExistingSession = true;
          
//           // Load existing session history
//           try {
//             console.log('📜 Loading session history...');
//             const history = await chatApi.getMessages(sessionId);
//             console.log('✅ History loaded:', history.length, 'messages');
            
//             if (history.length > 0) {
//               setMessages(history);
//             }
//           } catch (err) {
//             console.warn('⚠️ Could not load history (session may be new):', err);
//             // Continue anyway - might be a new session
//           }
//         } else {
//           console.log('📞 Creating new session...');
//           const session = await chatApi.createSession();
//           sessionId = session.session_id;
//           console.log('✅ Session created:', sessionId);
          
//           // Update URL with session_id
//           navigate(`/ai-chat?session_id=${sessionId}`, { replace: true });
//         }
import {Box, Container, Typography, Paper, Alert, Button } from '@mui/material';
import { SmartToy, Add } from '@mui/icons-material';
import { ChatService, chatApi } from '../services/chatService';
import type { ChatMessage as ChatMessageType } from '../services/chatService';
import ChatMessage from '../components/chat/ChatMessage';
import ChatInput from '../components/chat/ChatInput';
import ThinkingIndicator from '../components/chat/ThinkingIndicator';
import theme from '../theme';
 import { useNavigate, useSearchParams } from 'react-router-dom';
  
 
const AIChat: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [messages, setMessages] = useState<ChatMessageType[]>([]);
  const [thinkingSteps, setThinkingSteps] = useState<Array<{ step: string; timestamp: string; completed?: boolean }>>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isConnected, setIsConnected] = useState(true);
  const [error, setError] = useState<string>('');
  const [isHeaderMinimized, setIsHeaderMinimized] = useState(false);
  const chatServiceRef = useRef<ChatService | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Check if chat has started (has messages beyond welcome)
  const hasChatStarted = messages.length > 1;

  // Minimize header when chat starts
  useEffect(() => {
    setIsHeaderMinimized(hasChatStarted);
  }, [hasChatStarted]);

  // Auto-scroll to bottom
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, thinkingSteps]);

  // Initialize chat session - runs only once per session_id
  useEffect(() => {
    let cancelled = false;
    
    console.log('🚀 Initializing chat...');

    const initializeChat = async () => {
      if (cancelled) return;
      
      try {
        // Check if session_id exists in URL
        const sessionIdFromUrl = searchParams.get('session_id');
        let sessionId: string;
        let isExistingSession = false;

        if (sessionIdFromUrl) {
          console.log('📌 Using session from URL:', sessionIdFromUrl);
          sessionId = sessionIdFromUrl;
          isExistingSession = true;
          
          // Load existing session history
          try {
            console.log('📜 Loading session history...');
            const history = await chatApi.getMessages(sessionId);
            console.log('✅ History loaded:', history.length, 'messages');
            console.log('📊 History data:', JSON.stringify(history, null, 2));
            
            if (history.length > 0 && !cancelled) {
              console.log('💾 Setting messages state with history');
              setMessages(history);
              setIsConnected(true);
            } else if (history.length === 0) {
              console.log('📭 No history found for this session (empty chat)');
            }
          } catch (err) {
            console.error('❌ Error loading history:', err);
            console.warn('⚠️ Could not load history (session may be new):', err);
            // Continue anyway - might be a new session or first connection
          }
        } else {
          console.log('📞 Creating new session...');
          const session = await chatApi.createSession();
          sessionId = session.session_id;
          console.log('✅ Session created:', sessionId);
          
          // Update URL with session_id
          if (!cancelled) {
            navigate(`/ai-chat?session_id=${sessionId}`, { replace: true });
          }
        }

        if (cancelled) return;

        // Create chat service
        const service = new ChatService(sessionId);
        chatServiceRef.current = service;

        // Connect to WebSocket
        console.log('🔌 Connecting to WebSocket...');
        await service.connect();
        
        if (cancelled) {
          console.log('⚠️ Component unmounted during connection, disconnecting...');
          service.disconnect();
          return;
        }
        
        console.log('✅ WebSocket connected');

        // Set up message handlers
        service.onMessage((type, message) => {
          console.log('📨 Received message:', type, message);
          
          switch (type) {
            case 'welcome':
              console.log('👋 Welcome message received');
              // Only add welcome message if this is a new session (no history)
              if (!isExistingSession) {
                setMessages([{
                  message_id: 'welcome',
                  role: 'assistant',
                  content: message.message,
                  timestamp: new Date().toISOString(),
                }]);
              }
              setIsConnected(true);
              console.log('✅ isConnected set to true');
              break;

            case 'thinking':
              setThinkingSteps(prev => [...prev, { step: message.step, timestamp: message.timestamp }]);
              break;

            case 'tool_call':
              if (message.status === 'completed') {
                setThinkingSteps(prev => 
                  prev.map((s, i) => i === prev.length - 1 ? { ...s, completed: true } : s)
                );
              }
              break;

            case 'response_chunk':
              setMessages(prev => {
                const lastMessage = prev[prev.length - 1];
                if (lastMessage && lastMessage.role === 'assistant' && !lastMessage.message_id.startsWith('final-')) {
                  return [
                    ...prev.slice(0, -1),
                    { ...lastMessage, content: lastMessage.content + message.content }
                  ];
                } else {
                  return [
                    ...prev,
                    {
                      message_id: 'streaming',
                      role: 'assistant',
                      content: message.content,
                      timestamp: new Date().toISOString(),
                    }
                  ];
                }
              });
              break;

            case 'response_complete':
              setThinkingSteps([]);
              setIsProcessing(false);
              setMessages(prev => {
                const lastMessage = prev[prev.length - 1];
                if (lastMessage && lastMessage.message_id === 'streaming') {
                  return [
                    ...prev.slice(0, -1),
                    { ...lastMessage, message_id: 'final-' + message.message_id, content: message.full_content }
                  ];
                }
                return prev;
              });
              break;

            case 'error':
              setError(message.message || 'An error occurred');
              setIsProcessing(false);
              setThinkingSteps([]);
              break;

            case 'history':
              setMessages(message.messages);
              break;
          }
        });

      } catch (err) {
        console.error('❌ Chat initialization error:', err);
        setError('Failed to initialize chat. Please refresh the page.');
        setIsConnected(false);
      }
    };

    initializeChat();

    // Cleanup function
    return () => {
      console.log('🧹 Cleaning up chat service...');
      cancelled = true;
      
      if (chatServiceRef.current) {
        chatServiceRef.current.disconnect();
        chatServiceRef.current = null;
      }
    };
  }, [searchParams, navigate]); // Re-run when session_id in URL changes

  const handleSendMessage = (message: string) => {
    const service = chatServiceRef.current;
    if (!service || isProcessing) return;

    try {
      // Add user message to UI
      const userMessage: ChatMessageType = {
        message_id: `user-${Date.now()}`,
        role: 'user',
        content: message,
        timestamp: new Date().toISOString(),
      };
      setMessages(prev => [...prev, userMessage]);

      // Send to backend
      service.sendMessage(message);
      setIsProcessing(true);
      setError('');
    } catch (err) {
      setError('Failed to send message. Please try again.');
      console.error('Send message error:', err);
      setIsProcessing(false);
    }
  };

  const handleNewChat = () => {
    // Cleanup current session
    if (chatServiceRef.current) {
      chatServiceRef.current.disconnect();
      chatServiceRef.current = null;
    }
    
    // Navigate to /ai-chat without session_id to create new session
    navigate('/ai-chat', { replace: true });
  };

  return (
    <Box sx={{ minHeight: '100vh', background: theme.colors.background.default, paddingBottom: '20px' }}>
      {/* Header - Minimizes when chat starts */}
      <Box
        sx={{
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          padding: isHeaderMinimized ? '16px 24px' : '40px 24px',
          marginBottom: '0',
          position: 'relative',
          transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
        }}
      >
        <Container maxWidth="lg">
          <Box sx={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: isHeaderMinimized ? '12px' : '16px', 
            justifyContent: isHeaderMinimized ? 'flex-start' : 'center',
            position: 'relative',
            transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
          }}>
            {/* New Chat Button - positioned absolutely on the right */}
            <Button
              variant="contained"
              startIcon={<Add />}
              onClick={handleNewChat}
              sx={{
                position: 'absolute',
                right: 0,
                background: 'rgba(255, 255, 255, 0.2)',
                color: '#ffffff',
                '&:hover': {
                  background: 'rgba(255, 255, 255, 0.3)',
                },
                backdropFilter: 'blur(10px)',
                borderRadius: '8px',
                textTransform: 'none',
                fontWeight: 600,
                fontSize: isHeaderMinimized ? '13px' : '14px',
                padding: isHeaderMinimized ? '6px 12px' : '8px 16px',
                transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
              }}
            >
              New Chat
            </Button>

            <SmartToy sx={{ 
              fontSize: isHeaderMinimized ? '32px' : '48px',
              color: '#ffffff',
              transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
            }} />
            <Box>
              <Typography
                sx={{
                  fontSize: isHeaderMinimized ? '20px' : '32px',
                  fontWeight: 700,
                  color: '#ffffff',
                  marginBottom: isHeaderMinimized ? '0' : '8px',
                  transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                }}
              >
                AI College Counselor
              </Typography>
              {!isHeaderMinimized && (
                <Typography sx={{ 
                  fontSize: '16px', 
                  color: 'rgba(255, 255, 255, 0.9)',
                  transition: 'opacity 0.3s ease-in-out',
                }}>
                  Get personalized guidance for your KCET college admissions
                </Typography>
              )}
            </Box>
          </Box>
        </Container>
      </Box>

      {/* Chat Container */}
      <Container maxWidth="lg" sx={{ marginTop: '-20px' }}>
        <Paper
          elevation={3}
          sx={{
            height: '600px',
            display: 'flex',
            flexDirection: 'column',
            borderRadius: '16px',
            overflow: 'hidden',
            border: '1px solid #e5e7eb',
          }}
        >
          {/* Messages Area */}
          <Box
            sx={{
              flex: 1,
              overflowY: 'auto',
              padding: '24px',
              background: '#f9fafb',
              display: 'flex',
              flexDirection: 'column',
            }}
          >
            {error && (
              <Alert severity="error" sx={{ marginBottom: '16px' }}>
                {error}
              </Alert>
            )}

            {/* Example Questions - Show when no messages */}
            {!hasChatStarted && (
              <Box
                sx={{
                  flex: 1,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '24px',
                  padding: '40px 20px',
                  transition: 'opacity 0.3s ease-in-out',
                }}
              >
                <Typography
                  sx={{
                    fontSize: '24px',
                    fontWeight: 600,
                    color: '#374151',
                    textAlign: 'center',
                    marginBottom: '8px',
                  }}
                >
                  👋 Welcome! Ask me anything
                </Typography>
                <Typography
                  sx={{
                    fontSize: '14px',
                    color: '#6b7280',
                    textAlign: 'center',
                    marginBottom: '24px',
                  }}
                >
                  Try these example questions:
                </Typography>

                <Box
                  sx={{
                    display: 'grid',
                    gridTemplateColumns: { xs: '1fr', md: '1fr 1fr 1fr' },
                    gap: '16px',
                    width: '100%',
                    maxWidth: '900px',
                  }}
                >
                  {[
                    {
                      icon: '🎯',
                      title: 'Find Colleges',
                      question: 'I got rank 5000, which colleges can I get?',
                    },
                    {
                      icon: '💻',
                      title: 'Branch Options',
                      question: 'Show me computer science colleges',
                    },
                    {
                      icon: '📊',
                      title: 'Compare Cutoffs',
                      question: 'What are the cutoff trends for Round 2?',
                    },
                  ].map((example, index) => (
                    <Paper
                      key={index}
                      elevation={1}
                      onClick={() => handleSendMessage(example.question)}
                      sx={{
                        padding: '20px',
                        borderRadius: '12px',
                        cursor: 'pointer',
                        transition: 'all 0.2s ease-in-out',
                        border: '1px solid #e5e7eb',
                        '&:hover': {
                          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
                          transform: 'translateY(-2px)',
                          borderColor: '#667eea',
                        },
                      }}
                    >
                      <Box sx={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <Typography sx={{ fontSize: '24px' }}>{example.icon}</Typography>
                          <Typography
                            sx={{
                              fontSize: '14px',
                              fontWeight: 600,
                              color: '#374151',
                            }}
                          >
                            {example.title}
                          </Typography>
                        </Box>
                        <Typography
                          sx={{
                            fontSize: '13px',
                            color: '#6b7280',
                            lineHeight: 1.5,
                          }}
                        >
                          "{example.question}"
                        </Typography>
                      </Box>
                    </Paper>
                  ))}
                </Box>
              </Box>
            )}

            {messages.map((msg) => (
              <ChatMessage key={msg.message_id} message={msg} />
            ))}

            {thinkingSteps.length > 0 && (
              <ThinkingIndicator steps={thinkingSteps} />
            )}

            <div ref={messagesEndRef} />
          </Box>

          {/* Input Area */}
          <ChatInput
            onSendMessage={handleSendMessage}
            disabled={isProcessing || !isConnected}
            placeholder={
              !isConnected
                ? 'Connecting...'
                : isProcessing
                ? 'AI is thinking...'
                : 'Ask me anything about KCET colleges...'
            }
          />
        </Paper>

        {/* Info Cards */}
        <Box
          sx={{
            marginTop: '24px',
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
            gap: '16px',
          }}
        >
          <Paper sx={{ padding: '16px', borderRadius: '12px' }}>
            <Typography sx={{ fontSize: '14px', fontWeight: 600, marginBottom: '8px', color: '#4F46E5' }}>
              💡 Example Questions
            </Typography>
            <Typography sx={{ fontSize: '13px', color: '#6b7280', lineHeight: 1.6 }}>
              • "I got rank 5000, which colleges can I get?"
              <br />
              • "Show me computer science colleges"
              <br />
              • "What are the cutoff trends for Round 2?"
            </Typography>
          </Paper>

          <Paper sx={{ padding: '16px', borderRadius: '12px' }}>
            <Typography sx={{ fontSize: '14px', fontWeight: 600, marginBottom: '8px', color: '#4F46E5' }}>
              🎯 What I Can Do
            </Typography>
            <Typography sx={{ fontSize: '13px', color: '#6b7280', lineHeight: 1.6 }}>
              • Find colleges based on your rank
              <br />
              • Filter by branches and preferences
              <br />
              • Compare cutoffs across rounds
              <br />
              • Provide counselling strategy
            </Typography>
          </Paper>

          <Paper sx={{ padding: '16px', borderRadius: '12px' }}>
            <Typography sx={{ fontSize: '14px', fontWeight: 600, marginBottom: '8px', color: '#4F46E5' }}>
              ⚡ Smart Features
            </Typography>
            <Typography sx={{ fontSize: '13px', color: '#6b7280', lineHeight: 1.6 }}>
              • Real-time data from KCET 2024
              <br />
              • Conversational memory
              <br />
              • Intelligent branch filtering
              <br />
              • Transparent thinking process
            </Typography>
          </Paper>
        </Box>
      </Container>
    </Box>
  );
};

export default AIChat;
