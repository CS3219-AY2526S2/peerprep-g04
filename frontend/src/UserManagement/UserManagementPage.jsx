import Button from '@mui/material/Button';
import styles from './UserManagementPage.module.css';
import Typography from '@mui/material/Typography';
import { Outlet, useLocation, useNavigate } from 'react-router';
import { useContext } from 'react';
import { UserContext } from '../hooks/useUserService';
import { NotAllowedPage } from './NotAllowedPage';

function goBack(navigate, path) {
  navigate('/signed-in')
}

export function UserManagementPage() {
  const { user } = useContext(UserContext);
  const navigate = useNavigate();
  const location = useLocation();
  
  return (
    <div className={styles.main}>
      <div className={styles.header}>
        <div className={styles.center}>
          <Typography>User Management</Typography>
        </div>
        <div className={styles.right}>
          <Button variant='outlined' onClick={() => goBack(navigate, location.pathname)}>Back</Button>
        </div>
      </div>
      {user?.access !== 'admin' ? <NotAllowedPage /> : <Outlet />}
    </div>
  )
}