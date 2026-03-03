import Typography from "@mui/material/Typography";
import { useEffect, useState } from "react";
import styles from './MatchPage.module.css';
import { get_all_question_tags } from "../hooks/useQuestionService.jsx";
import Chip from "@mui/material/Chip";
import Button from "@mui/material/Button";

const difficulties = ['easy', 'medium', 'hard'];

export function MatchPage(props) {
  const { request_match } = props;
  const [tags, setTags] = useState([]);
  const [selectedDiff, setSelectedDiff] = useState([]);
  const [selectedTags, setSelectedTags] = useState([]);

  function addDiff(diff) {
    setSelectedDiff([...selectedDiff, diff]);
  }

  function delDiff(diff) {
    setSelectedDiff(selectedDiff.filter(d => d !== diff));
  }

  function addTag(tag) {
    setSelectedTags([...selectedTags, tag]);
  }

  function delTag(tag) {
    setSelectedTags(selectedTags.filter(t => t !== tag));
  }
  
  useEffect(() => {
    get_all_question_tags().
    then(tags => {
      console.log(tags);
      tags && setTags(tags);
    });
  }, []);

  return (
    <div className={styles.matchPage}>
      <Typography variant='h5'>Choose your requirements</Typography>
      <div className={styles.diffField}>
        <Typography variant="h6">Difficulty</Typography>
        {difficulties.map((d, i) => {
          return (
            <label key={d}>
              <input 
                type='checkbox'
                checked={selectedDiff.includes(d)}
                onChange={ev => (ev.target.checked) ? addDiff(d) : delDiff(d)}
              />
              <span className={styles.rainbowText}>{d}</span>
            </label>
          )
        })}
      </div>
      <div className={styles.tagField}>
        <Typography variant='h6'>Tags</Typography>
        <div className={styles.tagList}>
          {tags.map(t => {
              const selected = selectedTags.includes(t);
              return (
                <Chip
                  key={t}
                  className={selected ? styles.chipSelected : undefined}
                  label={t}
                  color={selected ? 'primary' : undefined}
                  variant={selected ? 'filled' : 'outlined'}
                  onClick={() => selected ? delTag(t) : addTag(t)}
                />
              )
            })
          }
        </div>
      </div>
      <Button variant='outlined' onClick={() => request_match(selectedDiff, selectedTags)}>Match</Button>
    </div>
  )
}

