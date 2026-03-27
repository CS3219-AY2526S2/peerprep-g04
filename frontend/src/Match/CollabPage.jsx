import Button from '@mui/material/Button';
import styles from './CollabPage.module.css';
import { useEffect, useState, useRef, useContext } from 'react';
import { get_question_by_id } from '../hooks/useQuestionService';
import Chip from '@mui/material/Chip';
import Editor from '@monaco-editor/react'
import Typography from '@mui/material/Typography';
import * as Y from 'yjs';
import { MonacoBinding } from "y-monaco"
import { WebsocketProvider } from "y-websocket";
import Markdown from 'react-markdown';
import { UserContext } from '../hooks/useUserService.jsx'
import IconButton from '@mui/material/IconButton';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import { languages, useCodeExecution } from '../hooks/useCodeExecution.jsx';

const diffToColor = {
  easy: { backgroundColor: '#16a34a', color: 'green' },
  medium: { backgroundColor: '#d97706', color: 'orange' },
  hard: { backgroundColor: '#dc2626', color: 'red' }
};

function Output(props) {
  const { open, setOpen, output, outputErr } = props;
  
  return (
    <div className={styles.terminal}>
      <div className={styles.terminalHeader}>
        <Typography sx={{fontSize: '16px'}}>Terminal</Typography>
        <IconButton onClick={ev => setOpen(!open)} sx={{height: '24px', width: '24px'}}>
          {open ? <KeyboardArrowDownIcon /> : <KeyboardArrowUpIcon />} 
        </IconButton>
      </div>
      {open && 
        <div className={styles.terminalBody}>
         <code>{output}</code>
        </div>
      }
    </div>
  )
}

export function CollabPage(props) {
  const { stateData, onLeave, setShowHeader } = props;
  const { question_id, match_id } = stateData;
  const [question, setQuestion] = useState({});
  const { title = '', difficulty = [], tags = [], body = '' } = question;
  const { accessToken } = useContext(UserContext);

  const { 
    lang, 
    setLang,
    open,
    setOpen, 
    output,
    outputErr,
    runCode,
  } = useCodeExecution(); 
  const editorRef = useRef();

  // remove the old header
  useEffect(() => {
    setShowHeader(false);
  }, []);

  useEffect(() => {
    get_question_by_id(question_id).then(q => q && setQuestion(q));
  }, [question_id]);

  function handleEditorDidMount(editor, monaco) {
    console.log('editor mounts');
    editorRef.current = editor;
    const yDoc = new Y.Doc();
    
    const provider = new WebsocketProvider(
      `ws://localhost:3003?token=${accessToken}`, match_id.toString(), yDoc
    );
    
    const yText = yDoc.getText("monaco");
  
    const binding = new MonacoBinding(
      yText, editorRef.current.getModel(), new Set([editorRef.current]), provider.awareness
    );           
  }

  return (
    <div className={styles.main}>
      <div className={styles.header}>
        <FormControl size='small' sx={{width: '120px'}}>
          <InputLabel id="language-select-label">Code</InputLabel>
          <Select 
            labelId="language-select-label"
            label="Code"
            value={lang} 
            onChange={ev => setLang(ev.target.value)}
          >
            <MenuItem value={languages.javascript}>Javascript</MenuItem>
            <MenuItem value={languages.python}>Python</MenuItem>
          </Select>
        </FormControl>

        <Button 
          variant='outlined' 
          size='medium' 
          onClick={ev => runCode(editorRef.current?.getValue())}
        >
            Run
        </Button>
        
        <Button variant='outlined' size='medium' onClick={ev => onLeave()}>
          Leave
        </Button>
      </div>

      <div className={styles.body}>
        <div className={styles.bodyLeft}>
          <div className={styles.bodyLeftHeader}>
            <Typography variant='h4'>{title}</Typography>
            <Chip size='small' variant='outlined' label={difficulty} />
            <div style={{display: 'flex', gap: '4px'}}>
              {tags.map(tag => <Chip key={tag} size='small' label={tag} />)}
            </div>
          </div>
          
          <Markdown>{body}</Markdown>
        </div>

        <div className={styles.bodyRight}>
          <Editor
            theme='vs-dark'
            language={lang}
            options={{
              minimap: { enabled: false }
            }}
            onMount={handleEditorDidMount}
          />
        </div>

        <Output open={open} setOpen={setOpen} output={output} outputErr={outputErr} />
      </div>
    </div>
  )
}