import { Outlet } from 'react-router';
import { useContext } from 'react';
import { UserContext } from '../hooks/useUserService';
import { NotAllowedPage } from './NotAllowedPage';
import { useState } from 'react';

export function UserManagementPage() {
  const { user } = useContext(UserContext);
  const [reload, setReload] = useState(false);
  
  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minHeight: 0 }}>
      {user?.access !== 'admin' ? <NotAllowedPage /> : <Outlet context={{ reload, setReload }}/>}
    </div>
  )
}