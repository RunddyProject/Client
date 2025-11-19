import { useAuth } from '@/app/providers/AuthContext';
import onboarding01ImageUrl from '@/shared/assets/onboarding01.png';
import onboarding02ImageUrl from '@/shared/assets/onboarding02.png';
import { Icon } from '@/shared/icons/icon';
import { IndicatorCarousel } from '@/shared/ui/composites/indicator-carousel';
import { Button } from '@/shared/ui/primitives/button';

const Login = () => {
  const { login } = useAuth();
  const slides = [
    <img src={onboarding01ImageUrl} width={220} height={220} />,
    <img src={onboarding02ImageUrl} width={220} height={220} />
  ];

  return (
    <div className='flex min-h-screen flex-col items-center'>
      <div className='bg-g-10 text-g-60 text-caption-m12 mt-[58px] w-fit rounded-md px-2 py-1'>
        충분한 정보 탐색
      </div>
      <div className='text-g-90 text-title-b21 mt-4 mb-12 text-center'>
        상세한 코스 정보와 러너들의 리뷰를
        <br />
        간편하게 확인할 수 있어요
      </div>
      <div>
        <IndicatorCarousel slides={slides} />
      </div>
      <div className='fixed bottom-0 w-full space-y-3 p-5'>
        <Button
          onClick={() => login('kakao')}
          className='flex w-full items-center gap-2 bg-[#FEE500] font-medium text-[black]'
          size='lg'
        >
          <Icon name='kakao' size={18} />
          <span className='text-g-black text-contents-m16'>
            카카오로 시작하기
          </span>
        </Button>

        <Button
          onClick={() => login('naver')}
          className='flex w-full items-center gap-2 bg-[#42D95B] font-medium text-black'
          size='lg'
        >
          <Icon name='naver' size={18} />
          <span className='text-g-black text-contents-m16'>
            네이버로 시작하기
          </span>
        </Button>
      </div>
    </div>
  );
};

export default Login;
