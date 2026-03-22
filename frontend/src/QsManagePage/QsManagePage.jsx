import Typography from '@mui/material/Typography'
import styles from './QsManage.module.css'
import { Outlet, useLocation, useNavigate } from 'react-router'
import { useState } from 'react';
import Button from '@mui/material/Button';
import Warning from '../assets/warning.svg?react';
import { useContext } from 'react';
import { UserContext } from '../hooks/useUserService';

export function NotAuthorizedPage() {
  return (
    <div className={styles.warningMain}>
      <div className={styles.warningCard}>
        <Warning height='60%' width='60%' />
        <div>You are not authorized to access this page</div>
      </div>
    </div>
  )
}

function goBack(path, navigate) {
  if (path.includes('create-question') || path.includes('edit-question')) {
    navigate('/signed-in/question-management');
  } else {
    navigate('/signed-in');
  }
}

export function QsManagePage() {
  const { user } = useContext(UserContext);
  const [reload, setReload] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <div className={styles.main}>
      <div className={styles.header}>
        <div className={styles.middle}>
          <Typography>Question Management</Typography>
        </div>
        <div className={styles.end}>
          <Button variant='outlined' onClick={() => goBack(location.pathname, navigate)}>Back</Button>
        </div>
      </div>
      {user?.access !== 'admin' ? <NotAuthorizedPage /> : <Outlet context={{reload, setReload}} />}
    </div>
  )
}