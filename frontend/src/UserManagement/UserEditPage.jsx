import { useNavigate, useOutlet, useOutletContext, useParams } from 'react-router';
import styles from './UserEditPage.module.css';
import { useContext, useEffect, useState } from 'react';
import { external_update_user, get_user_by_id, UserContext } from '../hooks/useUserService';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';

export function UserEditPage() {
  const { user: currUser, accessToken, setUser: setCurrUser } = useContext(UserContext);
  const params = useParams();
  const id = params.id;
  const [user, setUser] = useState();
  const { username, email, access } = user || {username: '', email: '', access: ''};
  const { setReload } = useOutletContext();
  const navigate = useNavigate();

  useEffect(() => {
    get_user_by_id(id, accessToken).then(user => {
      user && setUser(user)
    });
  }, [id, accessToken]);

  function updateField(field) {
    return (ev) => {
      setUser({ ...user, [field]: ev.target.value });
    }
  }

  async function updateUser() {
    const res = await external_update_user(id, user, accessToken);
    if (res) {
      if (currUser.user_id === parseInt(id, 10)) {
        setCurrUser({ ...user, user_id: parseInt(id, 10) });
      }
      setReload(r => !r);
      navigate('/signed-in/user-management');
    }
  }

  return (
    <div className={styles.main}>
      <div className={styles.card}>
        <div>
          <div>Username</div>
          <Button variant='outlined' onClick={ev => updateUser()}>Update</Button>
        </div>
        <TextField fullWidth value={username} label='Username' onChange={updateField('username')} />
      </div>
      <div className={styles.card}>
        <div>
          <div>Email</div>
          <Button variant='outlined' onClick={ev => updateUser()}>Update</Button>
        </div>
        <TextField fullWidth value={email} label='Email' onChange={updateField('email')} />
      </div>
      <div className={styles.card}>
        <div>
          <div>Access</div>
          <Button variant='outlined' onClick={ev => updateUser()}>Update</Button>
        </div>
        <FormControl fullWidth>
          <InputLabel id='access'>Access</InputLabel>
          <Select
            labelId='access'
            value={access}
            onChange={updateField('access')}
            label='Access'
          >
            <MenuItem value='admin'>Admin</MenuItem>
            <MenuItem value='user'>User</MenuItem>
          </Select>
        </FormControl>
      </div>
    </div>
  )

}