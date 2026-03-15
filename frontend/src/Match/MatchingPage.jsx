import Typography from '@mui/material/Typography';
import { useInterval } from '../hooks/useInterval';
import styles from './MatchingPage.module.css';
import { useState } from 'react';
import LoadingSpinner from '../assets/loading-spinner.svg?react';

export function MatchingPage() {
  const [elapsed, setElapsed] = useState(0);
  useInterval(() => setElapsed(t => t + 1), 1000);

  return (
    <div className={styles.matchingPage}>
      <LoadingSpinner className={styles.loadingSpinner} />
      <Typography>Waiting: {elapsed}s</Typography>
    </div>
  )
}