import { useEffect } from 'react';
import { useNavigate } from 'react-router';
import { toast } from 'sonner';

import { useAuth } from '@/app/providers/AuthContext';

const LoginSuccess = () => {
  const navigate = useNavigate();
  const { refreshAuth } = useAuth();

  useEffect(() => {
    const handleLoginSuccess = async () => {
      try {
        await refreshAuth();

        toast.success('로그인 성공');
        navigate('/', { replace: true });
      } catch (error) {
        toast.error('로그인 실패');
        navigate('/login', { replace: true });
      }
    };

    handleLoginSuccess();
  }, [navigate, refreshAuth]);

  return (
    <div className='flex min-h-screen items-center justify-center'>
      <div className='space-y-4 text-center'>
        <div className='border-primary mx-auto h-12 w-12 animate-spin rounded-full border-b-2'></div>
        <p className='text-muted-foreground'>로그인 처리 중...</p>
      </div>
    </div>
  );
};

export default LoginSuccess;
