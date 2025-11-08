import { Link, useNavigate } from 'react-router';

import { useAuth } from '@/app/providers/AuthContext';
import { useBookmarks } from '@/features/course/hooks/useBookmarks';
import CourseInfoCard from '@/features/course/ui/InfoCard';
import profileImgUrl from '@/shared/assets/basic_profile.png';
import { Icon } from '@/shared/icons/icon';
import {
  Avatar,
  AvatarFallback,
  AvatarImage
} from '@/shared/ui/primitives/avatar';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger
} from '@/shared/ui/primitives/tabs';

import type { Course } from '@/features/course/model/types';

function Me() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const { bookmarkList } = useBookmarks();
  const reviews = bookmarkList;

  const handleClickReview = (uuid: Course['uuid']) => {
    navigate(`/course/${uuid}?tab=review`);
  };

  return (
    <div className='bg-background min-h-screen pb-20'>
      {/* Profile Section */}
      <div className='bg-card mb-6 px-5 pt-6'>
        <div className='flex items-center gap-3'>
          <Avatar className='h-20 w-20'>
            <AvatarImage src={user?.profileUrl || ''} />
            <AvatarFallback className='bg-primary/10 text-primary text-2xl'>
              <img src={profileImgUrl} alt='Profile' width='80' height='80' />
            </AvatarFallback>
          </Avatar>
          <div className='flex flex-col'>
            <h2 className='mb-2 text-lg font-semibold'>
              {user?.userName || '런디'}
            </h2>
            <Link
              to='/me/edit'
              className='text-primary flex items-center gap-1 text-sm hover:underline'
            >
              <p className='text-muted-foreground text-sm'>프로필 수정</p>
              <Icon name='chevron_right' size={14} />
            </Link>
          </div>
        </div>
      </div>

      {/* Tabs Section */}
      <Tabs defaultValue='bookmarked'>
        <TabsList className='grid w-full grid-cols-2 border-b-[1.2px] border-gray-200 px-5'>
          <TabsTrigger value='bookmarked'>저장</TabsTrigger>
          <TabsTrigger value='review'>리뷰 남긴 코스</TabsTrigger>
        </TabsList>

        <TabsContent value='bookmarked' className='px-5'>
          {bookmarkList.length === 0 ? (
            <div className='flex flex-col items-center space-y-4 pt-30'>
              <Icon name='empty_graphic' size={120} />
              <div className='text-placeholder'>저장된 런디코스가 없어요</div>
            </div>
          ) : (
            bookmarkList.map((course: Course) => {
              return (
                <CourseInfoCard
                  key={course.uuid}
                  course={course}
                  className='cursor-pointer border-b border-b-gray-200 py-5.5 last:border-0'
                />
              );
            })
          )}
        </TabsContent>

        <TabsContent value='review' className='px-5'>
          {reviews.length === 0 ? (
            <div className='flex flex-col items-center space-y-4 pt-30'>
              <Icon name='empty_graphic' size={120} />
              <div className='text-placeholder'>작성한 리뷰가 없어요</div>
            </div>
          ) : (
            reviews.map((course: Course) => {
              return (
                <CourseInfoCard
                  key={course.uuid}
                  course={course}
                  onClick={() => handleClickReview(course.uuid)}
                  className='cursor-pointer border-b border-b-gray-200 py-5.5 last:border-0'
                />
              );
            })
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}

export default Me;
