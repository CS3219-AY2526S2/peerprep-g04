import Button from '@mui/material/Button';
import styles from './MatchMain.module.css';
import { useState } from 'react';
import { useMatchingService } from '../hooks/useMatchingService';
import { MatchPage } from './MatchPage.jsx';
import { useNavigate } from 'react-router';
import { LoadingPage } from './LoadingPage.jsx';
import { MatchingPage } from './MatchingPage.jsx';

export const states = Object.freeze({
    invalid: 'invalid',
    register: 'register',
    matching: 'matching',
    matched: 'matched',
});



export function MatchMainPage() {
  const [tags, setTags] = useState([]);
  const {
    username,
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
        return <MatchingPage />

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
      {!username ? <LoadingPage /> : whatPage(state)}
    </div>
  )
}