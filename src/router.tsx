import { createBrowserRouter } from 'react-router';
import App from '@/App';
import Index from '@/pages/Index';
import Login from '@/pages/Login';
import NotFound from '@/pages/NotFound';
import Me from '@/pages/Me/Index';
import ProfileEdit from '@/pages/Me/Edit';
import LoginSuccess from '@/pages/LoginSuccess';
import ProtectedRoute from '@/components/ProtectedRoute';

export const router = createBrowserRouter([
  {
    path: '/',
    element: <App />,
    errorElement: <NotFound />,
    children: [
      { index: true, element: <Index /> },
      {
        path: 'login',
        children: [
          {
            index: true,
            element: (
              <ProtectedRoute requireAuth={false}>
                <Login />
              </ProtectedRoute>
            ),
          },
          { path: 'success', element: <LoginSuccess /> },
        ],
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
            ),
          },
          {
            path: 'edit',
            element: (
              <ProtectedRoute>
                <ProfileEdit />
              </ProtectedRoute>
            ),
          },
        ],
      },
    ],
  },
]);
