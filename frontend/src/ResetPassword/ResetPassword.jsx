import Button from "@mui/material/Button";
import { ToggleableTextField } from "../components/ToggleableTextField";
import { useState } from "react";
import styles from './ResetPassword.module.css';
import Typography from "@mui/material/Typography";
import { useResetPassword } from "../hooks/useResetPassword";

export function ResetPasswordForm() {
  const [input, setInput] = useState('');
  const {
    userId
  } = useResetPassword();

  function submit(ev) {
    ev.preventDefault();
  }

  return (
    <div className={styles.main}>
      <form onSubmit={submit}>
        <Typography color='primary'>Reset password</Typography>
        <ToggleableTextField 
          value={input}
          label='New password'
          onChange={e => setInput(e.target.value)}
        />
        <Button type='submit'>Change</Button>
      </form>
    </div>
  )
}