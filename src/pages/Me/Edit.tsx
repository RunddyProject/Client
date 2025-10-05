import { useEffect } from 'react';
import { useNavigate } from 'react-router';
import { toast } from 'sonner';
import { FormProvider, useForm } from 'react-hook-form';

import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useAuth } from '@/contexts/AuthContext';
import profileImgUrl from '@/assets/basic_profile.png';
import { WarningIcon } from '@/components/icons/warning-icon';
import { ClearableInput } from '@/components/ui/input-clearable';
import { api } from '@/lib/api';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { AlertDialogDescription } from '@radix-ui/react-alert-dialog';

type FormValues = { nickname: string };

function ProfileEdit() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { logout, deleteAccount } = useAuth();

  const methods = useForm<FormValues>({
    defaultValues: { nickname: user?.nickname || '' },
    mode: 'onChange',
  });

  const {
    handleSubmit,
    watch,
    reset,
    formState: { isSubmitting, isValid },
  } = methods;

  const nickname = watch('nickname');
  const isTooLong = (nickname?.length ?? 0) > 10;
  const disableSave = isSubmitting || !nickname?.trim() || isTooLong || !isValid;

  useEffect(() => {
    if (user?.nickname != null) reset({ nickname: user.nickname });
  }, [user?.nickname, reset]);

  const onSubmit = async () => {
    try {
      await api.patch('/users/info', { nickname });
      toast.success('프로필이 저장되었습니다');
      console.log('profile updated');
      navigate('/me');
    } catch (error) {
      toast.error('프로필이 저장에 실패했습니다');
      console.error('Failed to update profile:', error);
    }
  };

  const handleImageChange = () => toast.info('이미지 업로드 기능은 준비중입니다');

  return (
    <div className='min-h-[calc(100dvh-52px)] flex flex-col overflow-hidden'>
      <FormProvider {...methods}>
        <form onSubmit={handleSubmit(onSubmit)} className='flex flex-col flex-1 overflow-hidden'>
          <div className='flex-1 overflow-auto px-5 py-6 space-y-8'>
            <div className='flex justify-center'>
              <Avatar onClick={handleImageChange} className='w-30 h-30 cursor-pointer'>
                <AvatarImage src={user?.profileUrl || ''} />
                <AvatarFallback className='bg-primary/10 text-primary text-2xl'>
                  <img src={profileImgUrl} alt='Profile' width='80' height='80' />
                </AvatarFallback>
              </Avatar>
            </div>

            <div className='space-y-2'>
              <Label htmlFor='nickname' className='text-xs text-muted-foreground'>
                닉네임
              </Label>

              <ClearableInput
                id='nickname'
                name='nickname'
                placeholder='닉네임은 10자 이내로 작성'
                className='h-14'
                aria-invalid={isTooLong || undefined}
                autoCapitalize='none'
                autoCorrect='off'
                autoComplete='off'
                inputMode='text'
              />

              {isTooLong && (
                <div className='flex items-center text-red-600 space-x-1'>
                  <WarningIcon size={16} color='red' />
                  <p className='text-xs'>닉네임은 11자 이상 작성할 수 없어요</p>
                </div>
              )}
            </div>
          </div>

          <div className='p-5 fixed bottom-0 w-full'>
            <Button type='submit' size='lg' disabled={disableSave} className='w-full'>
              저장
            </Button>
          </div>
        </form>
      </FormProvider>

      <div className='text-gray-500 pb-27 pt-6 flex items-center justify-center gap-3 text-sm'>
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
              <AlertDialogDescription>계정을 삭제하시면 모든 활동 정보가 삭제돼요</AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>닫기</AlertDialogCancel>
              <AlertDialogAction onClick={deleteAccount}>회원탈퇴</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  );
}

export default ProfileEdit;
