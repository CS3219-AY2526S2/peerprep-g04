import Button from '@mui/material/Button';
import styles from './MatchedPage.module.css';
import { CollabPage } from './CollabPage.jsx';
import { useState } from 'react';

export function MatchedPage(props) {
  const { username, stateData, onLeave } = props;
  const { opponent_username, difficulties = [], topics = [] } = stateData;
  const [ openCollab, setOpenCollab ] = useState(false);
  
  const diffColor = {
    easy: styles.easy,
    medium: styles.medium,
    hard: styles.hard,
  };

  if (openCollab) {
    return <CollabPage stateData={stateData} onLeave={onLeave} />
  }

  return (
    <div className={styles.matchedPage}>
      <div className={styles.container}>

        {/* Match found badge */}
        <div className={styles.badge}>
          <span className={styles.badgeDot} />
          Match found
        </div>

        {/* VS row */}
        <div className={styles.vsRow}>
          <div className={styles.player}>
            <div className={styles.avatar}>{username?.[0]?.toUpperCase()}</div>
            <span className={styles.playerName}>{username}</span>
          </div>
          <span className={styles.vs}>vs</span>
          <div className={`${styles.player} ${styles.playerRight}`}>
            <div className={styles.avatar}>{opponent_username?.[0]?.toUpperCase()}</div>
            <span className={styles.playerName}>{opponent_username}</span>
          </div>
        </div>

        {/* Match info */}
        <div className={styles.infoCard}>
          <div className={styles.infoRow}>
            <span className={styles.infoLabel}>Topic</span>
            <div style={{display: 'flex', gap: '4px'}}>
              {topics.map(topic => <span key={topic} className={styles.infoValue}>{topic}</span>)}
            </div>
          </div>
          <div className={styles.divider} />
          <div className={styles.infoRow}>
            <span className={styles.infoLabel}>Difficulty</span>
            <div style={{display: 'flex', gap: '4px'}}>
              {difficulties.map(difficulty => 
                <span key={difficulty} className={`${styles.diffBadge} ${diffColor[difficulty] ?? ''}`}>
                  {difficulty}
                </span>
              )}
            </div>
          </div>
        </div>

        <Button fullWidth variant='outlined' onClick={ev => setOpenCollab(!openCollab)}>Code</Button>
        
      </div>
    </div>
  );
}