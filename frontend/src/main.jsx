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
import { QsManagePage } from './QsManagePage/QsManagePage.jsx';
import { QsList } from './QsList/QsList.jsx';
import { MatchMainPage } from './Match/MatchMainPage.jsx';
import { UserManagementPage } from './UserManagement/UserManagementPage.jsx';
import { UserListPage } from './UserManagement/UserListPage.jsx';
import { DashboardPage } from './DashboardPage/DashboardPage.jsx';

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
            path: 'dashboard',
            element: <DashboardPage />
          },
          {
            path: 'match',
            element: <MatchMainPage />
          },
          {
            path: 'question-management',
            element: <QsManagePage />,
            children: [
              {
                element: <QsList />,
                index: true,
              }
            ]
          },
          {
            path: 'user-management',
            element: <UserManagementPage />,
            children: [
              {
                element: <UserListPage />,
                index: true,
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
