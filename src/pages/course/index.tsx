import { useState } from 'react';

import CourseList from '@/features/course/ui/List';
import CourseMap from '@/features/course/ui/Map';

function Course() {
  const [viewMode, setViewMode] = useState<'map' | 'list'>('map');

  return (
    <div className='relative h-[100dvh] overflow-y-hidden'>
      {viewMode === 'map' ? (
        <CourseMap onViewModeChange={() => setViewMode('list')} />
      ) : (
        <CourseList onViewModeChange={() => setViewMode('map')} />
      )}
    </div>
  );
}

export default Course;
