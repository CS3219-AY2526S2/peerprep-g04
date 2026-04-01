import styles from './NotAllowedPage.module.css';
import Warning from '../assets/warning.svg?react';
import { Card } from '../components/Card';

export function NotAllowedPage() {
  return (
    <div className={styles.warningMain}>
      <Card 
        title={<span style={{ color: "#e11d48" }}>Access Denied</span>}
        className={styles.animatePop}
        style={{ width: "450px", border: "1px solid #fee2e2", backgroundColor: "#fff1f2", borderColor: "#fda4af", color: "#e11d48", }}
      >
        <div className={styles.warningContent}>
          <Warning 
            style={{ 
              height: '100px', 
              width: '100px', 
              color: '#e11d48'
            }} 
          />
          <p className={styles.message}>
            You are not authorized to access this page.
          </p>
        </div>
      </Card>
    </div>
  );
}