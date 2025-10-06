import { useEffect } from 'react';
import { useNavigate } from 'react-router';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';

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
    <div className='min-h-screen flex items-center justify-center'>
      <div className='text-center space-y-4'>
        <div className='animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto'></div>
        <p className='text-muted-foreground'>로그인 처리 중...</p>
      </div>
    </div>
  );
};

export default LoginSuccess;
