import { useContext } from "react";
import { Navigate, useNavigate } from "react-router";
import styles from './HomePage.module.css';
import { UserContext } from "../hooks/useUserService";
import Button from "@mui/material/Button";

export function HomePage() {
  const { user, logout } = useContext(UserContext)
  const navigate = useNavigate();

  if (!user) {
    return <Navigate to='/' />
  }

   async function myLogout() {
    await logout();
    navigate('/');
  }

  return (
    <div className={styles.main}>
       <div className={styles.body}>
        <Button variant='outlined' onClick={() => navigate('/signed-in/match')}>Start</Button>
      </div>
    </div>
  )
}