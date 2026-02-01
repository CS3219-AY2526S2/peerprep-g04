import TextField from "@mui/material/TextField";
import { ToggleableTextField } from "../components/ToggleableTextField";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import Link from "@mui/material/Link";
import { useState } from "react";
import styles from './SignInForm.module.css';

export function SignInForm(props) {
  const { toggleForm } = props; 
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  function change_email(e) {
    setEmail(e.target.value);
  }

  function change_password(e) {
    setPassword(e.target.value);
  }

  return (
    <form>
      <Typography>Sign In</Typography>
      <TextField
        className={styles.inputField}
        label='Email'
        value={email}
        type='email'
        onChange={change_email}
      />
      <ToggleableTextField 
        className={styles.inputField}
        label='Password'
        value={password}
        onChange={change_password}
      />
      <Button>Login</Button>
      <Typography variant='caption'>
        No account?&nbsp;
        <Link
          className={styles.changeFormLink}
          onClick={e => {
            e.preventDefault();
            toggleForm();
          }}
        >
          Create
        </Link>
      </Typography>
    </form>
  )
}
