import { createBrowserRouter } from 'react-router';

import App from '@/app/App';
import ProtectedRoute from '@/app/routing/ProtectedRoute';
import Home from '@/pages/home/index';
import Login from '@/pages/login/index';
import LoginSuccess from '@/pages/login/success';
import MeEdit from '@/pages/me/edit';
import Me from '@/pages/me/index';
import NotFound from '@/pages/not-found';

export const router = createBrowserRouter([
  {
    path: '/',
    element: <App />,
    errorElement: <NotFound />,
    children: [
      { index: true, element: <Home /> },
      {
        path: 'login',
        children: [
          {
            index: true,
            element: (
              <ProtectedRoute requireAuth={false}>
                <Login />
              </ProtectedRoute>
            )
          },
          { path: 'success', element: <LoginSuccess /> }
        ]
      },
      {
        path: 'me',
        children: [
          {
            index: true,
            element: (
              <ProtectedRoute>
                <Me />
              </ProtectedRoute>
            )
          },
          {
            path: 'edit',
            element: (
              <ProtectedRoute>
                <MeEdit />
              </ProtectedRoute>
            )
          }
        ]
      }
    ]
  }
]);
