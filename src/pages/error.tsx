import { isRouteErrorResponse, useNavigate, useRouteError } from 'react-router';

import NotFound from './not-found';

function getErrorMessage(error: unknown): string {
  // Check if error is an Error instance
  if (error && typeof error === 'object' && 'message' in error) {
    return String((error as { message: unknown }).message);
  }
  // Check if it's a route error response
  if (isRouteErrorResponse(error)) {
    return error.statusText || error.data?.message || '알 수 없는 에러가 발생했습니다.';
  }
  // Check if it's a string
  if (typeof error === 'string') {
    return error;
  }
  // Check if it has a statusText property
  if (error && typeof error === 'object' && 'statusText' in error) {
    return String((error as { statusText: unknown }).statusText) || '알 수 없는 에러가 발생했습니다.';
  }
  return '알 수 없는 에러가 발생했습니다.';
}

function Error() {
  const error = useRouteError();
  const navigate = useNavigate();

  // 404 에러인 경우 NotFound 컴포넌트 표시
  if (isRouteErrorResponse(error) && error.status === 404) {
    return <NotFound />;
  }

  // 일반 에러 페이지
  const errorMessage = getErrorMessage(error);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50 px-6">
      <div className="w-full max-w-md rounded-lg bg-white p-8 text-center shadow-lg">
        <div className="mb-6">
          <svg
            className="mx-auto h-16 w-16 text-red-500"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
            />
          </svg>
        </div>
        <h1 className="mb-4 text-2xl font-bold text-gray-900">
          오류가 발생했습니다
        </h1>
        <p className="mb-6 text-gray-600">{errorMessage}</p>
        <div className="flex flex-col gap-3">
          <button
            onClick={() => navigate(-1)}
            className="rounded-lg bg-gray-500 px-6 py-3 font-medium text-white transition-colors hover:bg-gray-600"
          >
            이전 페이지로
          </button>
          <button
            onClick={() => navigate('/', { replace: true })}
            className="rounded-lg bg-blue-500 px-6 py-3 font-medium text-white transition-colors hover:bg-blue-600"
          >
            홈으로 이동
          </button>
        </div>
      </div>
    </div>
  );
}

export default Error;
