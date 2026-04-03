import styles from './CollabPage.module.css';
import { useEffect, useState, useRef, useContext } from 'react';
import { get_question_by_id } from '../hooks/useQuestionService';
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
import { Card } from '../components/Card.jsx';
import { Tabs } from '../components/Tabs.jsx';
import { Tag } from '../components/Tag.jsx';
import { Table } from '../components/Table.jsx';

const diffColors = {
  easy: {
    bg: "#dcfce7",
    bgHover: "#bbf7d0",
    border: "#86efac",
    borderHover: "#4ade80",
    text: "#166534",
    textHover: "#14532d",
  },
  medium: {
    bg: "#fef3c7",
    bgHover: "#fde68a",
    border: "#fcd34d",
    borderHover: "#f59e0b",
    text: "#92400e",
    textHover: "#78350f",
  },
  hard: {
    bg: "#fee2e2",
    bgHover: "#fecaca",
    border: "#fca5a5",
    borderHover: "#ef4444",
    text: "#991b1b",
    textHover: "#7f1d1d",
  },
};

const formatLanguage = {
  "javascript": "JavaScript",
  "python": "Python",
};

function Output(props) {
  const { loading, open, setOpen, output } = props;

  function renderContent() {
    if (loading) {
      return (
        <div className={styles.terminalSpinner}>
          <div className={styles.spinner}></div>
        </div>
      );
    }

    return (
      <div className={styles.terminalBody}>
        <code>{output}</code>
      </div>
    );
  }

  return (
    <div className={styles.terminal}>
      <div className={styles.terminalHeader}>
        <Typography sx={{ fontSize: '16px' }}>Terminal</Typography>
        <IconButton onClick={() => setOpen(!open)} sx={{ height: '24px', width: '24px' }}>
          {open ? <KeyboardArrowDownIcon /> : <KeyboardArrowUpIcon />}
        </IconButton>
      </div>
      {open && renderContent()}
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
    runCode,
  } = useCodeExecution();

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
      `ws://${import.meta.env.VITE_COLLAB_SERVICE_API}?token=${accessToken}`,
      match_id.toString(),
      yDoc
    );

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
    if (!currentCode) return;

    const submissionData = {
      user_id: user.user_id,
      question_id: question_id,
      lang: lang,
      code: currentCode,
      status: 'Accepted' // hardcoded
    };

    const newSubmission = await createSubmission(submissionData);
    
    if (newSubmission) {
      const history = await get_question_attempts(question_id);
      setSubmissions(history || []);
      setTab("Submissions");
    }
  };

  return (
    <div className={styles.main}>
      <MatchHeader
        lang={lang}
        setLang={setLang}
        onRun={() => runCode(editorRef.current?.getValue())}
        onSubmit={handleSubmit}
        onLeave={onLeave}
        loading={loading}
        showRun={true}
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
                  color={diffColors[difficulty]}
                />
              )}
              {tags.map((t) => (
                <Tag key={t} text={t} />
              ))}
            </div>

            <Tabs
              tabs={["Description", "Submissions"]}
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
                          <td>{new Date(s.submitted_at).toLocaleDateString()}</td>
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

        {/* TERMINAL */}
        <Output
          loading={loading}
          open={open}
          setOpen={setOpen}
          output={output}
          outputErr={outputErr}
        />
      </div>
    </div>
  );
}