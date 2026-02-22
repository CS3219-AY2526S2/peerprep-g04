import Typography from '@mui/material/Typography'
import styles from './QsManage.module.css'
import { Outlet, useLocation, useNavigate } from 'react-router'
import { useState } from 'react';
import Button from '@mui/material/Button';

function goBack(path, navigate) {
  if (path.includes('create-question') || path.includes('edit-question')) {
    navigate('/signed-in/question-management');
  } else {
    navigate('/signed-in');
  }
}

export function QsManagePage() {
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
      <Outlet context={{reload, setReload}} />
    </div>
  )
}