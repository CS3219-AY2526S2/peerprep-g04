import TextField from '@mui/material/TextField';
import styles from './AccountPage.module.css';
import Avatar from "@mui/material/Avatar";
import { useContext, useState } from 'react';
import { UserContext } from '../hooks/useUserService';
import { PrimaryButton } from '../components/PrimaryButton';
import { ToggleableTextField } from '../components/ToggleableTextField';
import { Card } from '../components/Card';
import { Navigate } from 'react-router';
import { DeleteDialog } from '../components/DeleteDialog'

export function AccountPage() {
  const { user, loading, updateUser, deleteUser, logout } = useContext(UserContext);

  const [username, setUsername] = useState(user?.username ?? '');
  const [email, setEmail] = useState(user?.email ?? '');
  const [password, setPassword] = useState('');

  const [openDel, setOpenDel] = useState(false);

  const hasChanges =
    username !== user?.username ||
    email !== user?.email ||
    password.length > 0;

  async function handleUpdate(ev) {
    ev.preventDefault();

    const updates = {};
    if (username !== user?.username) updates.username = username;
    if (email !== user?.email) updates.email = email;
    if (password) updates.password = password;

    if (Object.keys(updates).length === 0) return;

    await updateUser(updates);
    setPassword('');
  }

  if (!user) return <Navigate to="/" />;

  return (
    <div className={styles.main}>
      <div className={styles.body}>
        <div className={styles.wrapper}>
          <h1 className={styles.title}>
            Account Settings
          </h1>

          <Card badge={hasChanges ? 'Unsaved changes' : null}>
            <div className={styles.avatarSection}>
              <Avatar className={styles.avatar}>
                {user?.username[0].toUpperCase()}
              </Avatar>

              <div className={styles.username}>
                {user?.username}
              </div>
            </div>

            <form onSubmit={handleUpdate} className={styles.formContainer}>
              <div className={styles.formFields}>
                <TextField
                  fullWidth
                  label="Username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                />

                <TextField
                  fullWidth
                  label="Email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />

                <ToggleableTextField
                  fullWidth
                  label="New Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />

                <PrimaryButton
                  text="Update"
                  type="submit"
                  disabled={!hasChanges || loading}
                />

                <PrimaryButton
                  text="Delete"
                  color='red'
                  onClick={() => setOpenDel(true)}
                  disabled={user.access === 'owner'}
                />
              </div>
            </form>
          </Card>

        </div>
      </div>

      <DeleteDialog
        open={openDel}
        onClose={() => setOpenDel(false)}
        onConfirm={async () => {
          const res = await deleteUser(user.user_id);
          if (res) {
            setOpenDel(false);
            logout(); 
          }
        }}
        message='Are you sure you want to delete your account?'
      />
    </div>
  );
}