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


const diffToColor = {
  easy: { backgroundColor: '#16a34a', color: 'green' },
  medium: { backgroundColor: '#d97706', color: 'orange' },
  hard: { backgroundColor: '#dc2626', color: 'red' }
};


export function CollabPage(props) {
  const { stateData, onLeave } = props;
  const { question_id, match_id } = stateData;
  const [question, setQuestion] = useState({});
  const { title = '', difficulty = [], tags = [], body = '' } = question;
  const editorRef = useRef(null);
  const { accessToken } = useContext(UserContext);

  useEffect(() => {
    get_question_by_id(question_id).then(q => q && setQuestion(q));
  }, [question_id]);

  function handleEditorDidMount(editor, monaco) {
    editorRef.current = editor;
    const doc = new Y.Doc();
    
    const provider = new WebsocketProvider(
      `ws://localhost:3003?token=${accessToken}`, stateData.match_id.toString(), doc
    );
    
    const type = doc.getText("monaco");
  
    const binding = new MonacoBinding(
      type, editorRef.current.getModel(), new Set([editorRef.current]), provider.awareness
    );           
  }

  return (
    <div className={styles.main}>
      <div className={styles.header}>
        <Button variant='outlined' size='small'>Run</Button>
        <Button variant='outlined' size='small' onClick={ev => onLeave()}>Leave</Button>
      </div>

      <div className={styles.body}>
        <div className={styles.bodyLeft}>
          <div className={styles.bodyLeftHeader}>
            <Typography variant='h4'>{title}</Typography>
            <Chip size='small' variant='outlined' label={difficulty} />
            <div>
              {tags.map(tag => <Chip key={tag} size='small' label={tag} />)}
            </div>
          </div>
          
          <Markdown>{body}</Markdown>
        </div>

        <div className={styles.bodyRight}>
          <Editor
            theme='vs-dark'
            defaultLanguage='javascript'
            defaultValue='function hello_word() {}'
            options={{
              minimap: { enabled: false }
            }}
            onMount={handleEditorDidMount}
          />
        </div>
      </div>
    </div>
  )
}