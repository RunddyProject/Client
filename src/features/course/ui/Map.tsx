import { useEffect, useState, useRef } from 'react';
import { toast } from 'sonner';

import { useCourses } from '@/features/course/hooks/useCourses';
import CourseFilter from '@/features/course/ui/Filter';
import CourseInfoCard from '@/features/course/ui/InfoCard';
import { NaverMap } from '@/features/map/ui/NaverMap';
import { Icon } from '@/shared/icons/icon';
import { Button } from '@/shared/ui/primitives/button';
import { Input } from '@/shared/ui/primitives/input';
interface CourseMapProps {
  onViewModeChange: () => void;
}

const CourseMap = ({ onViewModeChange }: CourseMapProps) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const markersRef = useRef<any[]>([]);
  // TODO: store userLocation in localStorage
  const [userLocation, setUserLocation] = useState<{
    lat: number;
    lng: number;
  }>({
    lat: 37.5665,
    lng: 126.978
  });
  const { courses } = useCourses(userLocation);
  const [activeCourseId, setActiveCourseId] = useState<string | null>(
    courses[0]?.uuid ?? null
  );
  // const activeCourse = courses.find((c) => c.uuid === activeCourseId) ?? courses[0];

  // Initialize map
  useEffect(() => {
    if (!mapRef.current || !window.naver?.maps) return;

    const mapOptions = {
      center: new window.naver.maps.LatLng(userLocation.lat, userLocation.lng),
      zoom: 13,
      zoomControl: false,
      mapTypeControl: false
    };

    mapInstanceRef.current = new window.naver.maps.Map(
      mapRef.current,
      mapOptions
    );
  }, [userLocation]);

  // Add markers
  useEffect(() => {
    if (!mapInstanceRef.current || courses.length === 0) return;

    // Clear existing markers
    markersRef.current.forEach((marker) => marker.setMap(null));
    markersRef.current = [];

    // Add new markers
    courses.forEach((course) => {
      const marker = new window.naver.maps.Marker({
        position: new window.naver.maps.LatLng(course.lat, course.lng),
        map: mapInstanceRef.current
      });

      window.naver.maps.Event.addListener(marker, 'click', () => {
        setActiveCourseId(course.uuid);
      });

      markersRef.current.push(marker);
    });
  }, [courses, activeCourseId]);

  const handleCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const newLocation = {
            lat: position.coords.latitude,
            lng: position.coords.longitude
          };
          setUserLocation(newLocation);

          if (mapInstanceRef.current) {
            mapInstanceRef.current.setCenter(
              new window.naver.maps.LatLng(newLocation.lat, newLocation.lng)
            );
          }

          toast.success('현재 위치 설정 완료');
        },
        (error) => {
          console.error('Failed to get location:', error);
          toast.error('위치 정보 가져오기 실패');
        }
      );
    }
  };

  return (
    <div className='relative h-[100dvh]'>
      <NaverMap
        className='absolute inset-0'
        markers={courses.map((c) => ({
          id: c.uuid,
          lat: c.lat,
          lng: c.lng
        }))}
        focusKey={activeCourseId ?? undefined}
        onMarkerClick={(id) => setActiveCourseId(id)}
      />

      <div className='pointer-events-none absolute top-[calc(env(safe-area-inset-top)+52px)] right-0 bottom-0 left-0 z-10 grid grid-rows-[auto_1fr_auto]'>
        {/* Search bar */}
        <div className='pointer-events-auto px-5 pt-[calc(env(safe-area-inset-top)+12px)]'>
          <div className='relative'>
            <Icon
              name='search'
              size={24}
              className='absolute top-1/2 left-4 -translate-y-1/2'
            />
            <Input
              placeholder='원하는 지역 검색'
              className='bg-white pl-13'
              onClick={onViewModeChange}
              readOnly
            />
          </div>
        </div>

        {/* Filter */}
        <div className='mt-3 px-5'>
          <CourseFilter initialCount={courses.length} />
        </div>

        {/* Bottom */}
        <div className='pointer-events-auto space-y-2 px-5 pb-[calc(env(safe-area-inset-bottom)+20px)]'>
          {/* Controls */}
          <div className='flex items-end justify-between'>
            <div className='flex flex-col gap-2'>
              {/* <Button
                size='icon'
                variant='secondary'
                className='rounded-full w-9.5 h-9.5 shadow-lg bg-white'
                onClick={handleWeather}
              >
                <Icon name='weather' size={24} />
              </Button> */}
              <Button
                size='icon'
                variant='secondary'
                className='h-9.5 w-9.5 rounded-full bg-white shadow-lg'
                onClick={handleCurrentLocation}
              >
                <Icon name='my_location' size={24} />
              </Button>
            </div>

            <Button
              variant='secondary'
              className='rounded-full bg-white px-3 shadow-lg'
              onClick={onViewModeChange}
            >
              <Icon
                name='list'
                size={20}
                color='currentColor'
                className='text-gray-600'
              />
              목록 보기
            </Button>
          </div>
        </div>

        {/* Course info card */}
        {courses.length === 0 && (
          <div className='px-4 pb-5'>
            <div className='flex [touch-action:none] gap-4 rounded-2xl bg-white p-5 shadow-xl'>
              <div className='bg-muted/60 flex h-12 w-12 items-center justify-center rounded-xl'>
                course
              </div>
              <div className='flex-1'>
                <p className='font-semibold'>조건에 맞는 코스가 없어요</p>
                <p className='text-muted-foreground text-sm'>
                  설정된 필터를 변경해 보세요
                </p>
              </div>
            </div>
          </div>
        )}

        {courses.length === 1 && (
          <div className='px-4 pb-5'>
            <CourseInfoCard
              course={courses[0]}
              className='rounded-2xl p-5 shadow-xl'
            />
          </div>
        )}

        {courses.length > 1 && (
          <div
            className='no-scrollbar pointer-events-auto flex touch-pan-x snap-x snap-mandatory [scroll-padding-right:16px] [scroll-padding-left:16px] gap-4 overflow-x-auto [overscroll-behavior-x:contain] px-4 pb-5'
            onPointerDown={(e) => e.stopPropagation()}
            onPointerMove={(e) => e.stopPropagation()}
            onTouchStart={(e) => e.stopPropagation()}
            onTouchMove={(e) => e.stopPropagation()}
            onWheel={(e) => e.stopPropagation()}
          >
            {courses.map((course) => (
              <div
                key={course.uuid}
                className='w-[85%] max-w-[420px] shrink-0 snap-start'
              >
                <CourseInfoCard
                  course={course}
                  className='rounded-2xl p-5 shadow-xl'
                />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default CourseMap;
