import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { createBrowserRouter, RouterProvider } from 'react-router';
import { SignInOrUp } from './NotSignedIn/SignInOrSignUp.jsx';
import { ResetPasswordForm } from './ResetPassword/ResetPassword.jsx';
import { ForgetPassword } from './ForgetPassword/ForgetPassword.jsx';

const router = createBrowserRouter([
  {
    path: '/',
    element: <App />,
    children: [
      {
        path: 'not-signed-in',
        element: <SignInOrUp />
      },
      {
        path: 'reset-password/:token/:userId',
        element: <ResetPasswordForm />
      },
      {
        path: 'forget-password',
        element: <ForgetPassword />
      },
      {
        path: 'signed-in',
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
