# MVP → 고도화 설계서

## 1. 피그마 스펙 정밀 분석

### 1-1. 지도보기 (3개 화면)

#### 화면 1: 지도보기 default_런디코스
| 번호 | 요소 | 신규 여부 | 설명 |
|------|------|-----------|------|
| 1 | 헤더 탭 | **신규** | `지도보기`(active) / `목록보기` 탭 + 햄버거 메뉴. 기존 Logo 헤더 대체 |
| 2 | 카테고리 드롭다운 + 검색바 | **신규** | `런디코스 ∨` 드롭다운 + `지역, 코스이름 검색` 인풋을 한 줄에 배치 |
| 3 | 필터 버튼 | 기존 유지 | `≡ 필터` 버튼 (기존과 동일) |
| 6 | 내 위치 버튼 | 기존 유지 | 좌측 하단 위치 버튼 |
| 7 | 코스 등록하기 버튼 | **신규** | `+ 코스 등록하기` — 기존 `목록 보기` 버튼 대체. bg: linear-gradient(#D5F3FF → #F2FBFF), text/icon: #119BD1(runddy-pressed) |
| 8 | 코스 정보 카드 | 기존 유지 | 하단 스와이프 캐러셀 |

#### 화면 2: 카테고리 드롭다운 열린 상태 (2-1)
- `런디코스` / `마라톤` 2개 옵션
- Popover 형태로 드롭다운 표시

#### 화면 3: 지도보기 - 마라톤
- 드롭다운이 `마라톤 ∨`으로 변경
- 필터 버튼은 `≡ 필터` (동일)
- 나머지 레이아웃 동일

---

### 1-2. 필터 (2개 화면)

#### 런디코스 필터 (default)
| 번호 | 요소 | 변경사항 |
|------|------|----------|
| 1 | 타이틀 | `상세 필터` + X 닫기 버튼 (기존과 동일) |
| 2 | 난이도 | 라벨: `쉬움` / `보통` / `어려움` (**기존 `초급/중급/고급`과 다름 — 피그마 기준**) |
| - | 러닝 장소 | `트랙` / `공원` / `강` / `트레일` / `도심` / `호수` / `산` / `해변` (**기존과 일부 다름**) |
| 2-1 | 코스 모양 | `순환코스` / `직선코스` / `왕복코스` / `아트코스` (기존 유지) |
| 2-2 | 코스 길이 | `전체` 라벨 추가, 0km ~ 40km 이상 (기존 유지) |
| 2-3 | 코스 고도 | **기존 `코스 경사`(0~1000m) → `코스 고도`(0~400m)로 변경** |
| 3 | 하단 | `초기화` + `N개의 코스 보기` (기존 유지) |

#### 마라톤 필터 (신규)
- **난이도, 러닝 장소, 코스 모양 섹션 없음**
- 코스 길이만 표시 (0km ~ 40km 이상)
- 코스 고도만 표시 (0m ~ 400m 이상)
- 하단: `초기화` + `N개의 코스 보기`

---

### 1-3. 목록보기 & 검색 (4개 화면)

#### 목록보기 default
| 번호 | 요소 | 신규 여부 | 설명 |
|------|------|-----------|------|
| 4 | 헤더 탭 | **신규** | `지도보기` / `목록보기`(active) + 햄버거 메뉴 |
| 1 | 카테고리 드롭다운 + 검색바 | **신규** | 지도보기와 동일 구조 |
| 2 | 필터 버튼 | 기존 유지 | `≡ 필터` |
| 3 | 코스 목록 리스트 | 기존 유지 | 세로 스크롤 리스트 |
| - | 코스 등록하기 버튼 | **신규** | 우측 하단 FAB. 기존 `지도 보기` 버튼 대체 |

#### 검색 default (검색 화면 진입)
| 번호 | 요소 | 설명 |
|------|------|------|
| 5 | 뒤로가기 | 좌측 back 버튼 |
| - | 카테고리 태그 | **신규**: `런디코스 X` 칩 형태로 검색 인풋 앞에 표시 |
| 6 | 검색 인풋 | `지역, 코스이름 검색` placeholder |

#### 검색-입력중
- 카테고리 태그 `런디코스 X` 유지
- 키워드 입력 중 (예: `혜화동`)

#### 목록보기 empty case
- 헤더 탭 + 카테고리 드롭다운 + 검색바
- 활성 필터 칩: `필터 X`, `필터 X` (제거 가능 칩)
- 빈 상태: 일러스트 + "조건에 맞는 코스가 없어요"
- 코스 등록하기 FAB 버튼

---

## 2. MVP와 목표 디자인 차이점 요약

### 변경되는 것
| 영역 | MVP (현재) | 목표 디자인 |
|------|-----------|-------------|
| **헤더** | Runddy 로고 + 햄버거 메뉴 | 탭(지도보기/목록보기) + 햄버거 메뉴 |
| **검색바** | 돋보기 아이콘 + 검색 인풋 (단일) | 카테고리 드롭다운(`런디코스∨`/`마라톤∨`) + 검색 인풋 |
| **검색 다이얼로그** | back + 검색 인풋만 | back + 카테고리 칩(`런디코스 X`) + 검색 인풋 |
| **지도 하단 우측 버튼** | `목록 보기` 버튼 | `+ 코스 등록하기` 버튼 (light blue gradient) |
| **목록 하단 버튼** | `지도 보기` 플로팅 버튼 | `+ 코스 등록하기` FAB 버튼 |
| **뷰 전환 방식** | 하단 플로팅 버튼 | 헤더 탭 |
| **필터 경사→고도** | `코스 경사` 0~1000m | `코스 고도` 0~400m |
| **필터 마라톤** | 없음 | 마라톤 카테고리 전용 필터 (길이+고도만) |

### 유지되는 것
- 지도 (NaverMap) 렌더링
- 코스 마커 & 폴리라인
- "현재 위치에서 검색" 버튼
- 내 위치 버튼
- 코스 카드 (하단 캐러셀)
- 코스 리스트 (가상 스크롤)
- 필터 다이얼로그 기본 구조 (런디코스)

---

## 3. API 변경사항

기존 API 그대로 사용, `isMarathon: boolean` 파라미터 추가:

```typescript
// CourseSearchParams에 추가
isMarathon?: boolean;

// CourseFilterPayload에 추가
isMarathon?: boolean;
```

- `isMarathon: false` (또는 undefined) → 런디코스 검색
- `isMarathon: true` → 마라톤 검색

---

## 4. 컴포넌트 설계

### 4-1. 신규 컴포넌트

#### A. CategoryDropdown
```
파일: src/features/course/ui/CategoryDropdown.tsx
역할: 런디코스/마라톤 카테고리 선택 드롭다운
구현: Popover(기존 shadcn/ui) 기반
Props:
  - value: CourseCategory
  - onChange: (category: CourseCategory) => void
상태관리: URL 파라미터 (?category=marathon)
```

#### B. HeaderTabs (코스 페이지 전용 헤더)
```
파일: src/shared/ui/navigations/HeaderTabs.tsx 또는 Header.tsx 내부
역할: 지도보기/목록보기 탭 네비게이션
Props:
  - activeTab: 'map' | 'list'
  - onTabChange: (tab: 'map' | 'list') => void
스타일:
  - Active: bg-w-100, text-g-90
  - Inactive: 기본(투명 bg)
```

#### C. RegisterCourseFAB
```
파일: src/features/course/ui/RegisterCourseFAB.tsx
역할: "+ 코스 등록하기" 플로팅 버튼
스타일:
  - bg: linear-gradient(180deg, #D5F3FF 0%, #F2FBFF 100%)
  - text & icon: #119BD1 (text-runddy-pressed)
  - rounded-full, shadow
동작: 탭 시 코스 등록 페이지로 이동 (라우트 TBD)
```

### 4-2. 수정 컴포넌트

#### A. Header.tsx
```
변경: isCoursePage일 때 Logo 헤더 → HeaderTabs로 교체
필요: viewMode와 onViewModeChange를 전달받을 수 있는 구조
방안: HeaderContext에 viewMode/onViewModeChange 추가 또는
      router handle에 탭 설정 추가
```

#### B. Search.tsx
```
변경:
1. 메인 인풋 앞에 CategoryDropdown 추가
2. 검색 다이얼로그 내부에 카테고리 칩(태그) 추가
   - "런디코스 X" or "마라톤 X" 형태
   - X 탭 시 카테고리 초기화 (런디코스로 복귀)
```

#### C. Filter.tsx
```
변경:
1. category prop 추가 (런디코스/마라톤)
2. 마라톤일 때: 난이도/러닝장소/코스모양 섹션 숨김
3. "코스 경사" → "코스 고도" 라벨 변경
4. 고도 범위: 0~1000m → 0~400m
5. "전체" 라벨 추가 (코스 길이, 코스 고도 타이틀 옆)
6. API 요청 시 isMarathon 파라미터 추가
```

#### D. CourseMapView.tsx
```
변경:
1. 하단 우측 "목록 보기" 버튼 → "코스 등록하기" 버튼으로 교체
2. onViewModeChange 핸들러 제거 (헤더 탭으로 이동)
```

#### E. List.tsx
```
변경:
1. 하단 "지도 보기" 플로팅 버튼 → "코스 등록하기" FAB로 교체
2. onViewModeChange prop 불필요해질 수 있음 (헤더 탭으로 이동)
```

#### F. pages/course/index.tsx
```
변경:
1. viewMode를 HeaderContext 또는 별도 메커니즘으로 헤더에 전달
2. category 상태 관리 (URL 파라미터 기반)
```

### 4-3. 타입/모델 추가

#### A. 카테고리 모델
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
```

#### B. API 타입 확장
```typescript
// types.ts 수정
export type CourseSearchParams = {
  // ...기존 필드
  isMarathon?: boolean;
};

export type CourseFilterPayload = {
  // ...기존 필드
  isMarathon?: boolean;
};
```

---

## 5. 상태 관리 설계

### 카테고리 상태: URL 파라미터
```
/course?category=marathon&keyword=서울&...
/course?category=runddy&keyword=한강&... (또는 category 없으면 기본 runddy)
```

### 뷰 모드: 기존 Zustand (lastViewMode) 유지
- 헤더 탭에서 변경 시 `setLastViewMode` 호출
- pages/course/index.tsx의 viewMode 상태와 동기화

### 헤더에 viewMode 전달 방법
```
방안 1: HeaderContext 확장 — viewMode/setViewMode 추가
방안 2: pages/course/index.tsx에서 route handle로 커스텀 헤더 렌더링
방안 3: Header.tsx에서 useLocationStore의 lastViewMode 직접 참조

→ 방안 3 권장 (최소 변경, 이미 sessionStorage 지속)
  다만 탭 클릭 → setLastViewMode → 상위 컴포넌트에서 viewMode 반영 필요
  → HeaderContext에 onViewModeChange 콜백 추가가 깔끔
```

---

## 6. 구현 순서

### Phase 1: 기반 작업
1. `src/features/course/model/category.ts` 생성 (카테고리 타입/상수)
2. `CourseSearchParams`, `CourseFilterPayload`에 `isMarathon` 추가
3. `CoursesApi`에 `isMarathon` 파라미터 전달 로직 추가
4. `useCourses` 훅에서 URL의 `category` 파라미터 읽어 `isMarathon` 전달

### Phase 2: 헤더 탭 전환
5. Header.tsx에 코스 페이지용 탭 UI 추가
6. HeaderContext에 `onViewModeChange` 콜백 추가
7. pages/course/index.tsx에서 HeaderContext로 viewMode 연동

### Phase 3: 카테고리 드롭다운 + 검색
8. CategoryDropdown.tsx 컴포넌트 생성
9. Search.tsx에 CategoryDropdown 통합
10. 검색 다이얼로그에 카테고리 칩(태그) 추가

### Phase 4: 필터 고도화
11. Filter.tsx에 category prop 추가
12. 마라톤 전용 필터 (길이+고도만) 분기 처리
13. "코스 경사" → "코스 고도" 라벨 변경, 범위 0~400m
14. "전체" 라벨 추가

### Phase 5: 하단 버튼 교체
15. RegisterCourseFAB.tsx 생성
16. CourseMapView.tsx: "목록 보기" → "코스 등록하기" 교체
17. List.tsx: "지도 보기" → "코스 등록하기" 교체

### Phase 6: 정리 & 검증
18. 불필요한 코드 제거 (onViewModeChange prop 정리 등)
19. lint / build 확인
20. 카테고리 전환 시 필터 초기화 동작 확인

---

## 7. 디자인 토큰 정리

| 요소 | 토큰 |
|------|------|
| 탭 Active | `bg-w-100`, `text-g-90` |
| 탭 Inactive | 기본 (투명 bg) |
| 코스 등록하기 bg | `background: linear-gradient(180deg, #D5F3FF 0%, #F2FBFF 100%)` |
| 코스 등록하기 text/icon | `text-runddy-pressed` (#119BD1) |
| 카테고리 드롭다운 | 기존 Popover 스타일 활용 |

---

## 8. 확인/결정 필요 사항

1. **난이도 라벨**: 피그마에서 `쉬움/보통/어려움`으로 표시 — 기존 `초급/중급/고급`에서 변경하는 것인지?
2. **러닝 장소**: 피그마에서 `강`, `호수` 추가, `산책로`→`트레일`, `숲` 제거 — API 변경 동반 여부?
3. **코스 등록하기**: 이동할 라우트 경로 (예: `/course/register`)
4. **카테고리 기본값**: URL에 category 없을 때 기본 `런디코스`?
