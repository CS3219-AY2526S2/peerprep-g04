import { Outlet, useNavigate } from 'react-router'
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

  useEffect(() => {
    checkForAccessTokenAndLogin();
  }, []);

  useEffect(() => {
    navigate((!user) ? 'not-signed-in' : 'signed-in');
  }, [user]);

  return (
    <UserContext value={userService}>
      <Outlet />
      <ToastContainer />
    </UserContext>
  )
}

export default App
