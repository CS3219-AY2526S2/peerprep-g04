import { Outlet, useLocation, useNavigate } from 'react-router';
import './App.css';
import { useEffect, useState } from 'react';
import { UserContext, useUserService } from './hooks/useUserService.jsx';
import { ToastContainer } from 'react-toastify';
import { Header } from './components/Header';
import { HeaderContext } from './contexts/HeaderContext';

function App() {
  const userService = useUserService();
  const { user, checkForAccessTokenAndLogin } = userService;

  const navigate = useNavigate();
  const location = useLocation();

  const [tab, setTab] = useState(0);
  const [showHeader, setShowHeader] = useState(true);

  useEffect(() => {
    checkForAccessTokenAndLogin()
      .then(res => res && navigate(location.pathname === '/' ? '/signed-in' : location.pathname));
  }, []);

  useEffect(() => {
    if (!user) navigate('/');
  }, [user]);

  useEffect(() => {
    const path = location.pathname;

    if (path.includes('match')) setTab(1);
    else if (path.includes('question-management')) setTab(2);
    else if (path.includes('user-management')) setTab(3);
    else if (path === '/signed-in') setTab(0);
    else setTab(null);
  }, [location.pathname]);

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
      <HeaderContext.Provider value={{ showHeader, setShowHeader }}>
        <div className="app-container">
          {showHeader && user && (
            <Header value={tab} onChange={handleTabChange} />
          )}

          <main className="app-content">
            <Outlet />
          </main>

          <ToastContainer autoClose={1000} />
        </div>
      </HeaderContext.Provider>
    </UserContext>
  );
}

export default App;