import { Link, useNavigate } from 'react-router';

import { useAuth } from '@/app/providers/AuthContext';
import CourseInfoCard from '@/features/course/ui/InfoCard';
import { useUserBookmarks } from '@/features/user/hooks/useUserBookmarks';
import { useUserReviews } from '@/features/user/hooks/useUserReviews';
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

  const { bookmarkList } = useUserBookmarks();
  const { courseList } = useUserReviews();

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
              <Icon name='basic_profile' size={80} />
            </AvatarFallback>
          </Avatar>
          <div className='flex flex-col'>
            <div className='text-title-b21 mb-2'>
              {user?.userName || '런디'}
            </div>
            <Link
              to='/me/edit'
              className='text-primary text-contents-r15 flex items-center gap-1 hover:underline'
            >
              <p className='text-ter text-contents-m15'>프로필 수정</p>
              <Icon name='chevron_right' size={14} />
            </Link>
          </div>
        </div>
      </div>

      {/* Tabs Section */}
      <Tabs defaultValue='bookmarked'>
        <TabsList className='border-g-20 grid w-full grid-cols-2 border-b-[1.2px] px-5'>
          <TabsTrigger value='bookmarked'>저장</TabsTrigger>
          <TabsTrigger value='review'>리뷰 남긴 코스</TabsTrigger>
        </TabsList>

        <TabsContent value='bookmarked' className='px-5'>
          {bookmarkList.length === 0 ? (
            <div className='flex flex-col items-center space-y-4 pt-30'>
              <Icon name='empty_graphic' size={100} />
              <div className='text-placeholder'>저장된 런디코스가 없어요</div>
            </div>
          ) : (
            bookmarkList.map((course: Course) => {
              return (
                <CourseInfoCard
                  key={course.uuid}
                  course={course}
                  className='border-b-g-20 cursor-pointer border-b py-5.5 last:border-0'
                />
              );
            })
          )}
        </TabsContent>

        <TabsContent value='review' className='px-5'>
          {courseList.length === 0 ? (
            <div className='flex flex-col items-center space-y-4 pt-30'>
              <Icon name='empty_graphic' size={100} />
              <div className='text-placeholder'>리뷰를 남긴 코스가 없어요</div>
            </div>
          ) : (
            courseList.map((course: Course) => {
              return (
                <CourseInfoCard
                  key={course.uuid}
                  course={course}
                  onClick={() => handleClickReview(course.uuid)}
                  className='border-b-g-20 cursor-pointer border-b py-5.5 last:border-0'
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
