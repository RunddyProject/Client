import { useEffect } from 'react';
import { FormProvider, useForm } from 'react-hook-form';
import { useNavigate } from 'react-router';
import { toast } from 'sonner';

import profileImgUrl from '@/assets/basic_profile.png';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
  AlertDialogDescription
} from '@/components/ui/alert-dialog';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Icon } from '@/components/ui/icon';
import { ClearableInput } from '@/components/ui/input-clearable';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/contexts/AuthContext';
import { api } from '@/lib/api/api';

type FormValues = { userName: string };

function ProfileEdit() {
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
              <Label
                htmlFor='userName'
                className='text-muted-foreground text-xs'
              >
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
                <div className='text-error flex items-center space-x-1'>
                  <Icon
                    name='warning'
                    size={16}
                    color='currentColor'
                    className='text-error'
                  />
                  <p className='text-xs'>닉네임은 11자 이상 작성할 수 없어요</p>
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

      <div className='flex items-center justify-center gap-3 pt-6 pb-27 text-sm text-gray-500'>
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button variant='ghost'>로그아웃</Button>
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
        <span aria-hidden>|</span>
        <AlertDialog>
          <AlertDialogTrigger asChild>
            {/* TODO: navigate to /me/delete */}
            <Button variant='ghost'> 회원탈퇴</Button>
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
              {/* TODO: update user reasonList */}
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

export default ProfileEdit;
