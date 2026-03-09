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
import { QsCreatePage } from './QsCreatePage/QsCreatePage.jsx'
import { QsUpdatePage } from './QsUpdatePage/QsUpdatePage.jsx';
import { CollaborationPage } from './CollaborationPage/CollaborationPage.jsx';

const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
    children: [
      {
        index: true,
        element: <SignInOrUp />,
      },
      {
        path: "reset-password/:token/:userId",
        element: <ResetPasswordForm />,
      },
      {
        path: "forget-password",
        element: <ForgetPassword />,
      },
      {
        path: "room",
        element: <CollaborationPage />,
      },
      {
        path: "signed-in",
        element: <SignedInPage />,
        children: [
          {
            element: <HomePage />,
            index: true,
          },
          {
            path: "account",
            element: <AccountPage />,
          },
          {
            path: "question-management",
            element: <QsManagePage />,
            children: [
              {
                element: <QsList />,
                index: true,
              },
              {
                path: "create-question",
                element: <QsCreatePage />,
              },
              {
                path: "edit-question/:id",
                element: <QsUpdatePage />,
              },
            ],
          },
        ],
      },
    ],
  },
]);

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>,
)
