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
  const {
    username,
    state,
    stateData,
    leave,
    request_match
  } = useMatchingService();
  const navigate = useNavigate();
  const [showHeader, setShowHeader] = useState(true);

  async function onLeave() {
    leave();
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
                setShowHeader={setShowHeader} 
                onLeave={onLeave}
               />

      default:
        return <MatchPage username={username} request_match={request_match} />
    }
  }

  return (
    <div className={styles.main}>
      {showHeader &&
        <div className={styles.header} style={{
          background: 'transparent',
          borderBottom: 'none',
          boxShadow: 'none',
          backdropFilter: 'none',
          backgroundColor: 'transparent',
        }}>
          <button
            onClick={onLeave}
            style={{
              fontFamily: "'DM Sans', 'Segoe UI', sans-serif",
              fontSize: '0.78rem',
              fontWeight: 600,
              letterSpacing: '0.1em',
              textTransform: 'uppercase',
              color: '#1d4ed8',
              background: 'rgba(29,78,216,0.07)',
              border: '1.5px solid rgba(29,78,216,0.22)',
              borderRadius: '999px',
              padding: '7px 22px',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
            }}
            onMouseEnter={e => {
              e.currentTarget.style.background = 'rgba(29,78,216,0.14)';
              e.currentTarget.style.borderColor = 'rgba(29,78,216,0.45)';
            }}
            onMouseLeave={e => {
              e.currentTarget.style.background = 'rgba(29,78,216,0.07)';
              e.currentTarget.style.borderColor = 'rgba(29,78,216,0.22)';
            }}
          >
            Leave
          </button>
        </div>
      }
      {!username ? <LoadingPage /> : whatPage(state)}
    </div>
  )
}