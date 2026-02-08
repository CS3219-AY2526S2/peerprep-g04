import { Outlet, useLocation, useNavigate } from 'react-router'
import './App.css'
import { useEffect } from 'react';
import { UserContext, useUserService } from './hooks/useUserService.jsx';
import { toast, ToastContainer } from 'react-toastify';

function App() {
  const navigate = useNavigate();
  
  const userService = useUserService();
  const  {
    user, 
    checkForAccessTokenAndLogin,
  } = userService;

  const location = useLocation();

  useEffect(() => {
    checkForAccessTokenAndLogin();
  }, []);

  useEffect(() => {
    if (
      ['/forget-password', '/reset-password']
        .find(path => location.pathname.startsWith(path))
    ) {
      return;
    }
    navigate(!user ? '/not-signed-in' : '/signed-in');
  }, [user]);

  return (
    <UserContext value={userService}>
      <Outlet />
      <ToastContainer />
    </UserContext>
  )
}

export default App
