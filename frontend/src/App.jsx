import { Outlet, useLocation, useNavigate } from 'react-router';
import './App.css';
import { useEffect, useState } from 'react';
import { UserContext, useUserService } from './hooks/useUserService.jsx';
import { ToastContainer } from 'react-toastify';
import { Header } from './components/Header';

function App() {
  const userService = useUserService();
  const { user, checkForAccessTokenAndLogin } = userService;

  const navigate = useNavigate();
  const location = useLocation();

  const [tab, setTab] = useState(0);

  useEffect(() => {
    checkForAccessTokenAndLogin().then((res) => {
      if (res && location.pathname === '/') {
        navigate('/signed-in');
      }
    });
  }, [checkForAccessTokenAndLogin, location.pathname, navigate]);

  useEffect(() => {
    const path = location.pathname;
  
    if (path.includes('match')) setTab(1);
    else if (path.includes('question-management')) setTab(2);
    else if (path.includes('user-management')) setTab(3);
    else if (path === '/signed-in') setTab(0);
    else setTab(null);
  }, [location.pathname]);

  const hideHeaderRoutes = [
    '/',
    '/reset-password',
    '/forget-password',
  ];
  
  const hideHeader = hideHeaderRoutes.some((route) =>
    location.pathname === route
  );

  function handleTabChange(e, val) {
    setTab(val);

    switch (val) {
      case 0:
        navigate('/signed-in');
        break;
      case 1:
        navigate('/signed-in/match');
        break;
      case 2:
        navigate('/signed-in/question-management');
        break;
      case 3:
        navigate('/signed-in/user-management');
        break;
      default:
        break;
    }
  }

  return (
    <UserContext value={userService}>
      <div className="app-container">
        {!hideHeader && user && (
          <Header value={tab} onChange={handleTabChange} />
        )}

        <main className="app-content">
          <Outlet />
        </main>

        <ToastContainer autoClose={1000} />
      </div>
    </UserContext>
  );
}

export default App;