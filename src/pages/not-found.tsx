import { useNavigate } from 'react-router';

function NotFound() {
  const navigate = useNavigate();

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50 px-6">
      <div className="w-full max-w-md rounded-lg bg-white p-8 text-center shadow-lg">
        <div className="mb-6">
          <h1 className="mb-2 text-6xl font-bold text-gray-800">404</h1>
          <div className="mx-auto h-1 w-16 bg-blue-500"></div>
        </div>
        <h2 className="mb-4 text-2xl font-bold text-gray-900">
          페이지를 찾을 수 없습니다
        </h2>
        <p className="mb-6 text-gray-600">
          요청하신 페이지가 존재하지 않거나 이동되었습니다.
        </p>
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

export default NotFound;
