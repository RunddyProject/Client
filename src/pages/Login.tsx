import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

const Login = () => {
  const { login } = useAuth();

  return (
    <div className='min-h-screen bg-gradient-to-br from-background to-muted flex items-center justify-center p-4'>
      <Card className='w-full max-w-md'>
        <CardHeader className='text-center'>
          <CardTitle className='text-2xl font-bold'>로그인</CardTitle>
          <CardDescription>소셜 계정으로 간편하게 로그인하세요</CardDescription>
        </CardHeader>
        <CardContent className='space-y-4'>
          <Button
            onClick={() => login('kakao')}
            className='w-full bg-[#FEE500] hover:bg-[#FDD835] text-[#3A1D1D] font-semibold'
            size='lg'
          >
            <svg className='w-5 h-5 mr-2' viewBox='0 0 24 24' fill='currentColor'>
              <path d='M12 3C6.48 3 2 6.84 2 11.5c0 2.93 1.87 5.51 4.67 7.01L6 22l3.84-2.05C10.54 20.62 11.26 21 12 21c5.52 0 10-3.84 10-8.5S17.52 3 12 3z' />
            </svg>
            카카오로 로그인
          </Button>

          <Button
            onClick={() => login('naver')}
            className='w-full bg-[#03C75A] hover:bg-[#02B351] text-white font-semibold'
            size='lg'
          >
            <svg className='w-5 h-5 mr-2' viewBox='0 0 24 24' fill='currentColor'>
              <path d='M16.273 12.845L7.376 0H0v24h7.726V11.156L16.624 24H24V0h-7.727v12.845z' />
            </svg>
            네이버로 로그인
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default Login;
