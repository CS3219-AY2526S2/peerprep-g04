import Typography from "@mui/material/Typography";
import { delete_question, get_all_questions_without_body } from "../hooks/useQuestionService";
import { useState, useEffect } from "react";
import Button from "@mui/material/Button";
import styles from './QsList.module.css';
import Chip from "@mui/material/Chip";
import IconButton from "@mui/material/IconButton";
import MoreHorizIcon from '@mui/icons-material/MoreHoriz';
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import { useNavigate, useOutletContext } from "react-router";

function getDifficultyColor(difficulty) {
  switch (difficulty) {
    case 'easy':
      return 'green';
    
    case 'medium':
      return 'yellow';

    case 'hard':
      return 'red';
  }
  return null;
}

function QsRow(props) {
  const { question, setReload } = props;
  const { id, title, difficulty, tags } = question;
  const navigate = useNavigate();
  
  const [anchorEl, setAnchorEl] = useState(null);

  async function myDelete() {
    await delete_question(id)
    setReload(t => !t);
  }
  return (
    <tr>
      <td>
        <Typography>{id}</Typography>
      </td>
      <td>
        <Typography>{title}</Typography>
      </td>
      <td>
        <Typography style={{color: getDifficultyColor(difficulty)}}>
          {difficulty}
        </Typography>
      </td>
      <td>
        <div className={styles.tagList}>
          {tags.map(tag => <Chip key={tag} label={tag} />)}
        </div>
      </td>
      <td>
        <IconButton onClick={ev => setAnchorEl(ev.currentTarget)}>
          <MoreHorizIcon fontSize="small"/>
        </IconButton>
        <Menu
          anchorEl={anchorEl}
          open={Boolean(anchorEl)}
          onClose={() => setAnchorEl(null)}
        >
          <MenuItem>
            <Typography onClick={() => navigate(`edit-question/${id}`)}>Edit</Typography>
          </MenuItem>
          <MenuItem onClick={myDelete}>
            <Typography>Delete</Typography>
          </MenuItem>
        </Menu>
      </td>
    </tr>
  )
 
}
export function QsList() {
  const [questions, setQuestions] = useState([]);
  const { reload, setReload } = useOutletContext();
  const navigate = useNavigate();

  useEffect(() => {
    const data = get_all_questions_without_body()
      .then(data => {
        data && setQuestions(data);
      });
  }, [reload]);

  return (
    <div className={styles.main}>
      <div className={styles.header}>
        <Typography variant="h6">Questions</Typography>
        <Button 
          variant="outlined" 
          onClick={() => navigate('create-question')}
        >
          Create
        </Button>
      </div>
      <table className={styles.table}>
        <thead>
          <tr>
            <th>
              <Typography>id</Typography>
            </th>
            <th>
              <Typography>title</Typography>
            </th>
            <th>
              <Typography>difficulty</Typography>
            </th>
            <th>
              <Typography>tags</Typography>
            </th>
            <th>&nbsp;</th>
          </tr>
        </thead>
        <tbody>
          {questions.map(q => <QsRow key={q.id} question={q} setReload={setReload} />)}
        </tbody>
      </table>
    </div>
  )
}