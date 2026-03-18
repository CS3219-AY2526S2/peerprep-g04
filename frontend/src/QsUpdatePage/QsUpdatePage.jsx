import Typography from '@mui/material/Typography';
import styles from './QsUpdatePage.module.css';
import { useNavigate, useOutletContext, useParams } from 'react-router';
import TextField from '@mui/material/TextField';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import { useState, useEffect } from 'react';
import Chip from '@mui/material/Chip';
import IconButton from '@mui/material/IconButton';
import AddIcon from '@mui/icons-material/Add';
import MDEditor from "@uiw/react-md-editor";
import Button from '@mui/material/Button';
import { get_question_by_id, update_question } from '../hooks/useQuestionService';
import { useContext } from 'react';
import { UserContext } from '../hooks/useUserService';

export function QsUpdatePage() {
  const { accessToken } = useContext(UserContext);
  const { setReload } = useOutletContext();
  const { id } = useParams();
  const [title, setTitle] = useState('');
  const [difficulty, setDifficulty] = useState('easy');
  const [tags, setTags] = useState([]);
  const [tag, setTag] = useState('');
  const [body, setBody] = useState('');
  const navigate = useNavigate();

  function addTag(tag) {
    setTags([...tags, tag]);
    setTag('');
  }

  function deleteTag(tag) {
    return () => setTags(tags.filter(t => t !== tag));
  }

  async function myUpdate() {
    const res = await update_question(id, { title, difficulty, tags, body }, accessToken);
    if (res) {
      setReload(v => !v);
      navigate('/signed-in/question-management');
    }
    
  }

  useEffect(() => {
    get_question_by_id(id)
    .then(data => {
        const { title, difficulty, tags, body } = data;
        setTitle(title);
        setDifficulty(difficulty);
        setTags(tags);
        setBody(body);
    });
  }, [id])

  return (
    <div className={styles.main}>
      <Typography>Update question</Typography>
      <div className={styles.field}>
        <Typography variant='h6'>Title:</Typography>
        <TextField 
          size='small'
          fullWidth
          value={title}
          onChange={ev => setTitle(ev.target.value)}
          required
        />
      </div>
      <div className={styles.field}>
        <Typography variant='h6'>Difficulty:</Typography>
        <Select
          size='small'
          fullWidth
          value={difficulty}
          onChange={ev => setDifficulty(ev.target.value)}
          required
        >
          <MenuItem value={'easy'}>easy</MenuItem>
          <MenuItem value={'medium'}>medium</MenuItem>
          <MenuItem value={'hard'}>hard</MenuItem>
        </Select>
      </div>
      <div className={styles.tagField}>
        <Typography variant='h6'>Tags</Typography>
        <div className={styles.tagList}>
          {tags.map(tag => <Chip key={tag} label={tag} onDelete={deleteTag(tag)}/>)}
        </div>
        <div className={styles.addTag}>
          <TextField 
            size='small'
            value={tag}
            fullWidth
            onChange={ev => setTag(ev.target.value)}
            onKeyDown={ev => {
              if (ev.key === 'Enter' && tag) {
                ev.preventDefault();
                addTag(tag);
              }
            }}
          />
          <IconButton
            onClick={() => tag && addTag(tag)}
          >
            <AddIcon fontSize='small'/>
          </IconButton>
        </div>
      </div>
      <MDEditor 
        value={body}
        onChange={val => setBody(val)}
        style={{ minWidth: '800px', minHeight: '450px' }}
      />
      <Button variant='outlined' onClick={myUpdate}>Update</Button>
    </div>
  )
}