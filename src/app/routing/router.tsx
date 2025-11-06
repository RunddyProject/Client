import { createBrowserRouter } from 'react-router';

import App from '@/app/App';
import ProtectedRoute from '@/app/routing/ProtectedRoute';
import Course from '@/pages/course/index';
import CourseInfo from '@/pages/course/info';
import CourseInfoLayout from '@/pages/course/info-layout';
import CourseInfoMap from '@/pages/course/info-map';
import Login from '@/pages/login/index';
import LoginSuccess from '@/pages/login/success';
import MeEdit from '@/pages/me/edit';
import Me from '@/pages/me/index';
import NotFound from '@/pages/not-found';
import { ShareButton } from '@/shared/ui/actions/ShareButton';

type HeaderMeta = {
  title?: string;
  showBackButton?: boolean;
  showMenu?: boolean;
  leftButton?: React.ReactNode;
  rightButton?: React.ReactNode;
};

export const router = createBrowserRouter([
  {
    path: '/',
    element: <App />,
    handle: { header: { showMenu: true } satisfies HeaderMeta },
    errorElement: <NotFound />,
    children: [
      { index: true, element: <Course /> },
      {
        path: 'course',
        children: [
          { index: true, element: <Course /> },
          {
            path: ':uuid',
            element: <CourseInfoLayout />,
            children: [
              {
                index: true,
                element: <CourseInfo />,
                handle: {
                  header: { title: '코스 정보', rightButton: <ShareButton /> }
                }
              },
              {
                path: 'map',
                element: <CourseInfoMap />,
                handle: { header: { title: '상세보기', rightButton: null } }
              }
            ]
          }
        ]
      },
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
            handle: { header: { showHeader: false } }
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
            ),
            handle: { header: { title: '프로필 수정' } }
          }
        ]
      }
    ]
  }
]);
