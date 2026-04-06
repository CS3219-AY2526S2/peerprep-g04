import styles from './CollabPage.module.css';
import { useEffect, useState, useRef, useContext } from 'react';
import { get_question_by_id } from '../hooks/useQuestionService';
import Chip from '@mui/material/Chip';
import Editor from '@monaco-editor/react';
import Typography from '@mui/material/Typography';
import * as Y from 'yjs';
import { MonacoBinding } from "y-monaco";
import { WebsocketProvider } from "y-websocket";
import Markdown from 'react-markdown';
import { UserContext } from '../hooks/useUserService.jsx';
import IconButton from '@mui/material/IconButton';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import { useCodeExecution } from '../hooks/useCodeExecution.jsx';
import { MatchHeader } from '../components/MatchHeader.jsx';

function Output(props) {
  const { loading, open, setOpen, output } = props;

  function whatPage() {
    if (loading) {
      return (
        <div className={styles.terminalSpinner}>
          <div className={styles.spinner}></div>
        </div>
      )
    } 
    
    else {
      return (
        <div className={styles.terminalBody}>
          <code>{output}</code>
        </div>
      )
    }
  }

  return (
    <div className={styles.terminal}>
      <div className={styles.terminalHeader}>
        <Typography sx={{fontSize: '16px'}}>Terminal</Typography>
        <IconButton onClick={() => setOpen(!open)} sx={{height: '24px', width: '24px'}}>
          {open ? <KeyboardArrowDownIcon /> : <KeyboardArrowUpIcon />} 
        </IconButton>
      </div>
      {open && whatPage()}
    </div>
  )
}

export function CollabPage(props) {
  const { stateData, onLeave } = props;
  const { question_id, match_id } = stateData;
  const [question, setQuestion] = useState({});
  const { title = '', difficulty = [], tags = [], body = '' } = question;
  const { accessToken } = useContext(UserContext);
  const { user } = useContext(UserContext);

  const { 
    lang, 
    setLang,
    loading,
    open,
    setOpen, 
    output,
    outputErr,
    runCode,
  } = useCodeExecution(); 
  const editorRef = useRef();

  useEffect(() => {
    get_question_by_id(question_id).then(q => q && setQuestion(q));
  }, [question_id]);

  function handleEditorDidMount(editor) {
    editorRef.current = editor;
    const yDoc = new Y.Doc();
    
    const provider = new WebsocketProvider(
      `ws://${import.meta.env.VITE_COLLAB_SERVICE_API}?token=${accessToken}`, match_id.toString(), yDoc
    );

    provider.awareness.setLocalStateField('user', {
      name: user?.username || 'Anonymous',
    });
    
    const yText = yDoc.getText("monaco");
  
    new MonacoBinding(
      yText, editorRef.current.getModel(), new Set([editorRef.current]), provider.awareness
    );           
  }
``
  return (
    <div className={styles.main}>
      <MatchHeader
        lang={lang}
        setLang={setLang}
        onRun={() => runCode(editorRef.current?.getValue())}
        onLeave={onLeave}
        loading={loading}
        showRun={true}
      />

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
            options={{ minimap: { enabled: false } }}
            onMount={handleEditorDidMount}
          />
        </div>

        <Output loading={loading} open={open} setOpen={setOpen} output={output} outputErr={outputErr} />
      </div>
    </div>
  )
}