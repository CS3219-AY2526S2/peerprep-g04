import Button from "@mui/material/Button";
import { ToggleableTextField } from "../components/ToggleableTextField";
import { useContext, useState } from "react";
import styles from './ResetPassword.module.css';
import Typography from "@mui/material/Typography";
import { useNavigate, useParams } from "react-router";
import { UserContext } from "../hooks/useUserService";

export function ResetPasswordForm() {
  const [input, setInput] = useState('');
  const { token, userId } = useParams();
  const { loading, resetPassword } = useContext(UserContext);
  const navigate = useNavigate();

  async function submit(ev) {
    try {
      ev.preventDefault();
      await resetPassword(token, userId, input);
      navigate('/not-signed-in');
    } catch (err) {}
    setInput('');
  }

  return (
    <div className={styles.main}>
      <form onSubmit={submit}>
        <Typography color='primary'>Reset password</Typography>
        <ToggleableTextField 
          className={styles.inputField}
          value={input}
          label='New password'
          onChange={e => setInput(e.target.value)}
        />
        <Button type='submit'>Change</Button>
      </form>
    </div>
  )
}