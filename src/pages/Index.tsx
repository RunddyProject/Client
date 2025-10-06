import { useState } from 'react';
import CourseList from '@/components/Course/List';
import CourseMap from '@/components/Course/Map';

function Index() {
  const [viewMode, setViewMode] = useState<'map' | 'list'>('map');

  return (
    <div className='h-screen flex flex-col'>
      {viewMode === 'map' ? (
        <CourseMap onViewModeChange={() => setViewMode('list')} />
      ) : (
        <CourseList onViewModeChange={() => setViewMode('map')} />
      )}
    </div>
  );
}

export default Index;
