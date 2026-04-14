import styles from './HomePage.module.css';
import { DashboardPage } from '../DashboardPage/DashboardPage';

export function HomePage() {
  return (
    <div className={styles.main}>
      <DashboardPage />
    </div>
  );
}
