import Button from "@mui/material/Button";
import { ToggleableTextField } from "../components/ToggleableTextField";
import { useContext, useState, useEffect } from "react";
import styles from './ResetPassword.module.css';
import Typography from "@mui/material/Typography";
import { useNavigate, useParams } from "react-router";
import { UserContext } from "../hooks/useUserService";
import { HeaderContext } from "../contexts/HeaderContext";

export function ResetPasswordForm() {
  const [input, setInput] = useState('');
  const { token, userId } = useParams();
  const { loading, resetPassword } = useContext(UserContext);
  const { setShowHeader } = useContext(HeaderContext);
  const navigate = useNavigate();

  useEffect(() => {
    setShowHeader(false);
    return () => setShowHeader(true);
  }, [setShowHeader]);

  async function submit(ev) {
    try {
      ev.preventDefault();
      const res = await resetPassword(token, userId, input);
      if (res) navigate('/');
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
        <Button type='submit' disabled={loading}>
          {loading ? "Saving..." : "Change"}
        </Button>
      </form>
    </div>
  )
}