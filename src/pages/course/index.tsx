import { useState, useEffect, useCallback } from 'react';

import { useHeader } from '@/app/providers/HeaderContext';
import CourseList from '@/features/course/ui/List';
import CourseMap from '@/features/course/ui/Map';
import { useLocationStore } from '@/features/map/model/location.store';

function Course() {
  const lastViewMode = useLocationStore((state) => state.lastViewMode);
  const setLastViewMode = useLocationStore((state) => state.setLastViewMode);
  const [viewMode, setViewMode] = useState<'map' | 'list'>(lastViewMode);

  const { registerViewMode, unregisterViewMode } = useHeader();

  const handleSetViewMode = useCallback(
    (mode: 'map' | 'list') => {
      setViewMode(mode);
      setLastViewMode(mode);
    },
    [setLastViewMode]
  );

  // Register view mode with HeaderContext for tab rendering
  useEffect(() => {
    registerViewMode(viewMode, handleSetViewMode);
    return () => unregisterViewMode();
  }, [viewMode, handleSetViewMode, registerViewMode, unregisterViewMode]);

  useEffect(() => {
    setLastViewMode(viewMode);
  }, [viewMode, setLastViewMode]);

  return (
    <div className='relative h-[100dvh] overflow-hidden'>
      {viewMode === 'map' ? <CourseMap /> : <CourseList />}
    </div>
  );
}

export default Course;
