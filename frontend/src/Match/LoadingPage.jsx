import LoadingSpinner from '../assets/loading-spinner.svg?react';
import styles from './LoadingPage.module.css';

export function LoadingPage() {
  return (
    <div className={styles.loadingPage}>
      <LoadingSpinner className={styles.loadingSpinner } />
    </div>
    
  )
}