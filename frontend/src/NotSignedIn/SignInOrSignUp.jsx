import { SignUpForm } from "./SignUpForm";
import styles from './SignInOrSignUp.module.css';
import { useState, useEffect, useContext } from "react";
import { SignInForm } from "./SignInForm";
import { HeaderContext } from "../contexts/HeaderContext";

export function SignInOrUp() {
  const [whichForm, setWhichForm] = useState(1);
  const { setShowHeader } = useContext(HeaderContext);

  function toggleForm() {
    setWhichForm(1 - whichForm);
  }

  useEffect(() => {
    setShowHeader(false);
    return () => setShowHeader(true);
  }, [setShowHeader]);

  return (
    <div className={styles.main}>
      <h1 className={styles.title}>
        Welcome to PeerPrep
      </h1>
      {whichForm ? (
        <SignInForm toggleForm={toggleForm} />
      ) : (
        <SignUpForm toggleForm={toggleForm} />
      )}
    </div>
  )
}