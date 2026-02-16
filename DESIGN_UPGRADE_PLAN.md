# MVP → 고도화 설계서 (v2)

> 마지막 갱신: 피그마 스펙 + 사용자 확인사항 반영

---

## 1. 현재 코드 상태 (AS-IS)

### 타입 정의 (`features/course/model/types.ts`)

```typescript
EnvType  = 'PARK' | 'TRAIL' | 'TRACK' | 'URBAN' | 'BEACH' | 'MOUNTAIN' | 'FOREST'
EnvTypeName = '공원' | '산책로' | '트랙' | '도심' | '해변' | '산' | '숲'

ShapeType = 'LOOP' | 'LINEAR' | 'OUT_AND_BACK' | 'ART'
ShapeTypeName = '순환' | '직선' | '왕복' | '아트'

GradeType = 1 | 2 | 3  →  GRADE_TO_NAME: { 1: '초급', 2: '중급', 3: '고급' }
```

### 필터 (`features/course/ui/Filter.tsx`)

| 섹션 | 현재 값 |
|------|---------|
| 난이도 | 초급 / 중급 / 고급 |
| 러닝 장소 | 공원 / 산책로 / 트랙 / 도심 / 해변 / 산 / 숲 (7개) |
| 코스 모양 | 순환코스 / 직선코스 / 왕복코스 / 아트코스 |
| 코스 길이 | 0 ~ 40km (step 1) |
| 코스 경사 | 0 ~ 1000m (step 10) |
| DEFAULTS.elevationRange | [0, 1000] |

### 검색 (`features/course/ui/Search.tsx`)

- 단일 검색 인풋 (카테고리 없음)
- Dialog 모달: back 버튼 + 검색 인풋
- URL 파라미터: `keyword`

### 헤더 (`shared/ui/navigations/Header.tsx`)

- Home Header: Runddy 로고(좌) + 햄버거 메뉴(우)
- Depth Header: 뒤로가기 + 제목 + 우측 버튼

### 지도뷰 하단 (`features/course/ui/Map/CourseMapView.tsx`)

- 좌: 내 위치 버튼
- 우: `목록 보기` 버튼 → `onViewModeChange('list')` 호출
- 하단: 코스 카드 캐러셀

### 목록뷰 하단 (`features/course/ui/List.tsx`)

- 하단 중앙: `지도 보기` 플로팅 버튼 → `onViewModeChange('map')` 호출

### 뷰 전환 (`pages/course/index.tsx`)

- `viewMode` 로컬 state + Zustand `lastViewMode` 동기화
- `CourseMap`과 `CourseList` 각각 `onViewModeChange` prop 수신

### 라우팅 (`app/routing/router.tsx`)

- `/course/upload` — 이미 구현됨 (protected, title: '코스 등록하기')

---

## 2. 목표 상태 (TO-BE) — 피그마 스펙 기반

### 2-1. 지도보기 화면

| 번호 | 요소 | 변경 유형 | 상세 |
|------|------|-----------|------|
| 1 | 헤더 | **신규** | `지도보기`(active) / `목록보기` 탭 + 햄버거 메뉴. Runddy 로고 헤더 대체 |
| 2 | 카테고리 드롭다운 + 검색바 | **신규** | `런디코스 ∨` 드롭다운 + `지역, 코스이름 검색` 인풋을 같은 줄에 배치 |
| 2-1 | 드롭다운 열림 | **신규** | Popover: `런디코스` / `마라톤` 선택 |
| 3 | 필터 버튼 | 기존 유지 | `≡ 필터` |
| 4 | 현재 위치에서 검색 | 기존 유지 | 지도 이동 시 표시 |
| 6 | 내 위치 버튼 | 기존 유지 | 좌측 하단 |
| 7 | 코스 등록하기 버튼 | **신규** | `+ 코스 등록하기` → `/course/upload` 이동. bg: `linear-gradient(180deg, #D5F3FF 0%, #F2FBFF 100%)`, text/icon: `#119BD1`(text-runddy-pressed) |
| 8 | 코스 정보 카드 | 기존 유지 | 하단 스와이프 캐러셀 |

> **제거**: `목록 보기` 버튼 (뷰 전환이 헤더 탭으로 이동)

### 2-2. 필터 화면

#### 런디코스 필터

| 섹션 | 변경 사항 |
|------|----------|
| 타이틀 | `상세 필터` + X (변경 없음) |
| 난이도 | `초급` / `중급` / `고급` (**변경 없음**) |
| 러닝 장소 | `트랙` / `공원` / `강` / `산책로` / `도심` / `산` / `숲` / `해변` (8개, **RIVER(강) 추가**) |
| 코스 모양 | `순환형` / `직선형` / `왕복형` / `예술형` (**라벨 변경**: 순환→순환형, 직선→직선형, 왕복→왕복형, 아트→예술형) |
| 코스 길이 | `전체` 라벨 추가. 0~40km (변경 없음) |
| 코스 고도 | **라벨 변경**: `코스 경사` → `코스 고도`. **범위 변경**: 0~1000m → 0~400m. `전체` 라벨 추가 |
| 하단 | `초기화` + `N개의 코스 보기` (변경 없음) |

#### 마라톤 필터 (신규)

- 난이도, 러닝 장소, 코스 모양 **모두 숨김**
- 코스 길이: 0~40km (+ `전체` 라벨)
- 코스 고도: 0~400m (+ `전체` 라벨)
- 하단: 초기화 + N개의 코스 보기

### 2-3. 목록보기 & 검색 화면

| 번호 | 요소 | 변경 유형 | 상세 |
|------|------|-----------|------|
| 4 | 헤더 | **신규** | `지도보기` / `목록보기`(active) 탭 + 메뉴 |
| 1 | 카테고리 드롭다운 + 검색바 | **신규** | 지도보기와 동일 구조 |
| 2 | 필터 버튼 | 기존 유지 | `≡ 필터` |
| 3 | 코스 목록 리스트 | 기존 유지 | 세로 가상 스크롤 |
| - | 코스 등록하기 FAB | **신규** | 우측 하단. 기존 `지도 보기` 버튼 대체 |
| 5 | 검색 - 뒤로가기 | 기존 유지 | back 버튼 |
| - | 검색 - 카테고리 칩 | **신규** | 검색 다이얼로그 내 `런디코스 X` 또는 `마라톤 X` 칩 표시 |
| 6 | 검색 인풋 | 기존 유지 | enter 키로 검색 실행 |
| - | 필터 칩 바 | 기존 유지 | 활성 필터 `X` 제거 가능 칩 |

> **제거**: `지도 보기` 플로팅 버튼 (뷰 전환이 헤더 탭으로 이동)

---

## 3. 변경 항목 Diff 정리

### 3-1. 타입/상수 변경

| 파일 | 변경 내용 |
|------|----------|
| `model/types.ts` | `EnvType`에 `'RIVER'` 추가, `EnvTypeName`에 `'강'` 추가 |
| `model/types.ts` | `ShapeTypeName`을 `'순환형' \| '직선형' \| '왕복형' \| '예술형'`으로 변경 |
| `model/types.ts` | `CourseSearchParams`에 `isMarathon?: boolean` 추가 |
| `model/types.ts` | `CourseFilterPayload`에 `isMarathon?: boolean` 추가 |
| `model/constants.ts` | `ENV_TYPE_TO_NAME`에 `RIVER: '강'` 추가 |
| `model/constants.ts` | `ENV_NAME_TO_TYPE`에 `강: 'RIVER'` 추가 |
| `model/constants.ts` | `SHAPE_TYPE_TO_NAME` 라벨 변경: `순환→순환형, 직선→직선형, 왕복→왕복형, 아트→예술형` |
| `model/constants.ts` | `SHAPE_NAME_TO_TYPE` 키 변경: `순환형→LOOP, 직선형→LINEAR, 왕복형→OUT_AND_BACK, 예술형→ART` |

### 3-2. API 변경

| 파일 | 변경 내용 |
|------|----------|
| `api/course.api.ts` | `getCourses()`, `getFilteredCourseCount()`에 `isMarathon` 파라미터 전달 |
| `hooks/useCourses.ts` | URL의 `category` 파라미터 읽어 `isMarathon` 변환 후 API에 전달 |
| `hooks/useCourseCount.ts` | `isMarathon` 파라미터 전달 |

### 3-3. 신규 컴포넌트

| 컴포넌트 | 파일 | 역할 |
|----------|------|------|
| CategoryDropdown | `features/course/ui/CategoryDropdown.tsx` | 런디코스/마라톤 드롭다운 (Popover 기반) |
| RegisterCourseFAB | `features/course/ui/RegisterCourseFAB.tsx` | `+ 코스 등록하기` 플로팅 버튼 |
| 카테고리 모델 | `features/course/model/category.ts` | 카테고리 타입/상수/유틸 |

### 3-4. 수정 컴포넌트

| 컴포넌트 | 파일 | 변경 내용 |
|----------|------|----------|
| **Header.tsx** | `shared/ui/navigations/Header.tsx` | 코스 페이지용 탭 UI (지도보기/목록보기) 추가. 기존 Logo 헤더 대체 |
| **Search.tsx** | `features/course/ui/Search.tsx` | (1) 메인: CategoryDropdown 통합 (2) 다이얼로그: 카테고리 칩 태그 추가 |
| **Filter.tsx** | `features/course/ui/Filter.tsx` | (1) `category` prop 추가 (2) 마라톤: 난이도/장소/모양 숨김 (3) `코스 경사`→`코스 고도` (4) 범위 0~400m (5) `전체` 라벨 추가 (6) API에 `isMarathon` 전달 |
| **CourseMapView.tsx** | `features/course/ui/Map/CourseMapView.tsx` | `목록 보기` 버튼 → `RegisterCourseFAB` 교체. `onViewModeChange` 제거 |
| **List.tsx** | `features/course/ui/List.tsx` | `지도 보기` 버튼 → `RegisterCourseFAB` 교체. `onViewModeChange` prop 제거 |
| **pages/course/index.tsx** | `pages/course/index.tsx` | 헤더에 viewMode 전달 방식 변경 |

---

## 4. 상세 설계

### 4-1. 카테고리 모델

```typescript
// src/features/course/model/category.ts

export const CourseCategory = {
  RUNDDY: 'runddy',
  MARATHON: 'marathon'
} as const;

export type CourseCategoryType = typeof CourseCategory[keyof typeof CourseCategory];

export const CATEGORY_LABELS: Record<CourseCategoryType, string> = {
  runddy: '런디코스',
  marathon: '마라톤'
};

// URL → isMarathon 변환
export const isMarathonCategory = (category?: string): boolean =>
  category === CourseCategory.MARATHON;

// 기본값: 런디코스
export const DEFAULT_CATEGORY = CourseCategory.RUNDDY;
```

### 4-2. CategoryDropdown

```
파일: src/features/course/ui/CategoryDropdown.tsx
기반: shadcn/ui Popover
Props:
  - value: CourseCategoryType
  - onChange: (category: CourseCategoryType) => void
  - className?: string
동작:
  - 닫힌 상태: "런디코스 ∨" 또는 "마라톤 ∨" 텍스트 + 화살표
  - 열린 상태: Popover로 2개 옵션 표시
  - 선택 시 URL 파라미터 category 업데이트
  - 카테고리 변경 시 기존 필터 파라미터 초기화 (grade, envType, shapeType 등)
```

### 4-3. RegisterCourseFAB

```
파일: src/features/course/ui/RegisterCourseFAB.tsx
동작: useNavigate()로 /course/upload 이동
스타일:
  - background: linear-gradient(180deg, #D5F3FF 0%, #F2FBFF 100%)
  - text + icon: text-runddy-pressed (#119BD1)
  - rounded-full, shadow-runddy
  - gap-1, px-3, 아이콘(+) + "코스 등록하기"
```

### 4-4. 헤더 탭 변경

```
변경 대상: src/shared/ui/navigations/Header.tsx

코스 페이지(isCoursePage)일 때:
  기존: [Logo]                    [Menu]
  변경: [지도보기 탭][목록보기 탭]  [Menu]

탭 스타일:
  Active:   bg-w-100, text-g-90
  Inactive: bg 투명, text 기본

viewMode 전달 방법:
  → HeaderContext에 viewMode + setViewMode 콜백 추가
  → pages/course/index.tsx에서 HeaderContext에 주입
  → Header.tsx에서 HeaderContext 통해 탭 상태 렌더링
```

### 4-5. 필터 변경 상세

```
변경 대상: src/features/course/ui/Filter.tsx

1. Props 추가:
   - isMarathon: boolean

2. DEFAULTS 변경:
   - elevationRange: [0, 1000] → [0, 400]

3. 마라톤 모드일 때:
   - 난이도(grade) 섹션 숨김
   - 러닝 장소(envType) 섹션 숨김
   - 코스 모양(shapeType) 섹션 숨김
   - 필터 적용 시 isMarathon: true 포함

4. 공통 변경:
   - "코스 경사" → "코스 고도"
   - elevation max: 1000 → 400
   - elevation step: 10 → (피그마 기준 확인 필요, 기존 10 유지 또는 5)
   - elevation 눈금: "0m / 200m / 400m 이상"
   - "코스 길이" 타이틀 옆에 "전체" 라벨 추가
   - "코스 고도" 타이틀 옆에 "전체" 라벨 추가

5. envTypeNames 순서 변경 (피그마 기준):
   트랙, 공원, 강, 산책로, 도심, 산, 숲, 해변

6. shapeTypeNames 라벨 변경:
   순환형, 직선형, 왕복형, 예술형
   (기존 "{name}코스" 렌더링 → "{name}" 직접 렌더링으로 변경)
```

### 4-6. 검색 변경 상세

```
변경 대상: src/features/course/ui/Search.tsx

1. 메인 뷰 (닫힌 상태):
   기존: [🔍 지역, 코스이름 검색]
   변경: [런디코스 ∨] [지역, 코스이름 검색]
   → CategoryDropdown을 검색 인풋 앞에 배치

2. 다이얼로그 (열린 상태):
   기존: [← ] [검색 인풋                    ]
   변경: [← ] [런디코스 X] [검색 인풋        ]
   → 카테고리 칩(태그) 추가
   → X 탭 시 런디코스(기본값)로 복귀
```

### 4-7. 타입/상수 변경 상세

```
--- types.ts ---
EnvType 추가:
  | 'RIVER'
EnvTypeName 추가:
  | '강'
ShapeTypeName 변경:
  '순환' → '순환형'
  '직선' → '직선형'
  '왕복' → '왕복형'
  '아트' → '예술형'
CourseSearchParams 추가:
  isMarathon?: boolean
CourseFilterPayload 추가:
  isMarathon?: boolean

--- constants.ts ---
ENV_TYPE_TO_NAME 추가:
  RIVER: '강'
ENV_NAME_TO_TYPE 추가:
  강: 'RIVER'
SHAPE_TYPE_TO_NAME 변경:
  LOOP: '순환형', LINEAR: '직선형', OUT_AND_BACK: '왕복형', ART: '예술형'
SHAPE_NAME_TO_TYPE 변경:
  순환형: 'LOOP', 직선형: 'LINEAR', 왕복형: 'OUT_AND_BACK', 예술형: 'ART'
envTypeNames 순서:
  ['트랙', '공원', '강', '산책로', '도심', '산', '숲', '해변']
```

---

## 5. 상태 관리 설계

### 카테고리 상태: URL 파라미터

```
/?category=marathon&keyword=서울&...
/?category=runddy&keyword=한강&...   (category 없으면 기본 runddy)
```

### 뷰 모드: HeaderContext 확장

```typescript
// HeaderContext 확장
interface HeaderContextValue {
  // 기존 필드들...
  viewMode?: 'map' | 'list';
  setViewMode?: (mode: 'map' | 'list') => void;
}
```

- `pages/course/index.tsx`에서 `setViewMode` 콜백을 HeaderContext에 주입
- `Header.tsx`에서 viewMode를 읽어 탭 렌더링
- 탭 클릭 → `setViewMode` 호출 → index.tsx의 viewMode 변경

### 카테고리 변경 시 필터 초기화

카테고리를 전환하면(런디코스↔마라톤) 기존 필터 파라미터 초기화:
- grade, envType, shapeType → 삭제
- distanceRange, elevationRange → 기본값으로 복원
- keyword → 유지 (검색어는 카테고리 전환 시에도 유지)

---

## 6. 영향 범위 분석

### 변경 파일 목록

| # | 파일 | 변경 유형 |
|---|------|-----------|
| 1 | `features/course/model/types.ts` | 수정 (EnvType, ShapeTypeName, API 타입) |
| 2 | `features/course/model/constants.ts` | 수정 (매핑 테이블, 라벨, 순서) |
| 3 | `features/course/model/category.ts` | **신규** |
| 4 | `features/course/ui/CategoryDropdown.tsx` | **신규** |
| 5 | `features/course/ui/RegisterCourseFAB.tsx` | **신규** |
| 6 | `features/course/ui/Search.tsx` | 수정 |
| 7 | `features/course/ui/Filter.tsx` | 수정 |
| 8 | `features/course/ui/Map/CourseMapView.tsx` | 수정 |
| 9 | `features/course/ui/List.tsx` | 수정 |
| 10 | `features/course/hooks/useCourses.ts` | 수정 (isMarathon 전달) |
| 11 | `features/course/hooks/useCourseCount.ts` | 수정 (isMarathon 전달) |
| 12 | `features/course/api/course.api.ts` | 수정 (isMarathon 파라미터) |
| 13 | `shared/ui/navigations/Header.tsx` | 수정 (탭 UI) |
| 14 | `app/providers/HeaderContext.tsx` | 수정 (viewMode/setViewMode) |
| 15 | `pages/course/index.tsx` | 수정 (HeaderContext 연동) |
| 16 | `features/course/model/refactor-types.ts` | 수정 (onViewModeChange 제거) |
| 17 | `features/course/ui/Map/CourseMapContainer.tsx` | 수정 (onViewModeChange 제거) |
| 18 | `features/course/ui/Map/hooks/useCourseMapContainer.ts` | 수정 (onViewModeChange 제거) |

### ShapeTypeName 변경에 따른 파급 효과

`ShapeTypeName`이 `'순환'→'순환형'` 등으로 변경되므로, 아래 코드에 영향:
- `Filter.tsx`: envType/shapeType 필터 칩에서 한글 이름 사용 → 자동 반영
- `InfoCard.tsx`: `course.shapeTypeName` 표시 → 서버 응답값이므로 영향 없음
- `SHAPE_NAME_TO_TYPE` 역매핑: 키가 변경되므로 필터 적용 로직 자동 반영
- `constants.ts`의 `shapeTypeNames` 배열: `SHAPE_NAME_TO_TYPE` 키에서 자동 파생
- **Filter.tsx에서 `{shape}코스` 렌더링 → `{shape}` 직접 렌더링으로 변경 필요**
  (기존: "순환코스", 변경 후: "순환형" — 이미 "형"이 포함되므로 "코스" 접미사 제거)

---

## 7. 구현 순서

### Phase 1: 타입/상수/모델 기반 작업
1. `model/category.ts` 생성
2. `model/types.ts` 수정 (EnvType RIVER 추가, ShapeTypeName 변경, isMarathon 추가)
3. `model/constants.ts` 수정 (매핑 테이블, 라벨, 순서)

### Phase 2: API 레이어
4. `api/course.api.ts`에 isMarathon 전달
5. `hooks/useCourses.ts`에서 URL category → isMarathon 변환
6. `hooks/useCourseCount.ts`에 isMarathon 전달

### Phase 3: 헤더 탭 전환
7. `app/providers/HeaderContext.tsx`에 viewMode/setViewMode 추가
8. `shared/ui/navigations/Header.tsx`에 탭 UI 추가
9. `pages/course/index.tsx`에서 HeaderContext 연동

### Phase 4: 카테고리 드롭다운 + 검색
10. `CategoryDropdown.tsx` 생성
11. `Search.tsx` 수정 (CategoryDropdown 통합 + 검색 다이얼로그 카테고리 칩)

### Phase 5: 필터 고도화
12. `Filter.tsx` 수정 (마라톤 분기, 라벨 변경, 범위 변경, 전체 라벨)

### Phase 6: 하단 버튼 교체
13. `RegisterCourseFAB.tsx` 생성
14. `CourseMapView.tsx` 수정 (목록 보기 → 코스 등록하기)
15. `List.tsx` 수정 (지도 보기 → 코스 등록하기)

### Phase 7: 정리
16. `onViewModeChange` prop 체인 제거 (CourseMapContainer, useCourseMapContainer, refactor-types)
17. lint / build 확인

---

## 8. 디자인 토큰

| 요소 | 값 |
|------|-----|
| 탭 Active | `bg-w-100`, `text-g-90` |
| 탭 Inactive | 투명 bg |
| 코스 등록하기 bg | `linear-gradient(180deg, #D5F3FF 0%, #F2FBFF 100%)` |
| 코스 등록하기 text/icon | `text-runddy-pressed` (#119BD1) |
| 카테고리 드롭다운 | 기존 Popover 스타일 |
| 카테고리 칩 (검색 다이얼로그) | 기존 칩 스타일 참조 (FilterChipsBar) |
