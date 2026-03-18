import { Outlet, useLocation, useNavigate } from 'react-router'
import './App.css'
import { useEffect } from 'react';
import { UserContext, useUserService } from './hooks/useUserService.jsx';
import { ToastContainer } from 'react-toastify';

function App() {
  const userService = useUserService();
  const  {
    user, 
    accessToken,
    checkForAccessTokenAndLogin,
  } = userService;
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    checkForAccessTokenAndLogin()
      .then(res => res && navigate(location.pathname === '/' ? '/signed-in' : location.pathname));
  }, []);

  return (
    <UserContext value={userService}>
      <Outlet />
      <ToastContainer autoClose={2000}/>
    </UserContext>
  )
}

export default App
