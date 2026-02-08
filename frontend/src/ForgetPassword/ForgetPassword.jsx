import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField";
import styles from './ForgetPassword.module.css';
import { useContext, useState } from "react";
import Typography from "@mui/material/Typography";
import { UserContext } from "../hooks/useUserService";

export function ForgetPassword() {
  const [input, setInput] = useState('');
  const { loading, forgetPassword } = useContext(UserContext);

  function submit(ev) {
    ev.preventDefault();
    forgetPassword(input);
    setInput('');
  }

  return (
    <div className={styles.main}>
      <form onSubmit={submit}>
        <Typography color='primary'>Forget Password</Typography>
        <TextField 
          label='Email'
          value={input}
          onChange={e => setInput(e.target.value)}
        />
        <Button type='submit' loading={loading}>
          Send email
        </Button>
      </form>
    </div>
  )
}