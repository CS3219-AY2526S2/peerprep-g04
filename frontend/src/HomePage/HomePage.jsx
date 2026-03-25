import { useState, useContext } from "react";
import { Navigate, useNavigate } from "react-router";
import styles from './HomePage.module.css';
import { UserContext } from "../hooks/useUserService";
import { AccountPage } from "../AccountPage/AccountPage";
import Button from "@mui/material/Button";
import { Header } from "../components/Header";

const states = Object.freeze({
  home: 0,
  match: 1,
})

export function HomePage() {
  const { user } = useContext(UserContext)
  const navigate = useNavigate();

  if (!user) {
    return <Navigate to='/' />
  }

  return (
    <div className={styles.main}>
       <div className={styles.body}>
        <Button variant='outlined' onClick={() => navigate('/signed-in/match')}>Start</Button>
      </div>
    </div>
  )
}