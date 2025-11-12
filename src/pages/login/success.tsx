import { useEffect } from 'react';
import { useNavigate } from 'react-router';
import { toast } from 'sonner';

import { authService } from '@/features/user/api/auth';

const LoginSuccess = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const handleLoginSuccess = async () => {
      try {
        const token = await authService.getAccessToken();

        if (token) {
          toast.success('로그인 성공');
          navigate('/', { replace: true });
        } else {
          toast.error('토큰 발급 실패');
          navigate('/login', { replace: true });
        }
      } catch (error) {
        console.error('[LoginSuccess] 로그인 처리 실패:', error);
        toast.error('로그인 실패');
        navigate('/login', { replace: true });
      }
    };

    handleLoginSuccess();
  }, [navigate]);

  return (
    <div className='flex min-h-screen items-center justify-center'>
      <div className='space-y-4 text-center'>
        <div className='border-primary mx-auto h-12 w-12 animate-spin rounded-full border-b-2'></div>
        <p className='text-ter'>로그인 처리 중...</p>
      </div>
    </div>
  );
};

export default LoginSuccess;
