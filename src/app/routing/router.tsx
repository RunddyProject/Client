import { lazy, Suspense } from 'react';
import { createBrowserRouter } from 'react-router';

import App from '@/app/App';
import ProtectedRoute from '@/app/routing/ProtectedRoute';
import { ShareButton } from '@/shared/ui/actions/ShareButton';
import LoadingSpinner from '@/shared/ui/composites/loading-spinner';

import type { ReactNode } from 'react';

const Course = lazy(() => import('@/pages/course/index'));
const CourseInfo = lazy(() => import('@/pages/course/info'));
const CourseInfoLayout = lazy(() => import('@/pages/course/info-layout'));
const CourseInfoMap = lazy(() => import('@/pages/course/info-map'));
const MyCourseEdit = lazy(() => import('@/pages/course/my/edit'));
const MyCourses = lazy(() => import('@/pages/course/my/index'));
const CourseUpload = lazy(() => import('@/pages/course/upload'));
const Error = lazy(() => import('@/pages/error'));
const Login = lazy(() => import('@/pages/login/index'));
const LoginSuccess = lazy(() => import('@/pages/login/success'));
const Me = lazy(() => import('@/pages/me/index'));
const MeDelete = lazy(() => import('@/pages/me/delete'));
const MeEdit = lazy(() => import('@/pages/me/edit'));
const NotFound = lazy(() => import('@/pages/not-found'));
const StravaActivities = lazy(() => import('@/pages/strava/activities'));
const StravaSuccess = lazy(() => import('@/pages/strava/success'));

function withSuspense(node: ReactNode) {
  return <Suspense fallback={<LoadingSpinner />}>{node}</Suspense>;
}

type HeaderMeta = {
  title?: string;
  showBackButton?: boolean;
  showMenu?: boolean;
  leftButton?: ReactNode;
  rightButton?: ReactNode;
};

export const router = createBrowserRouter([
  {
    path: '/',
    element: <App />,
    handle: { header: { showMenu: true } satisfies HeaderMeta },
    errorElement: withSuspense(<Error />),
    children: [
      { index: true, element: withSuspense(<Course />) },
      {
        path: 'course',
        children: [
          { index: true, element: withSuspense(<Course />) },
          {
            path: 'my',
            children: [
              {
                index: true,
                element: withSuspense(
                  <ProtectedRoute>
                    <MyCourses />
                  </ProtectedRoute>
                ),
                handle: {
                  header: { showBackButton: false, rightButton: null }
                }
              },
              {
                path: ':uuid/edit',
                element: withSuspense(
                  <ProtectedRoute>
                    <MyCourseEdit />
                  </ProtectedRoute>
                ),
                handle: {
                  header: { title: '코스 수정하기', rightButton: null }
                }
              }
            ]
          },
          {
            path: 'upload',
            element: withSuspense(
              <ProtectedRoute>
                <CourseUpload />
              </ProtectedRoute>
            ),
            handle: { header: { title: '코스 등록하기', rightButton: null } }
          },
          {
            path: ':uuid',
            element: withSuspense(<CourseInfoLayout />),
            children: [
              {
                index: true,
                element: withSuspense(<CourseInfo />),
                handle: {
                  header: { title: '코스 정보', rightButton: <ShareButton /> }
                }
              },
              {
                path: 'map',
                element: withSuspense(<CourseInfoMap />),
                handle: { header: { title: '상세보기', rightButton: null } }
              }
            ]
          }
        ]
      },
      {
        path: 'strava',
        children: [
          {
            path: 'success',
            element: withSuspense(<StravaSuccess />),
            handle: { header: { showHeader: false } }
          },
          {
            path: 'activities',
            element: withSuspense(
              <ProtectedRoute>
                <StravaActivities />
              </ProtectedRoute>
            ),
            handle: {
              header: {
                title: 'Strava에서 가져오기',
                showBackButton: true,
                rightButton: null
              }
            }
          }
        ]
      },
      {
        path: 'login',
        children: [
          {
            index: true,
            element: withSuspense(
              <ProtectedRoute requireAuth={false}>
                <Login />
              </ProtectedRoute>
            ),
            handle: { header: { showHeader: false } }
          },
          { path: 'success', element: withSuspense(<LoginSuccess />) }
        ]
      },
      {
        path: 'me',
        children: [
          {
            index: true,
            element: withSuspense(
              <ProtectedRoute>
                <Me />
              </ProtectedRoute>
            )
          },
          {
            path: 'edit',
            element: withSuspense(
              <ProtectedRoute>
                <MeEdit />
              </ProtectedRoute>
            ),
            handle: { header: { title: '프로필 수정', rightButton: null } }
          },
          {
            path: 'delete',
            element: withSuspense(
              <ProtectedRoute>
                <MeDelete />
              </ProtectedRoute>
            ),
            handle: { header: { title: '회원탈퇴', rightButton: null } }
          },
          {
            path: '*',
            element: withSuspense(<NotFound />)
          }
        ]
      }
    ]
  }
]);
