import styles from './AiChatPage.module.css';
import AiChatIcon from '../assets/ai-chat.svg?react';
import Draggable from 'react-draggable';
import { useRef } from 'react';
import VertIcon from '../assets/vertical-dots.svg?react';
import { useState } from 'react';
import IconButton from '@mui/material/IconButton';
import CloseIcon from '@mui/icons-material/Close';
import { useAiChat } from '../hooks/useAiChat';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import { sides } from '../hooks/useAiChat';

export function AiChatPage() {
  const ref = useRef();
  const [open, setOpen] = useState(false);
  const { messages, message, setMessage, loading, sendMessage, clearMessages } = useAiChat();

  function whatPage() {
    if (!open) {
      return (
        <div ref={ref} className={styles.chatBtn}>
          <VertIcon className='drag-handle' height='16px' width='16px' style={{cursor: 'grab'}}/>
          <AiChatIcon height='32px' width='32px' onClick={ev => setOpen(!open)} />
        </div>
      )
    } 
    
    else {
      return (
        <div ref={ref} className={styles.chatDisplay}>
          <div>
            <div>•</div>
            <div style={{marginRight: 'auto'}}>Gemini</div>
            <Button 
              variant='outlined' 
              size='small' 
              onClick={ev => clearMessages()}
              disabled={loading}
            >
              Clear
            </Button>
            <IconButton onClick={ev => setOpen(!open)}>
              <CloseIcon />
            </IconButton>
          </div>
          <div className={styles.messageCtn}>
            {messages.map((message, i) => {
              if (message.side === sides.ai) {
                return <div key={i} className={styles.ai}>{message.text}</div>
              } else {
                return <div key={i} className={styles.user}>{message.text}</div>
              }
            })}
          </div>
          <div className='no-drag'>
            <TextField 
              fullWidth 
              size='small' 
              multiline 
              placeholder='Type a message...' 
              value={message}
              onChange={ev => setMessage(ev.target.value)}
            />
            <Button loading={loading} variant='outlined' onClick={ev => sendMessage()}>
              Send
            </Button>
          </div>
        </div>
      )
    }
  }

  return (
    <Draggable
      bounds='parent'
      nodeRef={ref}
      cancel='.no-drag'
    >
     {whatPage()}
    </Draggable>
  )
}