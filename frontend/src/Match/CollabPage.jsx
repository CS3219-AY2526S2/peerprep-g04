import styles from './CollabPage.module.css';
import { useEffect, useState, useRef, useContext } from 'react';
import { toast } from 'react-toastify';
import { get_question_by_id } from '../hooks/useQuestionService';
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
import { Card } from '../components/Card.jsx';
import { Tabs } from '../components/Tabs.jsx';
import { Tag } from '../components/Tag.jsx';
import { Table } from '../components/Table.jsx';
import { ChatPage } from './ChatPage.jsx';
import { useChatService } from '../hooks/useChatService.jsx';

const formatLanguage = {
  "javascript": "JavaScript",
  "python": "Python",
};

function formatDateTime(dateString) {
  const d = new Date(dateString);
  
  const datePart = d.toLocaleDateString('en-GB', { 
    day: '2-digit', 
    month: 'short', 
    year: 'numeric' 
  });
  
  const timePart = d.toLocaleTimeString('en-GB', { 
    hour: '2-digit', 
    minute: '2-digit', 
    second: '2-digit', 
    hour12: false 
  });

  return `${datePart}, ${timePart}`;
}

function Output(props) {
  const { loading, open, setOpen, output, outputErr, testStatus } = props;

  return (
    <div className={styles.terminal}>
      <div className={styles.terminalHeader}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <span>Terminal</span>
          <Tag
            key={testStatus}
            text={testStatus}
            color={testStatus === 'Passed' ? 'green' : 'red'}
          />
        </div>
        <IconButton onClick={() => setOpen(!open)} sx={{ height: '24px', width: '24px' }}>
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
  );
}

export function CollabPage(props) {
  const { stateData, onLeave } = props;
  const { question_id, match_id } = stateData;

  const [question, setQuestion] = useState({});
  const [tab, setTab] = useState("Description");
  const [submissions, setSubmissions] = useState([]);

  const { title = '', difficulty = '', tags = [], body = '' } = question;
  const { user, accessToken, get_question_attempts, createSubmission } = useContext(UserContext);

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

  const [openChat, setOpenChat] = useState(false);
  const { messages, sendMessage, leave } = useChatService(user, match_id);

  const editorRef = useRef();
  const yTextRef = useRef();

  useEffect(() => {
    get_question_by_id(question_id).then(q => q && setQuestion(q));
    get_question_attempts(question_id).then(history => setSubmissions(history || []));
  }, [question_id]);

  function handleEditorDidMount(editor) {
    editorRef.current = editor;

    const yDoc = new Y.Doc();

    const provider = new WebsocketProvider(
      `ws://${import.meta.env.VITE_COLLABORATION_SERVICE_API}?token=${accessToken}`,
      match_id.toString(),
      yDoc
    );

    provider.awareness.setLocalStateField('user', {
      name: user?.username || 'Anonymous',
    });
    
    const yText = yDoc.getText("monaco");
    yTextRef.current = yText;

    new MonacoBinding(
      yText,
      editorRef.current.getModel(),
      new Set([editorRef.current]),
      provider.awareness
    );
  }

  const loadSubmission = (code) => {
    if (!yTextRef.current) return;
    
    const currentLength = yTextRef.current.length;
    yTextRef.current.delete(0, currentLength);
    yTextRef.current.insert(0, code);
  };

  const handleSubmit = async () => {
    const currentCode = editorRef.current?.getValue();
    if (!currentCode) {
      toast("Code editor is empty!", { type: "error" });
      return;
    }

    const submissionData = {
      user_id: user.user_id,
      question_id: question_id,
      lang: lang,
      code: currentCode,
      status: 'Accepted' // hardcoded
    };

    const newSubmission = await createSubmission(submissionData);
    
    if (newSubmission) {
      setSubmissions(prev => [newSubmission, ...prev]);
      setTab("Submissions");
    }
  };

  function myLeave() {
    onLeave();
    leave();
  }

  const testCaseInput = question.test_case_input || question.test_case?.input || '';
  const testCaseOutput = question.test_case_output || question.test_case?.expected_output || '';

  return (
    <div className={styles.main}>
      <MatchHeader
        lang={lang}
        setLang={setLang}
        onRun={() => runCode(editorRef.current?.getValue())}
        onSubmit={handleSubmit}
        onLeave={myLeave}
        loading={loading}
        showRun={true}
        showChat={true}
        onOpenChat={() => setOpenChat(open => !open)}
      />

      <div className={styles.body}>
        {/* LEFT SIDE */}
        <div className={styles.bodyLeft}>
          <Card
            title={title}
            badge={false}
            className={styles.cardContainer}
            titleStyle={{
              fontSize: "1.5rem",
              fontWeight: 700,
              color: "#111827",
              textTransform: "none",
              letterSpacing: "-0.01em",
            }}
          >
            <div className={styles.tagRow}>
              {difficulty && (
                <Tag
                  key={difficulty}
                  text={difficulty}
                  color={difficulty === 'easy' ? 'green' : difficulty === 'medium' ? 'yellow' : 'red'}
                />
              )}
              {tags.map((t) => (
                <Tag key={t} text={t} />
              ))}
            </div>
          
            <Tabs
              tabs={["Description", "Submissions", "Test Case"]}
              active={tab}
              onChange={setTab}
            />

            <div className={styles.tabContent}>
              {tab === "Description" && (
                <div className={styles.markdownWrapper}>
                  <Markdown>{body}</Markdown>
                </div>
              )}

              {tab === "Submissions" && (
                <Table 
                   style={{ border: 'none', boxShadow: 'none', padding: 0 }} 
                   emptyMessage="No previous attempts for this question."
                >
                  <table>
                    <thead>
                      <tr>
                        <th>Date</th>
                        <th>Language</th>
                        <th>Status</th>
                        <th>&nbsp;</th>
                      </tr>
                    </thead>
                    <tbody>
                      {submissions.map((s, idx) => (
                        <tr key={idx}>
                          <td>{formatDateTime(s.submitted_at)}</td>
                          <td>{formatLanguage[s.lang] || s.lang}</td>
                          <td style={{ color: s.status === 'Accepted' ? '#16a34a' : '#d97706' }}>
                            {s.status}
                          </td>
                          <td>
                            <button 
                              className={styles.loadBtn}
                              onClick={() => loadSubmission(s.code)}
                            >
                              Load
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </Table>
              )}

              {tab === "Test Case" && testCaseInput && (
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
            </div>
          </Card>
        </div>

        {/* RIGHT SIDE */}
        <div className={styles.bodyRight}>
          <div className={styles.editorContainer}>
            <Editor
              theme="vs-dark"
              language={lang}
              options={{ minimap: { enabled: false }, padding: { top: 12 }, }}
              onMount={handleEditorDidMount}
            />
          </div>
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
      <ChatPage 
        user={user} 
        open={openChat} 
        messages={messages} 
        sendMessage={sendMessage} 
      />
    </div>
  );
}