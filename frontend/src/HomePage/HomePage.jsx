import { useContext } from "react";
import { Navigate, useNavigate } from "react-router";
import styles from './HomePage.module.css';
import { UserContext } from "../hooks/useUserService";
import Button from "@mui/material/Button";
import { useEffect } from "react";

export function HomePage() {
  const { user, logout } = useContext(UserContext)
  const navigate = useNavigate();

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