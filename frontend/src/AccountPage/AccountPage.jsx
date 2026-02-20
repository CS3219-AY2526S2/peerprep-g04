import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import styles from './AccountPage.module.css';
import { useContext, useState } from 'react';
import { UserContext } from '../hooks/useUserService';
import { ToggleableTextField } from '../components/ToggleableTextField';
import { getCardHeaderUtilityClass } from '@mui/material/CardHeader';
import { useNavigate } from 'react-router';
import { Navigate } from 'react-router';

export function AccountPage() {
  const { user, loading, updateUser, logout } = useContext(UserContext);
  const [username, setUsername] = useState(user?.username ?? '');
  const [email, setEmail] = useState(user?.email ?? '');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  function getSubmitFunc(type) {
    return async (ev) => {
      ev.preventDefault();
      
      let value;
      if (type === 'username') value = username;
      else if (type === 'email') value = email;
      else if (type === 'password') value = password;
      
      await updateUser({ [type]: value });
      navigate('/account');
    }
  }

  if (!user) {
    return <Navigate to='/not-signed-in' />
  }

  return (
    <div className={styles.main}>
      <div className={styles.header}>
        <Typography>Account Management for {user?.username}</Typography>
      </div>
      <div className={styles.body}>
        <Button 
          variant='outlined' 
          color='error'
          onClick={logout}
        >
          Logout
        </Button>
        <form onSubmit={getSubmitFunc('username')}>
          <div>
            <Typography>Change username</Typography>
            <Button type='submit' loading={loading}>Send</Button>
          </div>
          <TextField
            style={{paddingBottom: '4px'}}
            fullWidth
            label='New username'
            value={username}
            onChange={ev => setUsername(ev.target.value)}
          />
        </form>
        <form onSubmit={getSubmitFunc('email')}>
          <div>
            <Typography>Change email</Typography>
            <Button type='submit' loading={loading}>Send</Button>
          </div>
          <TextField
            style={{paddingBottom: '4px'}}
            fullWidth
            label='New email'
            value={email}
            type='email'
            onChange={ev => setEmail(ev.target.value)}
          />
        </form>
        <form onSubmit={getSubmitFunc('password')}>
          <div>
            <Typography>Change password</Typography>
            <Button type='submit' loading={loading}>Send</Button>
          </div>
          <ToggleableTextField
            style={{paddingBottom: '4px'}}
            fullWidth
            label='New password'
            value={password}
            onChange={ev => setPassword(ev.target.value)}
          />
        </form>
      </div>
    </div>
  )
}