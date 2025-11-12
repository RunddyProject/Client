import { useEffect } from 'react';
import { FormProvider, useForm } from 'react-hook-form';
import { useNavigate } from 'react-router';
import { toast } from 'sonner';

import { useAuth } from '@/app/providers/AuthContext';
import profileImgUrl from '@/shared/assets/basic_profile.png';
import { Icon } from '@/shared/icons/icon';
import { api } from '@/shared/lib/http';
import { ClearableInput } from '@/shared/ui/composites/input-clearable';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
  AlertDialogDescription,
  AlertDialogOverlay
} from '@/shared/ui/primitives/alert-dialog';
import {
  Avatar,
  AvatarFallback,
  AvatarImage
} from '@/shared/ui/primitives/avatar';
import { Button } from '@/shared/ui/primitives/button';
import { Label } from '@/shared/ui/primitives/label';

type FormValues = { userName: string };

function MeEdit() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { logout, deleteAccount } = useAuth();

  const methods = useForm<FormValues>({
    defaultValues: { userName: user?.userName || '' },
    mode: 'onChange'
  });

  const {
    handleSubmit,
    watch,
    reset,
    formState: { isSubmitting, isValid }
  } = methods;

  const userName = watch('userName');
  const isTooLong = (userName?.length ?? 0) > 10;
  const disableSave =
    isSubmitting || !userName?.trim() || isTooLong || !isValid;

  useEffect(() => {
    if (user?.userName != null) reset({ userName: user.userName });
  }, [user?.userName, reset]);

  const onSubmit = async () => {
    try {
      await api.patch('/users/info', { userName });
      toast.success('프로필이 저장되었습니다');
      console.log('profile updated');
      navigate('/me');
    } catch (error) {
      toast.error('프로필이 저장에 실패했습니다');
      console.error('Failed to update profile:', error);
    }
  };

  const handleImageChange = () =>
    toast.info('이미지 업로드 기능은 준비중입니다');

  return (
    <div className='flex min-h-[calc(100dvh-52px)] flex-col overflow-hidden'>
      <FormProvider {...methods}>
        <form
          onSubmit={handleSubmit(onSubmit)}
          className='flex flex-1 flex-col overflow-hidden'
        >
          <div className='flex-1 space-y-8 overflow-auto px-5 py-6'>
            <div className='flex justify-center'>
              <Avatar
                onClick={handleImageChange}
                className='h-30 w-30 cursor-pointer'
              >
                <AvatarImage src={user?.profileUrl || ''} />
                <AvatarFallback className='bg-primary/10 text-primary text-2xl'>
                  <img
                    src={profileImgUrl}
                    alt='Profile'
                    width='80'
                    height='80'
                  />
                </AvatarFallback>
              </Avatar>
            </div>

            <div className='space-y-2'>
              <Label htmlFor='userName' className='text-g-60 text-caption-m12'>
                닉네임
              </Label>

              <ClearableInput
                id='userName'
                name='userName'
                placeholder='닉네임은 10자 이내로 작성'
                className='h-14'
                aria-invalid={isTooLong || undefined}
                autoCapitalize='none'
                autoCorrect='off'
                autoComplete='off'
                inputMode='text'
              />

              {isTooLong && (
                <div className='text-state-error flex items-center space-x-1'>
                  <Icon
                    name='warning'
                    size={16}
                    color='currentColor'
                    className='text-state-error'
                  />
                  <p className='text-contents-r14'>
                    닉네임은 11자 이상 작성할 수 없어요
                  </p>
                </div>
              )}
            </div>
          </div>
          {/* TODO: sticky footer */}
          <div className='fixed bottom-0 w-full p-5'>
            <Button
              type='submit'
              size='lg'
              disabled={disableSave}
              className='w-full'
            >
              저장
            </Button>
          </div>
        </form>
      </FormProvider>

      <div className='text-g-50 bg-w-100 text-contents-r15 flex items-center justify-center gap-3 pt-6 pb-27'>
        <AlertDialog>
          <AlertDialogOverlay />

          <AlertDialogTrigger asChild>
            <Button variant='ghost'>
              <span className='text-g-50 text-contents-r14'>로그아웃</span>
            </Button>
          </AlertDialogTrigger>

          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>런디에서 로그아웃 하시겠어요?</AlertDialogTitle>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>닫기</AlertDialogCancel>
              <AlertDialogAction onClick={logout}>로그아웃</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
        <span className='text-g-50 text-contents-r14'>|</span>
        <AlertDialog>
          <AlertDialogTrigger asChild>
            {/* TODO: navigate to /me/delete */}
            <Button variant='ghost'>
              <span className='text-g-50 text-contents-r14'>회원탈퇴</span>
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>정말 계정을 삭제하시겠어요?</AlertDialogTitle>
              <AlertDialogDescription>
                계정을 삭제하시면 모든 활동 정보가 삭제돼요
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>닫기</AlertDialogCancel>
              {/* TODO: update user reasonList! */}
              <AlertDialogAction
                onClick={() =>
                  deleteAccount([
                    '러닝 코스가 도움이 되지 않아서',
                    '커뮤니티 기능이 별로여서',
                    '사용하기 불편해서',
                    '자주 사용하지 않아서'
                  ])
                }
              >
                회원탈퇴
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  );
}

export default MeEdit;
