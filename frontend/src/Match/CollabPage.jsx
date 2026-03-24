import Button from '@mui/material/Button';
import styles from './CollabPage.module.css';
//import Markdown from 'react-markdown';
import { useEffect, useState } from 'react';
import { get_question_by_id } from '../hooks/useQuestionService';
import Chip from '@mui/material/Chip';
import Editor from '@monaco-editor/react'
import Typography from '@mui/material/Typography';


const diffToColor = {
  easy: { backgroundColor: '#16a34a', color: 'green' },
  medium: { backgroundColor: '#d97706', color: 'orange' },
  hard: { backgroundColor: '#dc2626', color: 'red' }
};


export function CollabPage(props) {
  const { stateData } = props;
  const { question_id } = stateData;
  const [question, setQuestion] = useState({});
  console.log(stateData);
  const { title = '', difficulty = [], tags = [], body = '' } = question;

  useEffect(() => {
    get_question_by_id(question_id).then(q => q && setQuestion(q));
  }, [question_id]);

  return (
    <div className={styles.main}>
      <div className={styles.header}>
        <Button variant='outlined' size='small'>Run</Button>
        <Button variant='outlined' size='small'>Leave</Button>
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
          <div>{body}</div>
        </div>

        <div className={styles.bodyRight}>
          <Editor
            defaultLanguage='javascript'
            defaultValue='function hello_word() {}'
            options={{ automaticLayout: true }}
          />
        </div>
      </div>
    </div>
  )
}