import { useState } from 'react';
import { Link } from 'react-router';

import profileImgUrl from '@/assets/basic_profile.png';
import CourseInfoCard from '@/components/Course/InfoCard';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Icon } from '@/components/ui/icon';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from '@/contexts/AuthContext';
import { useCourses } from '@/hooks/useCourses';

function Me() {
  const { user } = useAuth();
  const { courses: savedCourses } = useCourses();
  const [savedPosts] = useState([]);

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
      <Tabs defaultValue='bookmarked' className='px-5'>
        <TabsList className='grid w-full grid-cols-2 border-b-[1.2px] border-gray-200'>
          <TabsTrigger value='bookmarked'>저장</TabsTrigger>
          <TabsTrigger value='mine'>내 게시글</TabsTrigger>
        </TabsList>

        <TabsContent value='bookmarked' className='mt-2'>
          {savedCourses.length === 0 ? (
            <div className='p-8 text-center'>
              <p className='text-muted-foreground'>저장된 코스가 없어요</p>
            </div>
          ) : (
            <ul>
              {savedCourses.map((course) => {
                return (
                  <CourseInfoCard
                    key={course.uuid}
                    course={course}
                    className='cursor-pointer border-b border-b-gray-200 py-5.5 last:border-0'
                  />
                );
              })}
            </ul>
          )}
        </TabsContent>

        <TabsContent value='mine'>
          {savedPosts.length === 0 ? (
            <div className='p-8 text-center'>
              <p className='text-muted-foreground'>내가 올린 게시글이 없어요</p>
            </div>
          ) : (
            // TODO: 내가 올린 게시글 리스트 구현
            savedPosts.map((post) => {
              return <>{post}</>;
            })
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}

export default Me;
