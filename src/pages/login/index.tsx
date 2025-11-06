import { useAuth } from '@/app/providers/AuthContext';
import basicProfileUrl from '@/shared/assets/basic_profile.png';
import { Icon } from '@/shared/icons/icon';
import { IndicatorCarousel } from '@/shared/ui/composites/indicator-carousel';
import { Button } from '@/shared/ui/primitives/button';

const Login = () => {
  const { login } = useAuth();
  // TODO: update graphic
  const slides = [<img src={basicProfileUrl} />, <img src={basicProfileUrl} />];

  return (
    <div className='flex min-h-screen flex-col items-center'>
      <div className='mt-[58px] w-fit rounded-md bg-gray-100 px-2 py-1 text-gray-600'>
        러닝코스
      </div>
      <h3 className='mt-4 text-center text-lg font-bold'>
        진짜 러너들을 위한
        <br />
        러닝 코스를 제공해요
      </h3>
      <div className='mt-12'>
        <IndicatorCarousel slides={slides} />
      </div>
      <div className='fixed bottom-0 w-full space-y-3 p-5'>
        <Button
          onClick={() => login('kakao')}
          className='flex w-full items-center gap-2 bg-[#FEE500] font-medium text-[black]'
          size='lg'
        >
          <Icon name='kakao' size={18} />
          카카오로 시작하기
        </Button>

        <Button
          onClick={() => login('naver')}
          className='flex w-full items-center gap-2 bg-[#42D95B] font-medium text-black'
          size='lg'
        >
          <Icon name='naver' size={18} />
          네이버로 시작하기
        </Button>
      </div>
    </div>
  );
};

export default Login;
