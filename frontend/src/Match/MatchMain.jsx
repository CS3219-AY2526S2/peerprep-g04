import Button from '@mui/material/Button';
import styles from './MatchMain.module.css';
import { useRef, useState, useEffect, useContext } from 'react';
import { get_all_question_tags } from '../hooks/useQuestionService';
import io from 'socket.io-client';
import { useMatchingService } from '../hooks/useMatchingService';
import { UserContext } from '../hooks/useUserService';
import { MatchPage } from './MatchPage';
import { useNavigate } from 'react-router';

export const states = Object.freeze({
    invalid: 'invalid',
    register: 'register',
    matching: 'matching',
    matched: 'matched',
});



export function MatchMainPage() {
  const [tags, setTags] = useState([]);
  const {
    state,
    leave,
    request_match
  } = useMatchingService();
  const navigate = useNavigate();

  function whatPage(state) {
    switch (state?.state) {
      case states.register:
        return <MatchPage request_match={request_match} />
      case states.matching:
        return <div>Matching...</div>
      case states.matched:
        return <div>Matched</div>
      default:
        return <div>error</div>
    }
  }

  async function onLeave() {
    await leave();
    navigate('/signed-in');
  }
  
  return (
    <div className={styles.main}>
      <div className={styles.header}>
        <Button variant='outlined' onClick={onLeave}>Leave</Button>
      </div>
      {whatPage(state)}
    </div>
  )
}