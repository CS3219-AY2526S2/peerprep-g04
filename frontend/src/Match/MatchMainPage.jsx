import styles from './MatchMainPage.module.css';
import { useContext, useEffect } from 'react';
import { useMatchingService } from '../hooks/useMatchingService.jsx';
import { MatchPage } from './MatchPage.jsx';
import { useNavigate } from 'react-router';
import { LoadingPage } from './LoadingPage.jsx';
import { MatchingPage } from './MatchingPage.jsx';
import { MatchedPage } from './MatchedPage.jsx';
import { states } from '../hooks/useMatchingService.jsx';

import { PrimaryButton } from "../components/PrimaryButton";
import { HeaderContext } from "../contexts/HeaderContext";

export function MatchMainPage() {
  const {
    username,
    state,
    stateData,
    leave,
    request_match
  } = useMatchingService();
  const navigate = useNavigate();
  const { setShowHeader } = useContext(HeaderContext);

  useEffect(() => {
    if (state === states.matching || state === states.matched) {
      setShowHeader(false);
    } else {
      setShowHeader(true);
    }

    return () => setShowHeader(true);
  }, [state, setShowHeader]);

  async function onLeave() {
    leave();
    setShowHeader(true);
    navigate('/signed-in');
  }

  function whatPage(state) {
    switch (state) {
      case states.matching:
        return <MatchingPage />
      case states.matched:
        return <MatchedPage 
                username={username} 
                state={state} 
                stateData={stateData} 
                onLeave={onLeave}
               />
      default:
        return <MatchPage username={username} request_match={request_match} />
    }
  }

  return (
    <div className={styles.main}>
      <div className={styles.header}>
        <PrimaryButton
          text="Leave"
          onClick={onLeave}
          color="white"
          fullWidth={false}
        />
      </div>
      {!username ? <LoadingPage /> : whatPage(state)}
    </div>
  )
}