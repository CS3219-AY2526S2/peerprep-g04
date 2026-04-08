import styles from './CollabPage.module.css';
import { useEffect, useState, useRef, useContext } from 'react';
import { get_question_by_id } from '../hooks/useQuestionService';
import Chip from '@mui/material/Chip';
import Editor from '@monaco-editor/react';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
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

const diffToColor = {
  easy: { backgroundColor: '#16a34a', color: 'green' },
  medium: { backgroundColor: '#d97706', color: 'orange' },
  hard: { backgroundColor: '#dc2626', color: 'red' }
};

function Loading() {
  return (
    <div className={styles.terminalSpinner}>
      <div className={styles.spinner}></div>
    </div>
  )
}

function Output(props) {
  const { loading, open, setOpen, output, outputErr, testStatus } = props;

  return (
    <div className={styles.terminal}>
      <div className={styles.terminalHeader}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <Typography sx={{fontSize: '16px'}}>Terminal</Typography>
          {testStatus === 'Passed' && <Chip size="small" label="Passed" color="success" />}
          {testStatus === 'Failed' && <Chip size="small" label="Failed" color="error" />}
          {testStatus === 'Error' && <Chip size="small" label="Error" color="warning" />}
        </div>
        <IconButton onClick={() => setOpen(!open)} sx={{height: '24px', width: '24px'}}>
          {open ? <KeyboardArrowDownIcon /> : <KeyboardArrowUpIcon />} 
        </IconButton>
      </div>
      {open && (
        <div className={styles.terminalBody}>
          {loading ? (
            <div className={styles.spinner}></div>
          ) : (
            <code style={{ color: outputErr ? '#ef4444' : 'inherit' }}>{output}</code>
          )}
        </div>
      )}
    </div>
  )
}

export function CollabPage(props) {
  const { stateData, onLeave } = props;
  const { question_id, match_id } = stateData;
  const [question, setQuestion] = useState({});
  const { title = '', difficulty = [], tags = [], body = '' } = question;
  const { accessToken } = useContext(UserContext);

  const { 
    lang, 
    setLang,
    loading,
    open,
    setOpen, 
    output,
    outputErr,
    testStatus,
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
      `ws://localhost:3003?token=${accessToken}`, match_id.toString(), yDoc
    );
    
    const yText = yDoc.getText("monaco");
  
    new MonacoBinding(
      yText, editorRef.current.getModel(), new Set([editorRef.current]), provider.awareness
    );          
  }

  const testCaseInput = question.test_case_input || question.test_case?.input || '';
  const testCaseOutput = question.test_case_output || question.test_case?.expected_output || '';

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
        <div className={styles.bodyLeft} style={{ display: 'flex', flexDirection: 'column' }}>
          <div style={{ flexGrow: 1, overflowY: 'auto' }}>
            <div className={styles.bodyLeftHeader}>
              <Typography variant='h4'>{title}</Typography>
              <Chip size='small' variant='outlined' label={difficulty} />
              <div style={{display: 'flex', gap: '4px'}}>
                {tags.map(tag => <Chip key={tag} size='small' label={tag} />)}
              </div>
            </div>
            
            <Markdown>{body}</Markdown>
          </div>

          {/* --- Test Case --- */}
          {testCaseInput && (
            <div style={{
              marginTop: '1rem',
              padding: '1rem',
              borderTop: '1px solid #e0e0e0',
              backgroundColor: '#fafafa',
              borderRadius: '8px'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                <Typography variant='h6' sx={{ fontSize: '1.1rem', fontWeight: 'bold' }}>Test Case</Typography>
                <Button 
                  variant="contained" 
                  color="primary" 
                  size="small" 
                  startIcon={<PlayArrowIcon />}
                  disabled={loading}
                  // pass in input and output
                  onClick={() => runCode(editorRef.current?.getValue(), testCaseInput, testCaseOutput)}
                >
                  {loading ? 'Running...' : 'Run Test'}
                </Button>
              </div>

              <div style={{ fontSize: '0.9rem', marginBottom: '0.5rem' }}>
                <strong>Input (stdin):</strong>
                <pre style={{ margin: '4px 0', padding: '8px', backgroundColor: '#eee', borderRadius: '4px', overflowX: 'auto' }}>
                  {testCaseInput}
                </pre>
              </div>

              <div style={{ fontSize: '0.9rem' }}>
                <strong>Expected Output:</strong>
                <pre style={{ margin: '4px 0', padding: '8px', backgroundColor: '#eee', borderRadius: '4px', overflowX: 'auto' }}>
                  {testCaseOutput}
                </pre>
              </div>
            </div>
          )}
          {/* --- Test Case --- */}

        </div>

        <div className={styles.bodyRight}>
          <Editor
            theme='vs-dark'
            language={lang}
            options={{ minimap: { enabled: false } }}
            onMount={handleEditorDidMount}
          />
        </div>

        <Output 
          loading={loading} 
          open={open} 
          setOpen={setOpen} 
          output={output} 
          outputErr={outputErr} 
          testStatus={testStatus} 
        />
      </div>
    </div>
  )
}