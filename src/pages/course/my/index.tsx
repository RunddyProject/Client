import { useCallback, useEffect, useState } from 'react';

import { useHeader } from '@/app/providers/HeaderContext';
import { useUserCourses } from '@/features/my-course/hooks/useUserCourses';
import { MyCourseList } from '@/features/my-course/ui/MyCourseList';
import { MyCourseMap } from '@/features/my-course/ui/MyCourseMap';
import LoadingSpinner from '@/shared/ui/composites/loading-spinner';

function MyCourses() {
  const [viewMode, setViewMode] = useState<'map' | 'list'>('map');
  const { registerViewMode, unregisterViewMode, setConfig, resetConfig } =
    useHeader();

  const { courses, isLoading } = useUserCourses();

  const handleSetViewMode = useCallback((mode: 'map' | 'list') => {
    setViewMode(mode);
  }, []);

  // Register/unregister view mode tabs based on course count
  useEffect(() => {
    if (isLoading) return;

    registerViewMode(viewMode, handleSetViewMode);

    return () => {
      unregisterViewMode();
      resetConfig();
    };
  }, [
    courses.length,
    isLoading,
    viewMode,
    handleSetViewMode,
    registerViewMode,
    unregisterViewMode,
    setConfig,
    resetConfig
  ]);

  if (isLoading) return <LoadingSpinner />;

  return (
    <div className='relative h-[100dvh] overflow-hidden'>
      {viewMode === 'map' ? (
        <MyCourseMap courses={courses} />
      ) : (
        <MyCourseList courses={courses} />
      )}
    </div>
  );
}

export default MyCourses;
