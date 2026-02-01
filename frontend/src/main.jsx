import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { createBrowserRouter, RouterProvider } from 'react-router';
import { SignInOrUp } from './NotSignedIn/SignInOrSignUp.jsx';

const router = createBrowserRouter([
  {
    path: '/',
    element: <App />,
    children: [
      {
        index: true,
        path: '/not-signed-in',
        element: <SignInOrUp />
      },
      {
        path: '/signed-in',
        element: <div>Signed in</div>
      }
    ],
  }
]);

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <RouterProvider  router={router} />
  </StrictMode>,
)
