import { createBrowserRouter } from 'react-router';
import App from '@/App';
import Index from '@/pages/Index';
import Login from '@/pages/Login';
import NotFound from '@/pages/NotFound';
import Me from '@/pages/Me/Index';
import ProfileEdit from '@/pages/Me/Edit';
import LoginSuccess from '@/pages/LoginSuccess';

export const router = createBrowserRouter([
  {
    path: '/',
    Component: App,
    ErrorBoundary: NotFound,
    children: [
      { index: true, Component: Index },
      {
        path: 'login',
        children: [
          { index: true, Component: Login },
          { path: 'success', Component: LoginSuccess },
        ],
      },
      {
        path: 'me',
        children: [
          { index: true, Component: Me },
          { path: 'edit', Component: ProfileEdit },
        ],
      },
    ],
  },
]);
