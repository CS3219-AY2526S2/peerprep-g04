import { SignUpForm } from "./SignUpForm";
import styles from './SignInOrSignUp.module.css';
import { useState } from "react";
import { SignInForm } from "./SignInForm";
import Typography from "@mui/material/Typography";

export function SignInOrUp() {
  const [whichForm, setWhichForm] = useState(1);
  
  function toggleForm() {
    setWhichForm(1 - whichForm);
  }

  return (
    <div className={styles.main}>
      <Typography variant="h5" color="primary">Welcome to PeerPrep</Typography>
      {whichForm ? <SignInForm toggleForm={toggleForm}/> : <SignUpForm toggleForm={toggleForm} />}
    </div>
  )
}