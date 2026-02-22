import Typography from '@mui/material/Typography'
import styles from './QsManage.module.css'
import { Outlet } from 'react-router'

export function QsManagePage() {
  return (
    <div className={styles.main}>
      <div className={styles.header}>
        <Typography>Question Management</Typography>
      </div>
      <Outlet />
    </div>
  )
}