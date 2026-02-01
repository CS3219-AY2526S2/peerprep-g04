import { Outlet, useNavigate } from 'react-router'
import './App.css'
import { useEffect } from 'react';

function App() {
  const navigate = useNavigate();
  
  useEffect(() => {
    navigate('/not-signed-in')
  }, []);
  
  return (
    <Outlet />
  )
}

export default App
