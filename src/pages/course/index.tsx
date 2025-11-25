import { useState, useEffect } from 'react';

import CourseList from '@/features/course/ui/List';
import CourseMap from '@/features/course/ui/Map';
import { useLocationStore } from '@/features/map/model/location.store';

function Course() {
  const lastViewMode = useLocationStore((state) => state.lastViewMode);
  const setLastViewMode = useLocationStore((state) => state.setLastViewMode);
  const [viewMode, setViewMode] = useState<'map' | 'list'>(lastViewMode);

  useEffect(() => {
    setLastViewMode(viewMode);
  }, [viewMode, setLastViewMode]);

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
