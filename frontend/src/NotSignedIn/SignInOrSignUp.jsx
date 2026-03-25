import { SignUpForm } from "./SignUpForm";
import styles from './SignInOrSignUp.module.css';
import { useState } from "react";
import { SignInForm } from "./SignInForm";

export function SignInOrUp() {
  const [whichForm, setWhichForm] = useState(1);
  
  function toggleForm() {
    setWhichForm(1 - whichForm);
  }

  return (
    <div className={styles.main}>
      <h1 className={styles.title}>
        Welcome to PeerPrep
      </h1>
      {whichForm ? <SignInForm toggleForm={toggleForm}/> : <SignUpForm toggleForm={toggleForm} />}
    </div>
  )
}