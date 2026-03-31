import { useInterval } from '../hooks/useInterval';
import styles from './MatchingPage.module.css';
import { useState } from 'react';
import { MatchHeader } from '../components/MatchHeader.jsx';

export function MatchingPage(props) {
  const { onLeave } = props;
  const [elapsed, setElapsed] = useState(0);
  useInterval(() => setElapsed(t => t + 1), 1000);

  const minutes = Math.floor(elapsed / 60);
  const seconds = elapsed % 60;
  const timeStr = minutes > 0
    ? `${minutes}m ${seconds.toString().padStart(2, '0')}s`
    : `${seconds}s`;

  return (
    <div>
      <MatchHeader onLeave={onLeave} showRun={false} />
      
      <div className={styles.matchingPage}>
        <div className={styles.content}>

          <div className={styles.spinnerWrap}>
            <div className={styles.ring} />
            <div className={styles.ringInner} />
          </div>

          <div className={styles.textBlock}>
            <h2 className={styles.title}>Finding your match</h2>
            <span className={styles.timerValue}>{timeStr}</span>
          </div>

        </div>
      </div>
    </div>
  );
}