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

export function AiChatPage() {
  const ref = useRef();
  const [open, setOpen] = useState(false);
  const { messages, message, setMessage } = useAiChat();

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
            <VertIcon className='drag-handle' height='16px' width='16px' style={{cursor: 'grab'}}/>
            <div style={{marginRight: 'auto'}}>Gemini</div>
            <IconButton onClick={ev => setOpen(!open)}>
              <CloseIcon />
            </IconButton>
          </div>
          <div>
            <TextField fullWidth size='small' multiline placeholder='Type a message...'/>
            <Button variant='outlined'>Send</Button>
          </div>
        </div>
      )
    }
  }

  return (
    <Draggable
      handle='.drag-handle'
      bounds='parent'
      nodeRef={ref}
    >
     {whatPage()}
    </Draggable>
  )
}