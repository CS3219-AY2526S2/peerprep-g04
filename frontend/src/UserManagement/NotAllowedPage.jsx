import styles from './NotAllowedPage.module.css';
import Warning from '../assets/warning.svg?react';
import Typography from '@mui/material/Typography';

export function NotAllowedPage() {
  return (
    <div className={styles.warningMain}>
      <div className={styles.warningCard}>
        <Warning height='50%' width='50%' />
        <Typography>You are not authorized to access this page.</Typography>
      </div>
    </div>
  )
}