import { useState } from 'react';

import { useAuth } from '@/app/providers/AuthContext';
import { Icon } from '@/shared/icons/icon';
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
import { Button } from '@/shared/ui/primitives/button';
import {
  ToggleGroup,
  ToggleGroupItem
} from '@/shared/ui/primitives/toggle-group';

const withdrawalReasons = [
  '러닝 코스가 도움이 되지 않아서',
  '커뮤니티 기능이 별로여서',
  '사용하기 불편해서',
  '자주 사용하지 않아서',
  '기타'
];

function MeDelete() {
  const { deleteAccount } = useAuth();

  const [reasonList, setReasonList] = useState<string[]>([]);
  console.log('reasonList>>', reasonList);

  const handleToggle = (value: string) => {
    setReasonList((prev) => {
      const nextArr = prev.includes(value)
        ? prev.filter((v) => v !== value)
        : [...prev, value];
      return nextArr;
    });
  };

  return (
    <div className='flex min-h-[calc(100dvh-52px)] flex-col overflow-hidden'>
      <div className='flex-1 overflow-y-auto px-5 pt-6'>
        <div className='text-title-b23 pb-2'>
          런디에서 탈퇴하는 이유는 무엇인가요?
        </div>
        <div className='text-sec text-contents-r15 pb-12'>
          복수 선택이 가능해요
        </div>
        <ToggleGroup
          type='multiple'
          value={reasonList}
          className='w-full flex-col space-y-4'
        >
          {withdrawalReasons.map((reason) => (
            <ToggleGroupItem
              key={reason}
              value={reason}
              onClick={() => handleToggle(reason)}
              className='h-14 w-full justify-between rounded-xl p-4 data-[state=on]:bg-[#05B2D8]/10'
            >
              <div className='text-g-100 text-contents-m16'>{reason}</div>
              {reasonList.includes(reason) ? (
                <Icon name='circle_check_on' size={24} />
              ) : (
                <Icon name='circle_check_off' size={24} />
              )}
            </ToggleGroupItem>
          ))}
        </ToggleGroup>
      </div>
      <div className='text-g-50 bg-w-100 text-contents-r15 flex items-center justify-center gap-3 pt-6 pb-27'>
        <AlertDialog>
          <AlertDialogOverlay />
          <AlertDialogTrigger asChild>
            <div className='fixed bottom-0 w-full p-5'>
              <Button
                type='submit'
                size='lg'
                className='w-full'
                disabled={reasonList.length === 0}
              >
                탈퇴하기
              </Button>
            </div>
          </AlertDialogTrigger>

          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>정말 계정을 삭제하시겠어요?</AlertDialogTitle>
              <AlertDialogDescription>
                계정을 삭제하시면 모든 활동 정보가 삭제돼요
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>아니요</AlertDialogCancel>
              <AlertDialogAction onClick={() => deleteAccount(reasonList)}>
                네
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  );
}

export default MeDelete;
