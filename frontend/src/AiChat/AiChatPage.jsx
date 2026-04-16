import styles from './AiChatPage.module.css';
import AiChatIcon from '../assets/ai-chat.svg?react';
import VertIcon from '../assets/vertical-dots.svg?react';
import React, { useRef, useState, useEffect } from 'react';
import Draggable from 'react-draggable';
import IconButton from '@mui/material/IconButton';
import CloseIcon from '@mui/icons-material/Close';
import SendIcon from '@mui/icons-material/Send';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import TextField from '@mui/material/TextField';
import CircularProgress from '@mui/material/CircularProgress';
import { useAiChat, sides } from '../hooks/useAiChat';

export function AiChatPage() {
  const ref = useRef();
  const scrollRef = useRef();
  const [open, setOpen] = useState(false);
  const { messages, message, setMessage, loading, sendMessage, clearMessages } = useAiChat();

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, loading]);

  const handleSend = () => {
    if (message.trim() === '' || loading) return;
    sendMessage();
  };

  return (
    <Draggable bounds='parent' nodeRef={ref} cancel='.no-drag'>
      <div ref={ref} className={styles.chatWrapper}>
        
        {!open ? (
          <div className={`${styles.chatBtn} drag-handle`}>
            <VertIcon height='20px' width='20px' style={{ color: '#64748b' }} />
            <IconButton 
              className="no-drag"
              onClick={() => setOpen(true)} 
              sx={{ padding: '8px', color: '#2563eb' }}
            >
              <AiChatIcon height='28px' width='28px' />
            </IconButton>
          </div>
        ) : (
          <div className={styles.chatDisplay}>
            
            <div className={`${styles.header} drag-handle`}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <VertIcon height='16px' width='16px' style={{ color: '#94a3b8' }} />
                <span style={{ fontWeight: 600, color: '#1e293b' }}>Gemini AI</span>
              </div>
              <div style={{ display: 'flex', gap: '4px' }} className="no-drag">
                <IconButton 
                  size='small' 
                  onClick={clearMessages}
                  disabled={loading || messages.length === 0}
                  title="Clear chat"
                >
                  <DeleteOutlineIcon fontSize="small" />
                </IconButton>
                <IconButton size='small' onClick={() => setOpen(false)}>
                  <CloseIcon fontSize="small" />
                </IconButton>
              </div>
            </div>

            <div className={`${styles.messageCtn} no-drag`} ref={scrollRef}>
              {messages.length === 0 && (
                <div className={styles.emptyState}>
                  How can I help you today?
                </div>
              )}
              
              {messages.map((msg, i) => {
                const isUser = msg.side === sides.user;
                return (
                  <div key={i} className={`${styles.bubbleRow} ${isUser ? styles.rowUser : styles.rowAi}`}>
                    <div className={`${styles.bubble} ${isUser ? styles.bubbleUser : styles.bubbleAi}`}>
                      {msg.text}
                    </div>
                  </div>
                );
              })}

              {loading && (
                <div className={`${styles.bubbleRow} ${styles.rowAi}`}>
                  <div className={`${styles.bubble} ${styles.bubbleAi}`} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <CircularProgress size={14} thickness={5} sx={{ color: '#64748b' }} />
                    <span style={{ fontSize: '0.85rem', color: '#64748b' }}>Thinking...</span>
                  </div>
                </div>
              )}
            </div>

            <div className={`${styles.inputArea} no-drag`}>
              <TextField 
                fullWidth 
                multiline
                maxRows={4}
                size='small' 
                placeholder='Ask Gemini...' 
                value={message}
                onChange={ev => setMessage(ev.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSend();
                  }
                }}
                disabled={loading}
                sx={{ 
                  "& .MuiOutlinedInput-root": { 
                    borderRadius: "12px",
                    backgroundColor: "#f1f5f9",
                    fontFamily: "'DM Sans', sans-serif",
                    fontSize: "0.9rem",
                    padding: "8px 12px",
                    "& fieldset": { border: "none" }
                  } 
                }}
              />
              <ChatSendButton onClick={handleSend} disabled={message.trim() === '' || loading} />
            </div>
          </div>
        )}
      </div>
    </Draggable>
  );
}

function ChatSendButton({ onClick, disabled }) {
  const [isHover, setIsHover] = React.useState(false);
  const [isActive, setIsActive] = React.useState(false);

  const style = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: '40px',
    height: '40px',
    borderRadius: '24px',
    border: 'none',
    cursor: disabled ? 'not-allowed' : 'pointer',
    background: disabled ? '#f1f5f9' : (isHover ? '#1d4ed8' : '#2563eb'),
    color: disabled ? '#cbd5e1' : 'white',
    transition: 'all 0.2s ease',
    transform: isActive ? 'scale(0.95)' : (isHover ? 'translateY(-1px)' : 'none'),
    boxShadow: isHover && !disabled ? '0 4px 12px rgba(37, 99, 235, 0.25)' : 'none',
  };

  return (
    <button
      style={style}
      onClick={onClick}
      disabled={disabled}
      onMouseEnter={() => setIsHover(true)}
      onMouseLeave={() => { setIsHover(false); setIsActive(false); }}
      onMouseDown={() => setIsActive(true)}
      onMouseUp={() => setIsActive(false)}
    >
      <SendIcon sx={{ fontSize: '1.1rem', ml: '2px' }} />
    </button>
  );
}