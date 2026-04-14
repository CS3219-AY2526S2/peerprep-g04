import styles from './HomePage.module.css';
import { useNavigate } from "react-router";
import { DashboardPage } from '../DashboardPage/DashboardPage';
import Button from "@mui/material/Button";

export function HomePage() {
  const navigate = useNavigate();

  return (
    <div className={styles.main}>
      <DashboardPage />
      <div className={styles.startRow}>
        <Button variant='outlined' onClick={() => navigate('/signed-in/match')}>Start</Button>
      </div>
    </div>
  );
}
