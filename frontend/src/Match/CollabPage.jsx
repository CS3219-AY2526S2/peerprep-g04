import styles from './CollabPage.module.css';
import { useEffect, useState, useRef, useContext } from 'react';
import { toast } from 'react-toastify';
import { get_question_by_id } from '../hooks/useQuestionService';
import Editor from '@monaco-editor/react';
import * as Y from 'yjs';
import { MonacoBinding } from "y-monaco";
import { WebsocketProvider } from "y-websocket";
import Markdown from 'react-markdown';
import { UserContext } from '../hooks/useUserService.jsx';
import { useCodeExecution } from '../hooks/useCodeExecution.jsx';
import { MatchHeader } from '../components/MatchHeader.jsx';
import { Card } from '../components/Card.jsx';
import { Tabs } from '../components/Tabs.jsx';
import { Tag } from '../components/Tag.jsx';
import { Table } from '../components/Table.jsx';
import { OutputPanel } from '../components/OutputPanel';
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

    const runResult = await runCode(currentCode, testCaseInput, testCaseOutput);

    if (!runResult) return; 

    let finalStatus = "Attempted";
    if (runResult === "Passed") finalStatus = "Accepted";
    else if (runResult === "Failed") finalStatus = "Failed";
    else if (runResult === "Error") finalStatus = "Error";
    else if (runResult === "Completed") finalStatus = "Completed";

    const submissionData = {
      user_id: user.user_id,
      question_id: question_id,
      lang: lang,
      code: currentCode,
      status: finalStatus 
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
        onRun={() => {
          const code = editorRef.current?.getValue();
          if (testCaseInput && testCaseOutput) {
            runCode(code, testCaseInput, testCaseOutput);
          } else {
            runCode(code);
          }
        }}
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
                          <td>{formatDateTime(s.submitted_at)}</td>
                          <td>{formatLanguage[s.lang] || s.lang}</td>
                          <td style={{ color: s.status === 'Accepted' ? '#16a34a' : '#ef4444' }}>
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

        <OutputPanel 
          loading={loading} 
          open={open} 
          setOpen={setOpen} 
          output={output} 
          outputErr={outputErr} 
          testStatus={testStatus} 
          testCaseInput={testCaseInput}
          testCaseOutput={testCaseOutput} 
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