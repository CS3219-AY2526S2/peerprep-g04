import Typography from '@mui/material/Typography'
import styles from './QsManage.module.css'
import { Outlet } from 'react-router'
import { useState } from 'react';

export function QsManagePage() {
  const [reload, setReload] = useState(true);
  
  return (
    <div className={styles.main}>
      <div className={styles.header}>
        <Typography>Question Management</Typography>
      </div>
      <Outlet context={{reload, setReload}} />
    </div>
  )
}