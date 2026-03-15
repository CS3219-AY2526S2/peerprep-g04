import Button from '@mui/material/Button';
import styles from './MatchMainPage.module.css';
import { useState } from 'react';
import { useMatchingService } from '../hooks/useMatchingService.jsx';
import { MatchPage } from './MatchPage.jsx';
import { useNavigate } from 'react-router';
import { LoadingPage } from './LoadingPage.jsx';
import { MatchingPage } from './MatchingPage.jsx';
import { MatchedPage } from './MatchedPage.jsx';
import { states } from '../hooks/useMatchingService.jsx';

export function MatchMainPage() {
  const [tags, setTags] = useState([]);
  const {
    username,
    state,
    stateData,
    leave,
    request_match
  } = useMatchingService();
  const navigate = useNavigate();

  function whatPage(state) {
    switch (state) {
      case states.matching:
        return <MatchingPage />

      case states.matched:
        return <MatchedPage username={username} state={state} stateData={stateData} />

      default:
        return <MatchPage username={username} request_match={request_match} />
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