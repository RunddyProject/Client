# Runddy Client

러너를 위한 러닝 코스 탐색·공유 플랫폼의 프론트엔드입니다. 네이버 지도 기반으로 주변 코스를 검색하고, GPX 파일로 나만의 코스를 등록하거나 Strava 활동을 코스로 변환할 수 있습니다.

---

## 문제점 (현재 README)

> 이 섹션은 비판적 검토 결과입니다. 실제 README에서는 삭제하세요.

아래는 기존 README(`yarn create vite` 기본 템플릿)의 문제점입니다.

1. **앱 설명 전무** — Runddy가 뭔지, 뭘 하는 앱인지 한 줄도 없음.
2. **실행 방법 없음** — clone 이후 단계가 없어 처음 보는 개발자는 앱을 켤 수가 없음.
3. **환경변수 문서 없음** — `VITE_SERVER_DOMAIN` / `VITE_CLIENT_URL` 없이 앱이 동작하지 않는데 언급 자체가 없음. `.env.example`도 없었음.
4. **폴더 구조 없음** — FSD 아키텍처를 쓰는데 어디에 뭐가 있는지 전혀 알 수 없음.
5. **기술 스택 없음** — 왜 Naver Maps인지, 왜 Strava인지, 인증이 어떻게 동작하는지 파악 불가.
6. **배포 방법 없음** — `vercel.json`이 있어서 Vercel 기반임을 추론할 수 있지만 설명이 없음.
7. **프로젝트 고유 스크립트 설명 없음** — `tokens:all` 같은 커맨드는 Vite 기본 프로젝트에 없는 것이라 설명이 필요함.

---

## Tech Stack

| 분류 | 기술 |
|------|------|
| Framework | React 19, TypeScript 5.8, Vite 7 |
| Routing | React Router v7 |
| Server State | TanStack React Query v5 |
| Client State | Zustand v5 (sessionStorage 영속) |
| Styling | Tailwind CSS v4, shadcn/ui (Radix UI) |
| Map | Naver Maps (window.naver.maps 전역 스크립트) |
| Auth | Kakao / Naver OAuth 2.0 (HttpOnly 쿠키 + JWT) |
| 3rd Party | Strava API (활동 임포트) |
| Charts | Recharts (고도 프로필) |
| Build | Vite + Style Dictionary (디자인 토큰 자동 생성) |

---

## Getting Started

### Prerequisites

- Node.js 20+
- Yarn 1.x (`npm i -g yarn`)
- 백엔드 서버 실행 중 (또는 스테이징 서버 URL 보유)

### 설치 및 실행

```bash
git clone https://github.com/RunddyProject/Client.git
cd Client

# 환경변수 설정
cp .env.example .env.local
# .env.local을 열어 VITE_SERVER_DOMAIN, VITE_CLIENT_URL 값을 채워넣기

yarn install
yarn dev
```

> **Naver Maps**: 별도 API 키 설정 없이 스크립트 태그로 로드됩니다. 백엔드 서버에서 해당 도메인의 Maps 키를 관리합니다.

---

## 환경변수

`.env.example`을 복사해 `.env.local`을 만들고 아래 값을 채웁니다.

| 변수 | 필수 | 설명 | 예시 |
|------|------|------|------|
| `VITE_SERVER_DOMAIN` | ✅ | API 서버 도메인 (trailing slash 없이) | `https://api.runddy.com` |
| `VITE_CLIENT_URL` | ✅ | 클라이언트 도메인 — OAuth redirect_uri에 사용 | `https://runddy.com` |

---

## 폴더 구조

[Feature-Sliced Design(FSD)](https://feature-sliced.design/) 아키텍처를 따릅니다. 레이어 간 참조는 단방향(`app → features → shared`)이며, 반드시 `@/` 경로 alias를 사용합니다.

```
├── public/
│   ├── fonts/                   # Pretendard 웹폰트 (self-hosted)
│   └── images/                  # 로고, 지도 마커, OG 이미지
│
├── scripts/
│   └── tokens/                  # Style Dictionary 기반 디자인 토큰 생성 스크립트
│                                #   → yarn tokens:all 로 실행
│
├── src/
│   ├── app/
│   │   ├── providers/           # 전역 Context: AuthProvider, QueryClientProvider
│   │   └── routing/             # createBrowserRouter 정의, ProtectedRoute 컴포넌트
│   │
│   ├── features/                # 도메인별 비즈니스 로직 모듈
│   │   ├── course/              # 코스 탐색·검색·상세·리뷰 (핵심 도메인)
│   │   │   ├── api/             #   CoursesApi — API 호출 singleton 객체
│   │   │   ├── hooks/           #   useCourses, useCourseDetail, useToggleBookmark 등
│   │   │   ├── lib/             #   고도 계산, 리뷰 데이터 transformer 함수
│   │   │   ├── model/           #   타입 정의, 상수(EnvType, ShapeType 등 label map)
│   │   │   └── ui/              #   CourseCard, CourseMapContainer/View, Filter 등
│   │   │
│   │   ├── course-upload/       # GPX 업로드 및 코스 등록 플로우
│   │   │   ├── api/             #   업로드·수정 API
│   │   │   ├── hooks/           #   useGpxUpload, useCourseUploadForm
│   │   │   ├── lib/             #   GPX 파싱, API ↔ UI 변환 transformer
│   │   │   └── ui/              #   업로드 폼, 지도 미리보기, 수정 페이지
│   │   │
│   │   ├── map/                 # Naver Maps 래퍼 및 위치 상태 관리
│   │   │   ├── context/         #   MapContext (지도 인스턴스 공유)
│   │   │   ├── hooks/           #   useNaverMap, useMarkers, useGpxPolyline,
│   │   │   │                    #   useFitLatLngBoundsScale, useGeolocation
│   │   │   ├── lib/             #   geocode 유틸, 좌표 계산
│   │   │   ├── model/           #   location.store.ts (Zustand, sessionStorage 영속)
│   │   │   └── ui/              #   NaverMap 컴포넌트 (hook 조합으로 동작 확장)
│   │   │
│   │   ├── my-course/           # 내가 등록한 코스 관리 (목록·수정·삭제)
│   │   │
│   │   ├── strava/              # Strava OAuth 연동 및 활동 불러오기
│   │   │   ├── api/             #   Strava 활동 목록·상세 API
│   │   │   ├── hooks/           #   useStravaActivities, useStravaConnect
│   │   │   ├── model/           #   strava-upload.store.ts (업로드 미리보기 상태)
│   │   │   └── ui/              #   활동 목록, 연결 유도 화면
│   │   │
│   │   └── user/                # 인증, 프로필, 북마크
│   │       ├── api/             #   auth.ts (AuthService singleton), user.api.ts
│   │       ├── hooks/           #   useProfile, useBookmarks, useDeleteAccount
│   │       └── ui/              #   프로필 카드, 북마크 목록, 회원 탈퇴 폼
│   │
│   ├── pages/                   # 라우트 단위 조합 컴포넌트 (비즈니스 로직 없음)
│   │   ├── course/              #   HomePage, CourseDetailPage, CourseUploadPage 등
│   │   ├── login/               #   LoginPage, LoginSuccessPage
│   │   ├── me/                  #   ProfilePage, ProfileEditPage, DeleteAccountPage
│   │   └── strava/              #   StravaActivitiesPage, StravaSuccessPage
│   │
│   └── shared/                  # 레이어 무관 공용 코드
│       ├── design/
│       │   └── tokens/          # ⚠️ 자동 생성 파일 — 직접 수정 금지
│       │       ├── variables.css      # CSS 커스텀 프로퍼티
│       │       ├── tw-typography.ts   # 타이포그래피 유틸리티
│       │       └── shadcn-theme.css   # shadcn 테마 오버라이드
│       ├── hooks/               #   공용 훅 (useVirtualScroll, useDebounce 등)
│       ├── icons/               #   <Icon name="..." /> SVG 아이콘 컴포넌트
│       ├── lib/
│       │   ├── http.ts          #   fetch 래퍼 (JWT 자동 주입, 401 토큰 갱신)
│       │   └── utils.ts         #   cn(), deepEqual() 등
│       ├── model/               #   공용 타입·상수 (ApiError, User 등)
│       └── ui/
│           ├── composites/      #   프로젝트 전용 조합 컴포넌트 (SearchInput 등)
│           ├── navigations/     #   Header, BottomMenu
│           └── primitives/      #   shadcn/ui 기반 원시 컴포넌트 (Button, Dialog 등)
│
├── .env.example                 # 환경변수 템플릿
├── components.json              # shadcn/ui CLI 컴포넌트 설정
├── vercel.json                  # Vercel SPA 라우팅 fallback 설정
└── vite.config.ts               # 경로 alias, Tailwind, SVGR 플러그인 설정
```

---

## Scripts

```bash
yarn dev              # 개발 서버 시작 (HMR)
yarn build            # 타입 체크 + 프로덕션 빌드
yarn lint             # ESLint 검사
yarn lint:fix         # ESLint 자동 수정
yarn format           # Prettier 포맷팅
yarn tokens:all       # 디자인 토큰 전체 재생성 (CSS vars, 타이포, shadcn 테마)
```

> `scripts/tokens/` 파일을 수정했다면 반드시 `yarn tokens:all`을 실행하고 생성된 파일을 함께 커밋하세요.

---

## 주요 페이지 및 라우트

| 경로 | 인증 필요 | 설명 |
|------|-----------|------|
| `/` | — | 코스 탐색 (지도·리스트 뷰 전환) |
| `/course/:uuid` | — | 코스 상세 (정보, 고도 그래프, 리뷰) |
| `/course/my` | ✅ | 내가 등록한 코스 목록 |
| `/course/upload` | ✅ | GPX 파일로 코스 등록 |
| `/strava/activities` | ✅ | Strava 활동 목록에서 코스 변환 |
| `/me` | ✅ | 프로필, 북마크, 작성 리뷰 |
| `/login` | — | Kakao / Naver 소셜 로그인 |

---

## 배포

Vercel을 사용합니다. `vercel.json`에 SPA 라우팅 fallback이 설정되어 있습니다.

```bash
# 프로덕션 배포 (Vercel CLI)
vercel --prod
```

Vercel 프로젝트 환경변수에 `VITE_SERVER_DOMAIN`과 `VITE_CLIENT_URL`을 설정해야 합니다.
