# Runddy — 러닝 코스 탐색 플랫폼

**[English README →](./README.en.md)**

---

## 왜 만들었나

달리기를 시작한 사람이 가장 먼저 부딪히는 문제는 "어디서 달리지?"다.  
Strava는 글로벌 서비스라 국내 지형 특성(하천변, 도심 공원, 산책로)이 잘 반영되지 않고, 러닝 크루 커뮤니티는 여전히 카카오톡 사진 공유에 의존한다. 코스의 난이도, 환경, 거리를 조건으로 검색하는 도구 자체가 없다.

Runddy는 **네이버 지도 기반의 국내 러닝 코스 탐색·공유 플랫폼**이다. 근처 코스를 지도로 찾고, GPX 파일이나 Strava 활동을 코스로 등록하고, 커뮤니티 리뷰로 실제 달려본 사람들의 평가를 확인할 수 있다.

---

## 데모 & 스크린샷

> **[🔗 라이브 데모](https://runddy.com)** <!-- 배포 URL로 교체 -->

| 코스 탐색 (지도) | 코스 상세 | 코스 등록 |
|:---:|:---:|:---:|
| ![지도 뷰](./public/screenshots/map.png) | ![상세 뷰](./public/screenshots/detail.png) | ![등록 뷰](./public/screenshots/upload.png) |

<!-- 스크린샷 없을 경우 위 표 삭제, 데모 링크만 남기기 -->

---

## 핵심 기능

- **지도·리스트 뷰 전환** — 네이버 지도에서 핀으로 코스를 탐색하거나, 조건 필터(난이도·환경·형태·거리)로 목록을 좁힘
- **고도 그래프** — GPX 데이터 기반 고도 프로필을 Recharts로 시각화
- **GPX 업로드 / Strava 연동** — 파일 직접 업로드 또는 Strava OAuth로 활동을 불러와 코스로 변환
- **커뮤니티 리뷰** — 키워드 태그 기반 리뷰 시스템 (경치 좋음, 초보 추천, 그늘 있음 등)
- **북마크** — 마음에 드는 코스 저장 및 관리
- **소셜 로그인** — Kakao / Naver OAuth 2.0

---

## 기술 스택 & 선택 이유

| 기술 | 선택 이유 |
|------|-----------|
| **React 19 + Vite 7** | React 19의 concurrent 기능 활용, Vite의 빠른 HMR로 개발 생산성 확보 |
| **Naver Maps** | 국내 주소 geocoding 정확도가 Google Maps 대비 높고, 한국어 지명 처리가 자연스러움. 하천변·공원 등 러닝 코스와 관련 있는 POI가 잘 정비되어 있음 |
| **TanStack React Query v5** | 서버 상태가 지배적(코스 목록, 리뷰, 프로필)이라 Redux 없이 Query의 캐싱·deduplication만으로 충분. staleTime·gcTime 조정으로 불필요한 재요청 제거 |
| **Zustand + sessionStorage** | 지도 뷰포트(중심 좌표, 줌, 스크롤 위치)는 라우트 이동 후 복원이 필요하지만 탭을 닫으면 초기화되어야 함. localStorage가 아닌 sessionStorage persist를 선택한 이유 |
| **Feature-Sliced Design** | 6개 독립 도메인(course, map, strava, user 등)이 각자의 API·모델·훅·UI를 가짐. 초기 구조 비용을 감수하고 레이어 간 단방향 의존성으로 장기 유지보수성 확보 |
| **Tailwind CSS v4 + Style Dictionary** | Figma 토큰에서 CSS 변수·Tailwind 유틸·shadcn 테마를 단일 소스에서 자동 생성. 디자인 시스템과 코드 간 불일치를 구조적으로 방지 |
| **React Hook Form / Zod 미사용** | 앱 내 폼이 3개이고 복잡한 필드 검증이 없어 15KB 라이브러리 도입은 과잉. 단순 `useState`로 충분하다고 판단 |

---

## 구현하면서 고민한 것들

### 동시 401 대응: 토큰 갱신 중복 호출 방지

페이지 진입 시 여러 API 요청이 동시에 나가다가 모두 401을 받으면, 각 요청이 독립적으로 토큰 갱신을 시도해 단일 사용 refresh token이 소진될 수 있다.

```typescript
// http.ts — 모듈 스코프의 Promise로 동시 갱신 요청을 하나로 합산
let refreshTokenPromise: Promise<string | null> | null = null;

if (!refreshTokenPromise) {
  refreshTokenPromise = authService.getAccessToken().finally(() => {
    refreshTokenPromise = null;
  });
}
const newToken = await refreshTokenPromise; // 이미 진행 중이면 같은 Promise 대기
```

첫 번째 401 핸들러가 갱신 Promise를 생성하면, 이후 모든 핸들러는 동일 Promise를 기다린다. 갱신 완료 후 원래 요청을 자동 재시도한다.

### OAuth 콜백 race condition 방지

`AuthProvider`는 마운트 시 `refreshAuth()`를 자동 호출한다. `/login/success` 경로에서도 동일하게 동작하면, 라우트 컴포넌트의 토큰 교환과 동시 실행되어 refresh token이 두 번 사용된다.

```typescript
useEffect(() => {
  if (window.location.pathname === '/login/success') {
    setIsLoading(false);
    return; // AuthProvider의 자동 초기화 스킵 — LoginSuccess가 단독 처리
  }
  refreshAuth();
}, []);
```

### 북마크 토글: 5개 쿼리 캐시의 낙관적 업데이트

북마크 상태는 북마크 목록, 코스 상세, 여러 코스 리스트(필터 조합 별로 각자 캐시됨)에 흩어져 있다. 토글 시 모든 캐시를 즉시 업데이트하고, 실패하면 스냅샷으로 롤백한다.

```typescript
onMutate: async (payload) => {
  await queryClient.cancelQueries({ queryKey: ['bookmarks'] });
  
  // 5개 위치에서 스냅샷 수집
  const prevBookmarks = queryClient.getQueryData(['bookmarks']);
  const prevCoursesSnapshots = queryClient.getQueriesData({ queryKey: ['courses'] });
  // ... 낙관적 업데이트 적용
  return { prevBookmarks, prevCoursesSnapshots };
},
onError: (_, __, ctx) => {
  queryClient.setQueryData(['bookmarks'], ctx?.prevBookmarks);
  ctx?.prevCoursesSnapshots.forEach(([key, data]) => queryClient.setQueryData(key, data));
},
```

### 가상 스크롤 + 스크롤 위치 복원

코스 목록은 1000개 이상이 될 수 있어 TanStack Virtual을 적용했다. 상세 페이지에서 돌아올 때 이전 스크롤 위치를 sessionStorage에서 복원해 UX 연속성을 유지한다.

---

## 아키텍처

**Feature-Sliced Design** — 레이어 간 단방향 의존성 (`app → features → shared`)

```
src/
├── app/            # 라우터, Provider (AuthProvider, QueryClientProvider)
├── features/
│   ├── course/     # 코스 탐색·상세·리뷰 (api / model / hooks / lib / ui)
│   ├── course-upload/  # GPX 업로드 및 코스 등록
│   ├── map/        # 네이버 지도 래퍼, 위치 Zustand 스토어
│   ├── my-course/  # 내 코스 관리
│   ├── strava/     # Strava OAuth 연동
│   └── user/       # 인증, 프로필, 북마크
├── pages/          # 라우트 단위 조합 컴포넌트 (비즈니스 로직 없음)
└── shared/         # HTTP 클라이언트, 디자인 토큰, UI 프리미티브
```

각 feature 내부는 `api → model → hooks → lib → ui` 순서로 단방향 참조한다.

---

## 시작하기

### 사전 준비

- Node.js 20+, Yarn 1.x
- 로컬 또는 스테이징 백엔드 서버

### 설치 및 실행

```bash
git clone https://github.com/RunddyProject/Client.git
cd Client

cp .env.example .env.local
# .env.local에서 VITE_SERVER_DOMAIN, VITE_CLIENT_URL 입력

yarn install
yarn dev
```

### 환경변수

| 변수 | 설명 | 예시 |
|------|------|------|
| `VITE_SERVER_DOMAIN` | API 서버 도메인 (trailing slash 없이) | `https://api.runddy.com` |
| `VITE_CLIENT_URL` | 클라이언트 도메인 (OAuth redirect_uri) | `https://runddy.com` |

> Naver Maps는 백엔드에서 API 키를 관리하며, 클라이언트는 별도 설정 없이 스크립트로 로드됩니다.

### 주요 스크립트

```bash
yarn dev           # 개발 서버
yarn build         # 타입 체크 + 프로덕션 빌드
yarn lint:fix      # ESLint 자동 수정
yarn tokens:all    # 디자인 토큰 재생성 (scripts/tokens/ 수정 시 필수)
```
