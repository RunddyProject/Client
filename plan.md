# 내 코스 (My Courses) Feature - Design Document v2

> 최종 업데이트: 2026-02-17
> 상태: API 확정, 설계 검토 완료

---

## 1. Route Structure

```
/course/my              → MyCourses 페이지 (지도보기/목록보기 토글)
/course/:uuid           → CourseDetail (기존 페이지, 사용자 코스일 때 더보기 메뉴 추가)
/course/:uuid/edit      → MyCourseEdit 페이지 (코스 수정 폼)
```

### router.tsx 변경

```typescript
// app/routing/router.tsx - course children에 추가
{
  path: 'my',
  element: (
    <ProtectedRoute>
      <MyCourses />
    </ProtectedRoute>
  ),
  // viewMode 토글을 사용하므로 header는 동적으로 설정됨
  // route handle에는 fallback만 지정
  handle: { header: { showBackButton: false, rightButton: null } }
},
{
  path: ':uuid',
  element: <CourseInfoLayout />,
  children: [
    {
      index: true,
      element: <CourseInfo />,
      handle: { header: { title: '코스 정보', rightButton: <ShareButton /> } }
    },
    {
      path: 'map',
      element: <CourseInfoMap />,
      handle: { header: { title: '상세보기', rightButton: null } }
    },
    {
      path: 'edit',
      element: (
        <ProtectedRoute>
          <MyCourseEdit />
        </ProtectedRoute>
      ),
      handle: { header: { title: '코스 수정하기', rightButton: null } }
    }
  ]
}
```

---

## 2. Feature Module 구조

```
features/my-course/
├── api/
│   └── my-course.api.ts            # 사용자 코스 API
├── model/
│   └── types.ts                    # 타입 정의
├── hooks/
│   ├── useUserCourses.ts           # 사용자 코스 목록 조회
│   ├── useUserCourseSummary.ts     # 사용자 코스 요약 통계
│   ├── useUserCourseGpxList.ts     # 사용자 코스 GPX 일괄 조회
│   ├── useDeleteUserCourse.ts      # 코스 삭제 mutation
│   └── useEditUserCourse.ts        # 코스 수정 mutation
└── ui/
    ├── MyCourseMap.tsx             # 지도 뷰
    ├── MyCourseList.tsx            # 목록 뷰
    ├── MyCourseSummary.tsx         # 통계 바 (등록 코스 수, 총 거리)
    ├── MyCourseInfoCard.tsx        # 코스 카드 (기존 InfoCard 변형)
    ├── MyCourseMoreMenu.tsx        # 더보기 바텀시트 (수정/삭제)
    ├── MyCourseDeleteDialog.tsx    # 삭제 확인 다이얼로그
    └── MyCourseEmptyState.tsx      # 빈 상태 일러스트
```

### Page 파일

```
pages/course/
├── my.tsx                          # 내 코스 페이지
└── edit.tsx                        # 코스 수정 페이지
```

---

## 3. API 명세 (확정)

| Method | Endpoint | 설명 |
|--------|----------|------|
| GET | `/course/user` | 사용자 코스 목록 조회 |
| GET | `/course/user/summary` | 사용자 코스 통계 (코스 수, 총 거리) |
| GET | `/course/user/gpx` | 사용자 코스 전체 GPX 일괄 조회 |
| PATCH | `/course/{courseUuid}` | 사용자 코스 수정 |
| DELETE | `/course/{courseUuid}` | 사용자 코스 삭제 |

> 기존 코스 상세: `GET /course/{uuid}` (공식/사용자 공용, `isMarathon` 필드 추가됨)

---

## 4. 타입 정의

### features/my-course/model/types.ts

```typescript
import type { CoursePoint, EnvType, ShapeType } from '@/features/course/model/types';

// ─── GET /course/user ────────────────────────────
export interface UserCourse {
  uuid: string;
  lat: number;
  lng: number;
  name: string;
  envType: EnvType;
  envTypeName: string;
  shapeType: ShapeType;
  shapeTypeName: string;
  isMarathon: boolean;
  totalDistance: number;  // 미터(m)
  svg: string;
}

export interface UserCoursesResponse {
  courseList: UserCourse[];
}

// ─── GET /course/user/summary ────────────────────
export interface UserCourseSummary {
  myCourseCount: number;
  myTotalDistance: number; // km
}

// ─── GET /course/user/gpx ────────────────────────
export interface UserCourseGpxItem {
  courseUuid: string;          // 코스 UUID (코스 목록과 매칭용)
  courseShapeType: ShapeType;
  coursePointList: CoursePoint[];
}

export interface UserCourseGpxResponse {
  userCourseGpxList: UserCourseGpxItem[];
}

// ─── PATCH /course/{courseUuid} ───────────────────
export interface EditUserCourseRequest {
  courseName: string;
  isMarathon: boolean;
  courseEnvType: string | null;   // isMarathon=true이면 null
  courseShapeType: string | null; // isMarathon=true이면 null
  startAddress: string;
  endAddress: string;
}
```

### 기존 타입 변경

```typescript
// features/course/model/types.ts
export interface CourseDetail extends Course, CoursePointResponse, LatLngBounds {
  startAddress: string;
  endAddress: string;
  elevationGain: number;
  elevationLoss: number;
  recommendCount: number;
  isMarathon: boolean;    // ← 신규 추가
}
```

---

## 5. API Layer

### features/my-course/api/my-course.api.ts

```typescript
import { api } from '@/shared/lib/http';

import type {
  EditUserCourseRequest,
  UserCourseGpxResponse,
  UserCourseSummary,
  UserCoursesResponse
} from '../model/types';

export const MyCourseApi = {
  /** 사용자 코스 목록 */
  getUserCourses: (): Promise<UserCoursesResponse> =>
    api.get<UserCoursesResponse>('/course/user'),

  /** 사용자 코스 통계 */
  getUserCourseSummary: (): Promise<UserCourseSummary> =>
    api.get<UserCourseSummary>('/course/user/summary'),

  /** 사용자 코스 GPX 일괄 조회 (지도용) */
  getUserCourseGpxList: (): Promise<UserCourseGpxResponse> =>
    api.get<UserCourseGpxResponse>('/course/user/gpx'),

  /** 사용자 코스 수정 */
  editUserCourse: (uuid: string, data: EditUserCourseRequest): Promise<void> =>
    api.patch(`/course/${uuid}`, data),

  /** 사용자 코스 삭제 */
  deleteUserCourse: (uuid: string): Promise<void> =>
    api.delete(`/course/${uuid}`),
};
```

---

## 6. React Query Hooks

### useUserCourses

```typescript
export function useUserCourses() {
  const query = useQuery({
    queryKey: ['user-courses'],
    queryFn: MyCourseApi.getUserCourses,
    staleTime: 60_000,
    gcTime: 5 * 60_000,
  });

  const courses = useMemo(() => query.data?.courseList ?? [], [query.data]);

  return { courses, isLoading: query.isLoading, isError: query.isError };
}
```

### useUserCourseSummary

```typescript
export function useUserCourseSummary() {
  return useQuery({
    queryKey: ['user-courses', 'summary'],
    queryFn: MyCourseApi.getUserCourseSummary,
    staleTime: 60_000,
    gcTime: 5 * 60_000,
  });
}
```

### useUserCourseGpxList

```typescript
export function useUserCourseGpxList(enabled: boolean = true) {
  const query = useQuery({
    queryKey: ['user-courses', 'gpx'],
    queryFn: MyCourseApi.getUserCourseGpxList,
    staleTime: 5 * 60_000,
    gcTime: 10 * 60_000,
    enabled,
  });

  const gpxList = useMemo(() => query.data?.userCourseGpxList ?? [], [query.data]);

  return { gpxList, isLoading: query.isLoading };
}
```

### useDeleteUserCourse

```typescript
export function useDeleteUserCourse() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (uuid: string) => MyCourseApi.deleteUserCourse(uuid),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-courses'] });
      queryClient.invalidateQueries({ queryKey: ['courses'] });
      toast('코스가 삭제되었어요');  // 명세 항목 6: 삭제 완료 토스트
    },
    onError: () => {
      toast.error('코스 삭제에 실패했어요');
    },
  });
}
```

### useEditUserCourse

```typescript
export function useEditUserCourse() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ uuid, data }: { uuid: string; data: EditUserCourseRequest }) =>
      MyCourseApi.editUserCourse(uuid, data),
    onSuccess: (_, { uuid }) => {
      queryClient.invalidateQueries({ queryKey: ['user-courses'] });
      queryClient.invalidateQueries({ queryKey: ['user-courses', 'gpx'] });
      queryClient.invalidateQueries({ queryKey: ['course', uuid] });
      queryClient.invalidateQueries({ queryKey: ['courses'] });
    },
    onError: () => {
      toast.error('코스 수정에 실패했어요');
    },
  });
}
```

---

## 7. UI 컴포넌트 상세 설계

### 7-1. 내 코스 페이지 (pages/course/my.tsx)

**구조**: 기존 `pages/course/index.tsx`와 동일한 viewMode 패턴 사용.

```
┌─────────────────────────────────┐
│  Header (지도보기 | 목록보기)     │  ← HeaderContext viewMode 토글
├─────────────────────────────────┤
│                                 │
│  viewMode === 'map'             │
│    → MyCourseMap                │
│  viewMode === 'list'            │
│    → MyCourseList               │
│                                 │
│  courses.length === 0           │
│    → MyCourseEmptyState         │
│                                 │
└─────────────────────────────────┘
```

**핵심 로직**:
```typescript
function MyCourses() {
  const [viewMode, setViewMode] = useState<'map' | 'list'>('map');
  const { registerViewMode, unregisterViewMode } = useHeader();

  useEffect(() => {
    registerViewMode(viewMode, setViewMode);
    return () => unregisterViewMode();
  }, [viewMode, ...]);

  const { courses, isLoading } = useUserCourses();

  if (isLoading) return <LoadingSpinner />;
  if (courses.length === 0) return <MyCourseEmptyState />;

  return (
    <div className='relative h-dvh overflow-hidden'>
      {viewMode === 'map' ? <MyCourseMap /> : <MyCourseList />}
    </div>
  );
}
```

**빈 상태 처리**:
- courses.length === 0일 때 viewMode 토글 없이 MyCourseEmptyState만 표시
- 빈 상태에서는 `unregisterViewMode()`를 호출하여 탭을 숨기고, 일반 depth 헤더(뒤로가기 + "내 코스" 타이틀)로 표시

### 7-2. MyCourseSummary (통계 바)

스크린샷 기준 디자인:
```
┌──────────────────────────────────────────────┐
│                                              │
│  내가 등록한 코스   12개  │  지금까지 뛴 거리   536km │
│                                              │
└──────────────────────────────────────────────┘
```

**Props**:
```typescript
interface MyCourseSummaryProps {
  myCourseCount: number;
  myTotalDistance: number; // km
  className?: string;
}
```

**스타일링**:
- 배경: 파란 그라데이션 (`bg-gradient-to-r from-[#D5F3FF] to-[#F2FBFF]`)
- 둥근 모서리 `rounded-2xl`, 패딩 `px-5 py-4`
- 2열 레이아웃: `grid grid-cols-2 divide-x divide-g-20`
- 라벨: `text-caption-r12 text-sec`
- 값: `text-title-b18 text-pri`

### 7-3. MyCourseMap (지도 뷰)

```
┌─────────────────────────────────┐
│  MyCourseSummary (overlay)      │
├─────────────────────────────────┤
│                                 │
│     NaverMap                    │
│   (다중 polyline 렌더링)         │
│                                 │
├─────────────────────────────────┤
│  [📍 현위치]     [+ 코스 등록]   │
├─────────────────────────────────┤
│  ┌──────────────────────────┐   │
│  │  MyCourseInfoCard        │   │  ← 가로 스크롤 카드
│  └──────────────────────────┘   │
└─────────────────────────────────┘
```

**다중 polyline 렌더링 (GET /course/user/gpx 활용)**:

`GET /course/user/gpx` API가 모든 코스의 GPX를 한 번에 반환하므로 N+1 문제 해결됨.

**구현 방법 (방법 C: 외부 polyline 관리 - 권장)**:

NaverMap의 `onInit` 콜백으로 map 인스턴스를 받고, 별도의 커스텀 훅 `useMultiPolyline`에서 다중 polyline을 직접 관리한다. 기존 NaverMap 컴포넌트는 수정하지 않는다.

```typescript
// features/my-course/hooks/useMultiPolyline.ts
export function useMultiPolyline(
  map: naver.maps.Map | null,
  gpxList: UserCourseGpxItem[],
  onPolylineClick?: (courseUuid: string) => void
) {
  useEffect(() => {
    if (!map || gpxList.length === 0) return;

    const polylines = gpxList.map(gpx => {
      const path = gpx.coursePointList.map(
        p => new naver.maps.LatLng(p.lat, p.lng)
      );
      const color = runddyColor[SHAPE_TYPE_COLOR[gpx.courseShapeType]];

      const polyline = new naver.maps.Polyline({
        map,
        path,
        strokeColor: color,
        strokeWeight: 4,
        strokeOpacity: 0.8,
        strokeLineCap: 'round',
        strokeLineJoin: 'round',
      });

      // courseUuid 기반 클릭 이벤트
      if (onPolylineClick) {
        naver.maps.Event.addListener(polyline, 'click', () => {
          onPolylineClick(gpx.courseUuid);
        });
      }

      return polyline;
    });

    // 전체 bounds 계산 후 fitBounds
    const allPoints = gpxList.flatMap(g => g.coursePointList);
    if (allPoints.length > 0) {
      const lats = allPoints.map(p => p.lat);
      const lngs = allPoints.map(p => p.lng);
      const bounds = new naver.maps.LatLngBounds(
        new naver.maps.LatLng(Math.min(...lats), Math.min(...lngs)),
        new naver.maps.LatLng(Math.max(...lats), Math.max(...lngs))
      );
      map.fitBounds(bounds, { padding: 60 });
    }

    return () => polylines.forEach(p => p.setMap(null));
  }, [map, gpxList, onPolylineClick]);
}
```

**GPX 리스트와 코스 리스트 매칭**:

`GET /course/user/gpx` 응답의 각 항목에 `courseUuid`가 포함되므로, 코스 목록과 명확하게 매칭할 수 있다.

```typescript
// gpxList를 uuid 기반 Map으로 변환하여 O(1) 조회
const gpxMap = useMemo(
  () => new Map(gpxList.map(gpx => [gpx.courseUuid, gpx])),
  [gpxList]
);
```

> 배열 순서도 동일 보장(백엔드 확인 완료)되지만, uuid 기반 매칭이 더 안전하므로 이를 primary로 사용한다.

**polyline 클릭 → 카드 포커스**:

각 polyline에 click 이벤트를 달아 `courseUuid` 기반으로 활성 코스를 변경하고, 하단 카드 캐러셀을 해당 코스로 스크롤한다.

```typescript
naver.maps.Event.addListener(polyline, 'click', () => {
  setActiveCourseUuid(gpx.courseUuid);
  const cardIndex = courses.findIndex(c => c.uuid === gpx.courseUuid);
  if (cardIndex >= 0) scrollerRef.current?.scrollTo(cardIndex);
});
```

### 7-4. MyCourseList (목록 뷰)

```
┌──────────────────────────────┐
│  MyCourseSummary             │
├──────────────────────────────┤
│  MyCourseInfoCard            │  border-b
│  MyCourseInfoCard            │  border-b
│  MyCourseInfoCard            │
│  ...                         │
│                              │
│  (하단 여백: FAB 가림 방지)    │
└──────────────────────────────┘
│  [+ 코스 등록하기] FAB (fixed) │
```

**가상 스크롤**: 기존 `useVirtualScroll` 재사용. 사용자 코스가 적을 수 있지만 (< 50개), 일관성과 확장성을 위해 적용.

### 7-5. MyCourseInfoCard (코스 카드)

기존 `CourseInfoCard`와 차이:

| 항목 | CourseInfoCard | MyCourseInfoCard |
|------|---------------|-----------------|
| 타입 | `Course` | `UserCourse` |
| 북마크 | O | X |
| 난이도 뱃지 | O (grade) | X (API에 없음) |
| 마라톤 뱃지 | X | O (isMarathon일 때) |
| 뱃지 목록 | 난이도, 환경, 거리 | 환경, 거리 (+ 마라톤) |
| 클릭 | navigate to detail | navigate to detail (state: isUserCourse) |

**별도 컴포넌트 분리 근거**:
- 타입 차이 (`Course` vs `UserCourse`)
- 기능 차이 (북마크 없음, 마라톤 뱃지)
- FSD 원칙: feature 간 의존성 최소화
- 기존 `CourseInfoCard`를 범용화하면 조건 분기가 복잡해짐

```typescript
export const MyCourseInfoCard = memo(function MyCourseInfoCard({
  course,
  className
}: MyCourseInfoCardProps) {
  const navigate = useNavigate();
  const sanitizedSvg = useSanitizedSvg(course.svg);

  const handleClick = () => {
    navigate(`/course/${course.uuid}`, { state: { isUserCourse: true } });
  };

  return (
    <div onClick={handleClick} className={cn('flex items-center gap-4 cursor-pointer', className)}>
      {/* SVG 썸네일 (기존 패턴 동일) */}
      <div className='relative h-[60px] w-[60px]'>
        <img src={courseImageUrl[course.shapeType]} ... />
        <div className='absolute inset-0' dangerouslySetInnerHTML={{ __html: sanitizedSvg }} />
      </div>

      <div className='flex min-w-0 flex-1 flex-col gap-2'>
        <div className='text-title-b18 truncate'>{course.name}</div>
        <div className='flex items-center gap-1'>
          <Badge>{course.envTypeName}</Badge>
          <Badge>{(course.totalDistance / 1000).toFixed(1)}km</Badge>
          {course.isMarathon && <Badge>마라톤</Badge>}
        </div>
      </div>
    </div>
  );
});
```

### 7-6. MyCourseMoreMenu (더보기 바텀시트)

`Sheet` (bottom side) 사용:

```
┌──────────────────────────────┐
│          ─── (handle) ───    │
│                              │
│  📝 수정하기                  │  → onEdit()
│                              │
│  🗑 삭제하기                  │  → onDelete()
│                              │
└──────────────────────────────┘
```

```typescript
interface MyCourseMoreMenuProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onEdit: () => void;
  onDelete: () => void;
}

export function MyCourseMoreMenu({ open, onOpenChange, onEdit, onDelete }: MyCourseMoreMenuProps) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side='bottom' className='rounded-t-2xl pb-safe'>
        <SheetHeader>
          <SheetTitle className='sr-only'>코스 관리</SheetTitle>
        </SheetHeader>
        <div className='space-y-1 py-2'>
          <button onClick={onEdit} className='w-full px-5 py-4 text-left text-contents-m16'>
            수정하기
          </button>
          <button onClick={onDelete} className='w-full px-5 py-4 text-left text-contents-m16 text-stateError'>
            삭제하기
          </button>
        </div>
      </SheetContent>
    </Sheet>
  );
}
```

### 7-7. MyCourseDeleteDialog (삭제 확인)

`AlertDialog` 사용 (기존 프리미티브 재사용):

```
┌──────────────────────────────┐
│                              │
│  등록한 코스를 삭제하시겠어요?  │
│                              │
│  [아니요]         [네]        │
│                              │
└──────────────────────────────┘
```

```typescript
export function MyCourseDeleteDialog({
  open, onOpenChange, onConfirm, isDeleting
}: MyCourseDeleteDialogProps) {
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>등록한 코스를 삭제하시겠어요?</AlertDialogTitle>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isDeleting}>아니요</AlertDialogCancel>
          <AlertDialogAction onClick={onConfirm} disabled={isDeleting}>네</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
```

### 7-8. MyCourseEmptyState (빈 상태)

```
┌──────────────────────────────┐
│                              │
│      (empty_graphic 아이콘)   │
│                              │
│    등록한 코스가 없어요        │
│                              │
│    [코스 등록하러 가기]  ←버튼  │
│                              │
└──────────────────────────────┘
```

```typescript
export function MyCourseEmptyState() {
  const navigate = useNavigate();
  return (
    <div className='flex h-dvh flex-col items-center justify-center gap-6'>
      <Icon name='empty_graphic' size={100} />
      <p className='text-placeholder text-contents-r15'>등록한 코스가 없어요</p>
      <Button variant='default' onClick={() => navigate('/course/upload')}>
        코스 등록하러 가기
      </Button>
    </div>
  );
}
```

---

## 8. 코스 상세 페이지 수정 (pages/course/info.tsx)

### 소유권 판별

**Location State + Query Cache 조합**:

```typescript
function useIsUserCourse(uuid: string | undefined): boolean {
  const location = useLocation();
  const queryClient = useQueryClient();

  // 1순위: location state (내 코스 목록에서 진입 시)
  if (location.state?.isUserCourse === true) return true;

  // 2순위: user-courses 캐시에서 확인
  if (uuid) {
    const cached = queryClient.getQueryData<UserCoursesResponse>(['user-courses']);
    if (cached?.courseList.some(c => c.uuid === uuid)) return true;
  }

  return false;
}
```

### 상세 페이지 변경

```typescript
// pages/course/info.tsx 추가
const isUserCourse = useIsUserCourse(uuid);
const [moreMenuOpen, setMoreMenuOpen] = useState(false);
const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
const { mutateAsync: deleteAsync, isPending: isDeleting } = useDeleteUserCourse();

// 헤더 rightButton 변경
useEffect(() => {
  if (!course) return;
  setConfig({
    rightButton: (
      <div className='flex items-center gap-1'>
        <ShareButton title={`${course.name} (${(course.totalDistance / 1000).toFixed(1)}km)`} />
        {isUserCourse && (
          <Button variant='ghost' size='icon' className='h-8 w-8'
            onClick={() => setMoreMenuOpen(true)}>
            <Icon name='more_vert' size={24} />
          </Button>
        )}
      </div>
    ),
  });
  return () => resetConfig();
}, [course, isUserCourse, ...]);

// 삭제 핸들러
const handleDelete = async () => {
  if (!uuid) return;
  try {
    await deleteAsync(uuid);
    setDeleteDialogOpen(false);
    navigate('/course/my');  // 내 코스 목록으로 이동 (토스트는 mutation onSuccess에서)
  } catch {
    // onError에서 처리됨
  }
};

// JSX에 추가
{isUserCourse && (
  <>
    <MyCourseMoreMenu
      open={moreMenuOpen}
      onOpenChange={setMoreMenuOpen}
      onEdit={() => {
        setMoreMenuOpen(false);
        navigate(`/course/${uuid}/edit`);
      }}
      onDelete={() => {
        setMoreMenuOpen(false);
        setDeleteDialogOpen(true);
      }}
    />
    <MyCourseDeleteDialog
      open={deleteDialogOpen}
      onOpenChange={setDeleteDialogOpen}
      onConfirm={handleDelete}
      isDeleting={isDeleting}
    />
  </>
)}
```

### 사용자 코스 상세에서 달라지는 점 (기획 검토)

- 북마크 버튼: 자기 코스에도 북마크가 보이는 게 맞는지? → 기존 CourseDetail API에 `isBookmarked`가 있으므로, 표시해도 무방. 기획에서 별도 언급 없으므로 유지.
- 리뷰 탭: 자기 코스에도 리뷰가 달릴 수 있으므로 유지.
- GPX 다운로드: 자기 코스 GPX도 다운로드 가능해야 하므로 유지.

---

## 9. 코스 수정 페이지 (pages/course/edit.tsx)

### API 스펙

```
PATCH /course/{courseUuid}
Request Body:
{
  "courseName": String,
  "isMarathon": Boolean,
  "courseEnvType": String,    // PARK|TRAIL|TRACK|URBAN|BEACH|MOUNTAIN|RIVER|FOREST|ETC
  "courseShapeType": String,  // LOOP|OUT_AND_BACK|LINEAR|ART|ETC
  "startAddress": String,
  "endAddress": String
}
```

### 데이터 흐름

```
1. uuid 파라미터로 CourseDetail fetch (기존 useCourseDetail 재사용)
2. CourseDetail → 초기 폼 값 매핑
3. 사용자가 폼 수정
4. 변경사항 비교 → "완료" CTA 활성화 (명세 항목 7)
5. "완료" 클릭 → editUserCourse mutation
6. 성공 → navigate(-1)로 상세 페이지 복귀 → 토스트 표시 (명세 항목 8)
```

### 폼 상태 관리

```typescript
interface MyCourseEditFormData {
  courseName: string;
  isMarathon: boolean;
  courseEnvType: string;
  courseShapeType: string;
}

function useMyCourseEditForm(courseDetail: CourseDetail | undefined) {
  // 원본 데이터 스냅샷 (최초 1회만 설정)
  const [originalData, setOriginalData] = useState<MyCourseEditFormData | null>(null);
  const [formData, setFormData] = useState<MyCourseEditFormData>({
    courseName: '',
    isMarathon: false,
    courseEnvType: '',
    courseShapeType: '',
  });

  // CourseDetail 로드 시 초기값 설정
  useEffect(() => {
    if (courseDetail && !originalData) {
      const initial: MyCourseEditFormData = {
        courseName: courseDetail.name,
        isMarathon: courseDetail.isMarathon,
        courseEnvType: courseDetail.envType,
        courseShapeType: courseDetail.shapeType,
      };
      setOriginalData(initial);
      setFormData(initial);
    }
  }, [courseDetail, originalData]);

  // 변경사항 감지
  const hasChanges = useMemo(() => {
    if (!originalData) return false;
    return (
      formData.courseName !== originalData.courseName ||
      formData.isMarathon !== originalData.isMarathon ||
      formData.courseEnvType !== originalData.courseEnvType ||
      formData.courseShapeType !== originalData.courseShapeType
    );
  }, [formData, originalData]);

  // 폼 유효성 검증
  const isFormValid = useMemo(() => {
    if (!formData.courseName.trim()) return false;
    if (!formData.isMarathon) {
      if (!formData.courseEnvType) return false;
      if (!formData.courseShapeType) return false;
    }
    return true;
  }, [formData]);

  // CTA 활성화 = 변경사항 있음 AND 유효함
  const canSubmit = hasChanges && isFormValid;

  return { formData, setFormData, originalData, hasChanges, canSubmit };
}
```

### 수정 페이지 구조

```typescript
function MyCourseEdit() {
  const { uuid } = useParams<{ uuid: string }>();
  const navigate = useNavigate();

  const { courseDetail, isLoading } = useCourseDetail(uuid ?? '');
  const { formData, setFormData, originalData, canSubmit } = useMyCourseEditForm(courseDetail);
  const { mutateAsync: editAsync, isPending: isEditing } = useEditUserCourse();

  const handleSubmit = async () => {
    if (!uuid || !courseDetail) return;
    try {
      await editAsync({
        uuid,
        data: {
          courseName: formData.courseName,
          isMarathon: formData.isMarathon,
          courseEnvType: formData.isMarathon ? null : formData.courseEnvType,
          courseShapeType: formData.isMarathon ? null : formData.courseShapeType,
          startAddress: courseDetail.startAddress,  // 읽기 전용, 원본 전달
          endAddress: courseDetail.endAddress,        // 읽기 전용, 원본 전달
        },
      });
      toast('코스 정보가 수정되었어요');  // 명세 항목 8
      navigate(-1);
    } catch {
      // onError에서 처리됨
    }
  };

  if (isLoading) return <LoadingSpinner />;
  if (!courseDetail) { navigate(-1); return null; }

  return (
    <div className='flex min-h-dvh flex-col'>
      {/* 맵 프리뷰 (읽기 전용) */}
      <MapPreview courseDetail={courseDetail} />

      {/* 수정 가능 필드 */}
      <div className='flex-1 space-y-6 px-5 py-6'>
        <CourseNameInput value={formData.courseName} onChange={...} />
        <MarathonToggle value={formData.isMarathon} onChange={...} />
        {!formData.isMarathon && (
          <>
            <EnvTypeSelector value={formData.courseEnvType} onChange={...} />
            <ShapeTypeSelector value={formData.courseShapeType} onChange={...} />
          </>
        )}
      </div>

      {/* 읽기 전용 섹션 */}
      <div className='px-5 pb-6'>
        <ElevationInfo courseDetail={courseDetail} />
        <AddressInfo startAddress={courseDetail.startAddress} endAddress={courseDetail.endAddress} />
      </div>

      {/* 완료 CTA (명세 항목 7) */}
      <div className='sticky bottom-0 p-5 pb-safe'>
        <Button
          size='lg'
          className='w-full'
          disabled={!canSubmit || isEditing}
          onClick={handleSubmit}
        >
          완료
        </Button>
      </div>
    </div>
  );
}
```

### 주소(startAddress, endAddress) 처리 전략

PATCH API가 startAddress/endAddress를 받지만, GPX가 변경되지 않으므로 주소도 변경할 필요가 없다.

- 수정 폼에서는 **읽기 전용으로 표시**
- mutation 시 원본 CourseDetail의 startAddress/endAddress를 그대로 전달
- 향후 주소 수정이 필요하면 텍스트 입력 필드로 전환 가능

---

## 10. Header 수정 사항

### Header.tsx 변경

```typescript
// ─── 변경 전 ───
const hasTabs = isCoursePage && viewMode !== undefined && setViewMode;

// ─── 변경 후 ───
const hasTabs = viewMode !== undefined && setViewMode;
```

```typescript
// ─── 변경 전 ───
className={cn('top-0 z-[101] w-full', isCoursePage ? 'fixed left-0' : 'bg-w-100 sticky')}

// ─── 변경 후 ───
className={cn('top-0 z-[101] w-full', hasTabs ? 'fixed left-0' : 'bg-w-100 sticky')}
```

**효과**: `registerViewMode()`를 호출하는 모든 페이지에서 자동으로 토글 탭 + fixed 헤더가 활성화.

**주의 사항**:
- `circleButton` prop: 기존에 `isCoursePage`일 때 `<Menu circleButton />`으로 렌더링. 이를 `hasTabs`로 변경하여 내 코스에서도 동일한 원형 메뉴 버튼 표시.
- `isHomeHeader` 조건은 그대로 유지 (홈 로고 헤더).

---

## 11. 네비게이션 메뉴 연동

```typescript
// Header.tsx - menuTitles
const menuTitles: Record<string, string> = {
  '/': '런디코스',
  '/course/my': '내 코스',   // 추가
  '/me': '마이페이지',
};
```

---

## 12. Query Key & Invalidation 전략

### Query Key 맵

```
['user-courses']                → GET /course/user (목록)
['user-courses', 'summary']     → GET /course/user/summary (통계)
['user-courses', 'gpx']         → GET /course/user/gpx (지도용 GPX)
['course', uuid]                → GET /course/{uuid} (상세, 기존)
['courses', ...]                → GET /courses (검색 결과, 기존)
```

### Invalidation 매트릭스

| 액션 | user-courses | summary | gpx | course(uuid) | courses |
|------|:---:|:---:|:---:|:---:|:---:|
| 코스 등록 성공 | ✓ | ✓ | ✓ | - | ✓ |
| 코스 삭제 성공 | ✓ | ✓ | ✓ | remove | ✓ |
| 코스 수정 성공 | ✓ | - | ✓ | ✓ | ✓ |

> 수정 시 summary는 invalidate 불필요 (코스 수/거리 변경 안 됨).
> 삭제 시 `queryClient.removeQueries({ queryKey: ['course', uuid] })` 호출하여 존재하지 않는 코스의 캐시를 정리.

### 기존 useCourseUpload 수정

```typescript
// features/course-upload/hooks/useCourseUpload.ts
onSuccess: () => {
  queryClient.invalidateQueries({ queryKey: ['courses'] });
  queryClient.invalidateQueries({ queryKey: ['user-courses'] });           // 추가
},
```

> `['user-courses']`를 prefix로 invalidate하면 summary, gpx도 함께 무효화됨.

---

## 13. 파일 생성/수정 목록

### 신규 생성 (15개)

| # | 파일 | 설명 |
|---|------|------|
| 1 | `src/features/my-course/api/my-course.api.ts` | API 서비스 |
| 2 | `src/features/my-course/model/types.ts` | 타입 정의 |
| 3 | `src/features/my-course/hooks/useUserCourses.ts` | 코스 목록 훅 |
| 4 | `src/features/my-course/hooks/useUserCourseSummary.ts` | 통계 훅 |
| 5 | `src/features/my-course/hooks/useUserCourseGpxList.ts` | GPX 일괄 훅 |
| 6 | `src/features/my-course/hooks/useDeleteUserCourse.ts` | 삭제 mutation |
| 7 | `src/features/my-course/hooks/useEditUserCourse.ts` | 수정 mutation |
| 8 | `src/features/my-course/ui/MyCourseMap.tsx` | 지도 뷰 |
| 9 | `src/features/my-course/ui/MyCourseList.tsx` | 목록 뷰 |
| 10 | `src/features/my-course/ui/MyCourseSummary.tsx` | 통계 바 |
| 11 | `src/features/my-course/ui/MyCourseInfoCard.tsx` | 코스 카드 |
| 12 | `src/features/my-course/ui/MyCourseMoreMenu.tsx` | 더보기 메뉴 |
| 13 | `src/features/my-course/ui/MyCourseDeleteDialog.tsx` | 삭제 확인 |
| 14 | `src/features/my-course/ui/MyCourseEmptyState.tsx` | 빈 상태 |
| 15 | `src/pages/course/my.tsx` | 내 코스 페이지 |
| 16 | `src/pages/course/edit.tsx` | 코스 수정 페이지 |

### 수정 (5개)

| # | 파일 | 변경 내용 |
|---|------|----------|
| 1 | `src/app/routing/router.tsx` | `/course/my`, `/course/:uuid/edit` 라우트 추가 |
| 2 | `src/shared/ui/navigations/Header.tsx` | `hasTabs` 조건 viewMode 기반으로 변경, menuTitles에 내 코스 추가 |
| 3 | `src/pages/course/info.tsx` | 사용자 코스 감지 + 더보기 메뉴/삭제 다이얼로그 추가 |
| 4 | `src/features/course/model/types.ts` | `CourseDetail`에 `isMarathon` 필드 추가 |
| 5 | `src/features/course-upload/hooks/useCourseUpload.ts` | 성공 시 `['user-courses']` 쿼리 무효화 추가 |

---

## 14. 성능 고려사항

### 지도 뷰 최적화

1. **GPX 데이터 크기**: `GET /course/user/gpx`가 모든 코스의 전체 포인트를 반환하므로, 코스 수가 많으면 payload가 클 수 있다.
   - `staleTime: 5 * 60_000`으로 재요청 최소화
   - `gcTime: 10 * 60_000`으로 캐시 유지
   - 지도 뷰(`viewMode === 'map'`)일 때만 `enabled: true`로 fetch

2. **polyline 렌더링**: naver.maps.Polyline 인스턴스를 cleanup하는 것이 중요. useEffect return에서 `setMap(null)` 호출 필수.

3. **fitBounds 호출 타이밍**: 모든 polyline이 그려진 후 1회만 호출. gpxList가 변경될 때만 재계산.

### 목록 뷰 최적화

1. **가상 스크롤**: `useVirtualScroll` 재사용으로 DOM 노드 수 최소화
2. **SVG 정제**: 기존 `useSanitizedSvg` 재사용 (memoized)
3. **React.memo**: `MyCourseInfoCard`에 memo 적용

### 수정 페이지 최적화

1. **불필요한 re-render 방지**: formData 변경 시 맵 프리뷰 re-render 방지를 위해 MapPreview 컴포넌트를 memo로 감싸기
2. **hasChanges 계산**: useMemo로 최적화 (이미 적용)

---

## 15. 엣지 케이스 처리

| 시나리오 | 처리 |
|----------|------|
| 코스 0개 + 지도/목록 토글 | 빈 상태에서 토글 숨김, depth 헤더로 전환 |
| 삭제 중 네트워크 에러 | mutation onError에서 toast, 다이얼로그 유지 |
| 삭제 성공 후 뒤로가기 | navigate('/course/my'), 목록에서 해당 코스 사라짐 |
| 수정 중 뒤로가기 | 브라우저 기본 동작 (변경사항 유실) |
| 수정 후 상세 복귀 | query invalidation으로 최신 데이터 반영 + 토스트 |
| GPX API 실패 | 지도에 polyline 없이 빈 맵 + 하단 카드는 표시 |
| 코스 목록 API 실패 | isError 상태에서 에러 UI 또는 재시도 버튼 |
| 직접 URL로 /course/:uuid 접근 (사용자 코스) | user-courses 캐시 없으면 더보기 메뉴 미표시 (안전) |
| 마라톤 ↔ 비마라톤 전환 시 envType/shapeType | 마라톤으로 전환 시 envType/shapeType 무시, 비마라톤으로 전환 시 필수 입력 |

### 수정 중 이탈 방지 (선택적 개선)

현재 기획에는 명시되지 않았으나, 변경사항이 있을 때 이탈 시 확인 다이얼로그를 보여주면 UX 향상:

```typescript
// React Router의 useBlocker 사용
const blocker = useBlocker(hasChanges && !isEditing);

// 이탈 확인 다이얼로그
{blocker.state === 'blocked' && (
  <AlertDialog open>
    <AlertDialogContent>
      <AlertDialogTitle>수정을 취소하시겠어요?</AlertDialogTitle>
      <AlertDialogDescription>변경사항이 저장되지 않아요.</AlertDialogDescription>
      <AlertDialogFooter>
        <AlertDialogCancel onClick={() => blocker.reset()}>계속 수정</AlertDialogCancel>
        <AlertDialogAction onClick={() => blocker.proceed()}>나가기</AlertDialogAction>
      </AlertDialogFooter>
    </AlertDialogContent>
  </AlertDialog>
)}
```

---

## 16. 구현 순서 (권장)

### Phase 1: 기반 설정
- `features/my-course/model/types.ts` 생성
- `features/my-course/api/my-course.api.ts` 생성
- `features/course/model/types.ts` → `CourseDetail`에 `isMarathon` 추가
- React Query hooks: useUserCourses, useUserCourseSummary, useUserCourseGpxList

### Phase 2: 내 코스 페이지 (목록 뷰)
- MyCourseInfoCard, MyCourseSummary, MyCourseEmptyState
- MyCourseList
- pages/course/my.tsx (목록 뷰)
- router.tsx에 라우트 추가
- Header.tsx 수정 (viewMode 기반 탭)

### Phase 3: 내 코스 페이지 (지도 뷰)
- useMultiPolyline 커스텀 훅
- MyCourseMap
- 지도 뷰 ↔ 목록 뷰 전환 통합 테스트

### Phase 4: 코스 상세 - 더보기 메뉴
- MyCourseMoreMenu, MyCourseDeleteDialog
- useDeleteUserCourse
- info.tsx에 useIsUserCourse + 더보기 메뉴 통합

### Phase 5: 코스 수정 페이지
- useEditUserCourse
- useMyCourseEditForm (폼 상태 + 변경 감지)
- pages/course/edit.tsx

### Phase 6: 마무리
- 메뉴에 '내 코스' 항목 추가
- useCourseUpload에 user-courses invalidation 추가
- 빈 상태/로딩/에러 엣지 케이스 테스트

---

## 17. 최종 설계 검토 (Self-Review)

### A. 기획/디자인 완전성 체크

| 명세 항목 | 설계 반영 | 비고 |
|-----------|:---:|------|
| 1. Header 지도보기/목록보기 토글 | O | registerViewMode 패턴 재사용, Header.tsx 수정 |
| 2-1. 내가 등록한 코스 N개 | O | MyCourseSummary + useUserCourseSummary |
| 2-2. 지금까지 뛴 거리 Nkm | O | MyCourseSummary + useUserCourseSummary |
| 3. GPX polyline 지도 표시 | O | GET /course/user/gpx + useMultiPolyline |
| 3. polyline 탭 -> 상세 이동 | O | polyline click -> activeCourseIndex -> card -> navigate |
| 4. 코스 등록하기 FAB | O | RegisterCourseFAB 재사용 |
| 5. 수정하기 -> 수정 화면 | O | MyCourseMoreMenu -> navigate -> edit.tsx |
| 6. 삭제 완료 토스트 (돌아온 화면) | O | mutation onSuccess에서 toast, Sonner는 navigation에 유지됨 |
| 7. 완료 CTA disabled/enabled | O | useMyCourseEditForm의 canSubmit (hasChanges AND isFormValid) |
| 8. 수정 완료 후 상세 복귀 토스트 | O | handleSubmit에서 toast -> navigate(-1) |
| 빈 상태 일러스트 + CTA | O | MyCourseEmptyState |
| 삭제 확인 다이얼로그 | O | MyCourseDeleteDialog (AlertDialog) |
| 더보기 바텀시트 | O | MyCourseMoreMenu (Sheet bottom) |

### B. 아키텍처 검토

**1. 라우트 충돌 검증 (`/course/my` vs `/course/:uuid`)**
React Router v7은 static segment(`my`)를 dynamic(`:uuid`)보다 우선 매칭한다. `/course/my`가 `/course/:uuid`(uuid="my")보다 먼저 매칭되므로 충돌 없음.

**2. Feature 경계 준수 (FSD)**
- `my-course` feature는 `course` feature의 타입(EnvType, ShapeType, CoursePoint)만 import
- `course` feature의 UI 컴포넌트는 직접 import하지 않음 (MyCourseInfoCard를 별도 구현)
- `useSanitizedSvg`, `useCourseDetail` 등 hooks는 공유 가능 (같은 도메인의 유틸)
- 적절한 경계 유지

**3. 상태 관리 레이어 분리**
- Server state: React Query (코스 목록, 통계, GPX, 상세)
- Client state: useState (viewMode, formData, dialog open states)
- Persistent state: 없음 (세션 간 유지할 상태 없음)
- 레이어 분리 적절

**4. CourseInfoLayout 안전성**
`CourseInfoLayout`은 `<Outlet />`만 렌더링하므로, edit 라우트를 `:uuid` children에 넣어도 추가 UI가 간섭하지 않음.

### C. 성능 검토

**1. 네트워크 요청 최적화**
- 내 코스 진입 시 요청: `GET /course/user` + `GET /course/user/summary` (병렬)
- 지도 뷰 전환 시 추가: `GET /course/user/gpx` (조건부 fetch, `enabled: viewMode === 'map'`)
- 모두 staleTime으로 캐싱, 재방문 시 즉시 렌더
- N+1 문제 없음 (GET /course/user/gpx 일괄 API 덕분)

**2. 렌더링 최적화**
- MyCourseInfoCard: `React.memo` + `useSanitizedSvg` memoization
- MyCourseList: `useVirtualScroll`로 DOM 최소화
- MyCourseMap: polyline을 NaverMap 외부 훅에서 관리 -> NaverMap re-render 방지
- 수정 폼: MapPreview를 memo로 감싸 formData 변경 시 re-render 차단
- 주요 병목 지점 모두 커버

**3. 메모리 관리**
- useMultiPolyline cleanup: `polylines.forEach(p => p.setMap(null))` 보장
- React Query gcTime: 적절한 캐시 만료로 메모리 누수 방지

### D. 유지보수성 검토

**1. 변경에 강한 구조**
- API 엔드포인트 변경 -> `my-course.api.ts` 한 곳만 수정
- 폼 필드 추가 -> `MyCourseEditFormData` 타입 + `hasChanges` 비교문만 추가
- 새로운 viewMode 페이지 추가 -> `registerViewMode()` 호출만으로 헤더 탭 자동 적용

**2. 코드 중복 vs 추상화 균형**
- `MyCourseInfoCard` vs `CourseInfoCard`: 별도 컴포넌트 (타입/동작 차이 명확)
- 수정 폼 vs 업로드 폼: 별도 구현 (GPX 처리 결합도 차이)
- 공통 컴포넌트(Badge, Button, Icon, NaverMap): 최대한 재사용
- 적절한 균형

### E. 발견된 개선 포인트 및 수정 반영

**E-1. 삭제 mutation에 쿼리 제거 추가 (중요)**

삭제 성공 시 해당 코스의 상세 캐시를 invalidate가 아닌 remove해야 한다. invalidate는 refetch를 시도하여 404가 발생할 수 있다.

```typescript
// useDeleteUserCourse.ts - onSuccess 수정
onSuccess: (_, uuid) => {
  queryClient.invalidateQueries({ queryKey: ['user-courses'] });
  queryClient.invalidateQueries({ queryKey: ['courses'] });
  queryClient.removeQueries({ queryKey: ['course', uuid] });  // 삭제된 코스 캐시 제거
  toast('코스가 삭제되었어요');
},
```

**E-2. 수정 폼 마라톤 전환 시 envType/shapeType 처리 (확정)**

마라톤일 때 envType/shapeType은 `null`로 전송:

```typescript
// handleSubmit에서
const requestData: EditUserCourseRequest = {
  courseName: formData.courseName,
  isMarathon: formData.isMarathon,
  courseEnvType: formData.isMarathon ? null : formData.courseEnvType,
  courseShapeType: formData.isMarathon ? null : formData.courseShapeType,
  startAddress: courseDetail.startAddress,
  endAddress: courseDetail.endAddress,
};
```

**E-3. GPX-코스 매칭 (해결됨)**

`GET /course/user/gpx` 응답에 `courseUuid`가 추가되어 uuid 기반 매칭으로 해결. 배열 순서도 동일 보장(백엔드 확인 완료). 인덱스 기반 매칭 대신 `courseUuid` 기반 Map 조회를 사용한다.

**E-4. 수정 폼 isMarathon 전환 시 UX 흐름**

- 비마라톤 -> 마라톤 전환 시: envType/shapeType 선택 UI 숨김, 기존 값은 formData에 보존 (다시 비마라톤으로 전환 시 복원)
- 마라톤 -> 비마라톤 전환 시 (원본이 마라톤인 경우): envType/shapeType이 비어있음 -> 사용자가 선택해야 canSubmit = true
- 자연스러운 UX

**E-5. location state 유실 시나리오**

`useIsUserCourse`의 fallback(query cache) 동작 보장을 위해, 내 코스 페이지 진입 시 `useUserCourses`가 항상 fetch되어 캐시에 존재하도록 한다. 이는 이미 `pages/course/my.tsx`에서 `useUserCourses()`를 호출하므로 보장됨.

---

## 18. 설계 완성도 요약

| 관점 | 상태 | 설명 |
|------|:---:|------|
| 기획 명세 반영 | O | 모든 명세 항목(1~8) 설계에 매핑 완료 |
| 디자인 시안 반영 | O | 지도뷰/목록뷰/빈상태/삭제 다이얼로그/더보기 메뉴 모두 반영 |
| API 연동 | O | 5개 API 모두 타입 정의 + hook 설계 완료 |
| FSD 아키텍처 | O | feature 격리, 공유 컴포넌트 재사용, 명확한 경계 |
| 성능 최적화 | O | 가상 스크롤, React.memo, 조건부 fetch, polyline cleanup |
| 유지보수성 | O | 단일 책임, 변경 최소화, 확장 가능한 viewMode 패턴 |
| 엣지 케이스 | O | 빈 상태, 에러, 로딩, 네트워크 실패, 소유권 판별 fallback |
| 기존 코드 영향도 | O | 수정 파일 5개로 최소화, 기존 기능 파괴 없음 |

### 백엔드 확인 사항 (모두 해결됨)

1. ~~`GET /course/user/gpx` 응답에 `courseUuid` 필드 추가 가능 여부~~ → **추가 완료**
2. ~~`PATCH /course/{courseUuid}` - isMarathon=true일 때 courseEnvType/courseShapeType 처리 방식~~ → **null 전송 확정**
3. ~~`GET /course/user`와 `GET /course/user/gpx`의 배열 순서가 항상 동일한지 보장 여부~~ → **동일 순서 보장 확인**

> 모든 미결 사항이 해결되어 설계가 완전히 확정됨. 즉시 구현 착수 가능.
