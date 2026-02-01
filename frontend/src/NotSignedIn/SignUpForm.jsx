import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import styles from './SignUpForm.module.css';
import Button from '@mui/material/Button';
import { useState } from 'react';
import { ToggleableTextField } from '../components/ToggleableTextField';
import { Link } from 'react-router';


export function SignUpForm(props) {
  const { toggleForm } = props;
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  function change_username(e) {
    setUsername(e.target.value);
  }

  function change_email(e) {
    setEmail(e.target.value);
  }

  function change_password(e) {
    setPassword(e.target.value);
  }

  return (
    <form>
      <Typography>Sign Up</Typography>
      <TextField 
        className={styles.inputField}
        label='Username' 
        required 
        value={username}
        onChange={change_username}
      />
      <TextField
        className={styles.inputField}
        label='Email' 
        required 
        type='email' 
        value={email}
        onChange={change_email}
      />
      <ToggleableTextField
        className={styles.inputField}
        label='Password'
        required
        value={password}
        onChange={change_password}
      />
      <Button>Create</Button>
      <Typography variant='caption'>
        Already have an account?&nbsp;
        <Link
          onClick={e => {
            e.preventDefault();
            toggleForm();
          }}
        >
            Login
        </Link>
      </Typography>
    </form>
  )
}