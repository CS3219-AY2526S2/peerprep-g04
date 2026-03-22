import Typography from '@mui/material/Typography';
import styles from './QsCreatePage.module.css';
import { useNavigate, useOutletContext } from 'react-router';
import TextField from '@mui/material/TextField';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import { useState } from 'react';
import Chip from '@mui/material/Chip';
import IconButton from '@mui/material/IconButton';
import AddIcon from '@mui/icons-material/Add';
import MDEditor from "@uiw/react-md-editor";
import Button from '@mui/material/Button';
import { create_question } from '../hooks/useQuestionService';
import { toast } from 'react-toastify';
import { useContext } from 'react';
import { UserContext } from '../hooks/useUserService';

export function QsCreatePage() {
  const { accessToken } = useContext(UserContext); 
  const { setReload } = useOutletContext();
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

  async function myCreate() {
    if (!(title && difficulty && tags.length && body)) {
      toast('some fields needed to create a question are still empty');
      return;
    }

    const res = await create_question({ title, difficulty, tags, body}, accessToken);
    if (res) {
      setReload(v => !v);
      navigate('..');
    }
  }

  return (
    <div className={styles.main}>
      <Typography>Create new question</Typography>
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
      <Button variant='outlined' onClick={myCreate}>Submit</Button>
    </div>
  )
}