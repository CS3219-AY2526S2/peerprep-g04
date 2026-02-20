import { Outlet, useLocation, useNavigate } from 'react-router'
import './App.css'
import { useEffect } from 'react';
import { UserContext, useUserService } from './hooks/useUserService.jsx';
import { toast, ToastContainer } from 'react-toastify';

function App() {
  const userService = useUserService();
  const  {
    user, 
    checkForAccessTokenAndLogin,
  } = userService;

  useEffect(() => {
    checkForAccessTokenAndLogin();
  }, []);

  return (
    <UserContext value={userService}>
      <Outlet />
      <ToastContainer />
    </UserContext>
  )
}

export default App
