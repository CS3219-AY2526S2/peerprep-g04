import styles from './QsManage.module.css'
import { Outlet } from 'react-router'
import { useState } from 'react';
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

export function QsManagePage() {
  const { user } = useContext(UserContext);
  const [reload, setReload] = useState(true);

  return (
    <div className={styles.main}>
      {user?.access === 'user' ? <NotAuthorizedPage /> : <Outlet context={{reload, setReload}} />}
    </div>
  )
}