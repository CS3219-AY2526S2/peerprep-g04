import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { createBrowserRouter, RouterProvider } from 'react-router';
import { SignInOrUp } from './NotSignedIn/SignInOrSignUp.jsx';
import { ResetPasswordForm } from './ResetPassword/ResetPassword.jsx';
import { ForgetPassword } from './ForgetPassword/ForgetPassword.jsx';
import { HomePage } from './HomePage/HomePage.jsx';
import { AccountPage } from './AccountPage/AccountPage.jsx';
import { SignedInPage } from './SignedInPage/SignedInPage.jsx';

const router = createBrowserRouter([
  {
    path: '/',
    element: <App />,
    children: [
      {
        index: true,
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
        element: <SignedInPage />,
        children: [
          {
            element: <HomePage />,
            index: true,
          },
          {
            path: 'account',
            element: <AccountPage />
          },
          {
            path: 'question-management',
            element: <div>question</div>,
            children: [
              {
                element: <div>question list</div>,
                index: true,
              },
              {
                path: 'create-question',
                element: <div>create question</div>,
              },
              {
                path: 'edit-question/:id',
                element: <div>edit question</div>,
              }
            ]
          }
        ]
      }
    ],
  }
]);

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>,
)
