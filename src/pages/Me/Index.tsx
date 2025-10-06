import { useState } from 'react';
import { Link, useNavigate } from 'react-router';

import { useAuth } from '@/contexts/AuthContext';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import profileImgUrl from '@/assets/basic_profile.png';
import { Icon } from '@/components/ui/icon';

const mockSavedCourses = [
  { id: '1', name: '한강 코스', keyword: '공원', distance: 10.5, level: 2 },
  { id: '2', name: '냥냥 코스', keyword: '공원', distance: 12, level: 3 },
];

function Me() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [savedCourses] = useState(mockSavedCourses);
  const [savedPosts] = useState([]);

  return (
    <div className='min-h-screen bg-background pb-20'>
      {/* Profile Section */}
      <div className='bg-card px-5 pt-6 mb-6'>
        <div className='flex items-center gap-3'>
          <Avatar className='w-20 h-20'>
            <AvatarImage src={user?.profileUrl || ''} />
            <AvatarFallback className='bg-primary/10 text-primary text-2xl'>
              <img src={profileImgUrl} alt='Profile' width='80' height='80' />
            </AvatarFallback>
          </Avatar>
          <div className='flex flex-col'>
            <h2 className='text-lg font-semibold mb-2'>{user?.userName || '런디'}</h2>
            <Link to='/me/edit' className='flex items-center gap-1 text-sm text-primary hover:underline'>
              <p className='text-sm text-muted-foreground'>프로필 수정</p>
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
                  <li
                    key={course.id}
                    className='cursor-pointer py-[22px] flex items-center gap-4 border-b border-gray-200 last:border-0'
                    onClick={() => navigate(`/course/${course.id}`)}
                  >
                    <div className='w-15 h-15 rounded-xl bg-gray-200 flex items-center justify-center flex-shrink-0'>
                      {/* <img src={course.minimap} width='60' height='60' /> */}
                    </div>
                    <div className='flex flex-col gap-2 flex-1'>
                      <div className='flex items-center justify-between'>
                        <h3 className='font-semibold truncate'>{course.name}</h3>
                        <Icon name='save_on_solid' size={24} />
                      </div>
                      <div className='flex items-center gap-1'>
                        <Badge>Lv.{course.level}</Badge>
                        <Badge>{course.keyword}</Badge>
                        <Badge>{course.distance}km</Badge>
                      </div>
                    </div>
                  </li>
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
