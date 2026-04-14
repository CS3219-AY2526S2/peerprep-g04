import React, { useRef, useState, useEffect } from "react";
import TextField from "@mui/material/TextField";
import SendIcon from '@mui/icons-material/Send';

export function ChatPanel({ user, messages, sendMessage }) {
  const [message, setMessage] = useState('');
  const scrollRef = useRef();

  const styles = {
    container: {
      display: 'flex',
      flexDirection: 'column',
      height: '100%',
      width: '100%',
      backgroundColor: '#ffffff',
      borderRadius: '16px',
      overflow: 'hidden',
    },

    messagesList: {
      flex: 1,
      minHeight: 0,
      display: 'flex',
      flexDirection: 'column',
      gap: '12px',
      padding: '16px',
      overflowY: 'auto',
      backgroundColor: '#f8fafc',
    },

    emptyState: {
      textAlign: 'center', 
      color: '#94a3b8', 
      marginTop: '20px', 
      fontSize: '0.85rem',
      fontFamily: "'DM Sans', sans-serif"
    },

    messageRow: (isMe) => ({
      alignSelf: isMe ? 'flex-end' : 'flex-start',
      display: 'flex',
      flexDirection: 'column',
      alignItems: isMe ? 'flex-end' : 'flex-start',
      maxWidth: '75%',
    }),

    senderName: {
      fontSize: '0.7rem',
      color: '#64748b',
      marginBottom: '4px',
      marginLeft: '8px',
      fontFamily: "'DM Sans', sans-serif",
    },

    bubble: (isMe) => ({
      padding: '10px 16px',
      fontSize: '0.9rem',
      borderRadius: '18px',
      overflowWrap: 'break-word',
      fontFamily: "'DM Sans', sans-serif",
      boxShadow: '0 2px 4px rgba(0,0,0,0.02)',
      backgroundColor: isMe ? '#2563eb' : '#ffffff',
      color: isMe ? 'white' : '#1e293b',
      border: isMe ? 'none' : '1.5px solid #e2e8f0',
      borderBottomRightRadius: isMe ? '4px' : '18px',
      borderBottomLeftRadius: isMe ? '18px' : '4px',
      maxWidth: '100%',
      whiteSpace: 'pre-wrap',
    }),

    inputArea: {
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
      padding: '12px',
      background: 'white',
      borderTop: '1px solid #f1f5f9',
      flexShrink: 0,
    }
  };

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = () => {
    if (message.trim() === '') return;
    sendMessage(message);
    setMessage('');
  };

  return (
    <div style={styles.container}>
      {/* MESSAGES AREA */}
      <div style={styles.messagesList} ref={scrollRef}>
        {messages.length === 0 && (
          <div style={styles.emptyState}>
            No messages yet. Start collaborating!
          </div>
        )}
        
        {messages.map((msg, i) => {
          const isMe = msg.username === user?.username;
          return (
            <div key={i} style={styles.messageRow(isMe)}>
              {!isMe && <span style={styles.senderName}>{msg.username}</span>}
              <div style={styles.bubble(isMe)}>
                {msg.message}
              </div>
            </div>
          );
        })}
      </div>
      
      {/* INPUT AREA */}
      <div style={styles.inputArea}>
        <TextField 
          multiline
          fullWidth 
          size='small' 
          placeholder='Type a message...' 
          value={message}
          autoComplete="off"
          onChange={ev => setMessage(ev.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              handleSend();
            }
          }}
          sx={{ 
            "& .MuiOutlinedInput-root": { 
              borderRadius: "12px",
              backgroundColor: "#f1f5f9",
              fontFamily: "'DM Sans', sans-serif",
              fontSize: "0.9rem",
              "& fieldset": { border: "none" }
            } 
          }}
        />
        <ChatSendButton onClick={handleSend} disabled={message.trim() === ''} />
      </div>
    </div>
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
      <SendIcon sx={{ fontSize: '1.1rem' }} />
    </button>
  );
}