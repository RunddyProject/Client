<div align="center">

<img src="public/logo.svg" alt="Runddy" width="64" />

# Runddy

</div>

---

<!-- 한국어 -->
<details open>
<summary><strong>한국어</strong></summary>

## 문제 인식

러닝 코스 정보는 네이버 블로그, 카카오맵 리뷰, 러닝 커뮤니티에 파편화되어 있습니다. "지금 내 위치에서 8km 이내, 고도차 200m 이하, 순환형 코스"를 한 번에 찾는 방법이 없었습니다. GPX 파일을 갖고 있어도 공유할 플랫폼이 없었고, 리뷰는 자유 텍스트라 집계가 불가능했습니다.

Runddy는 이 문제를 해결하기 위해 만든 러닝 코스 탐색 플랫폼입니다. 지도 기반 탐색, 구조화된 필터, GPX 업로드/Strava 연동, 키워드 리뷰를 하나의 앱에서 제공합니다.

**서비스 주소:** https://www.runddy.co.kr

---

## 화면 미리보기

> 스크린샷 / GIF 예정 — 지도 탐색, 코스 상세, 코스 등록, 마이페이지

---

## 주요 기능

**코스 탐색**
- 지도/목록 뷰 전환 — Naver Maps 마커 지도와 카드 리스트를 탭 하나로 전환
- 5개 축 동시 필터링 — 난도(초급/중급/고급), 환경(공원/산책로/트랙/도심/해변/산/숲/강), 코스 모양(순환/직선/왕복/아트), 거리(0–40km+), 고도(0–400m+)
- 코스 유형 — 검증된 공식 코스, 유저 등록 런디 코스, 마라톤 코스 구분
- 현위치 탐색 + 키워드 검색 — GPS 기반 자동 로드, 지역명/코스명 키워드 지오코딩

**코스 상세**
- 경로 미리보기 지도, 고도 프로파일 차트 (Recharts)
- 거리·고도 통계, 출발/도착 주소, GPX 다운로드, 공유

**코스 등록**
- GPX 직접 업로드 — 로컬 파일 파싱 후 환경·모양·공개 여부 설정
- Strava OAuth 연동 — 활동 목록에서 선택하면 이름·경로 자동 완성
- 공개/비공개 토글, 코스 수정·삭제

**리뷰 (코스톡)**
- 3개 카테고리(코스 컨디션/환경/편의시설), 14개 키워드 선택형 리뷰
- 키워드 집계로 코스별 특성을 한눈에 파악

**마이페이지 & 인증**
- Kakao / Naver 소셜 로그인
- 저장한 코스, 내 코스, 프로필 수정, 회원탈퇴

---

## 기술 선택과 이유

| 기술 | 선택 이유 |
|---|---|
| **Naver Maps** | 한국 주소/지오코딩 정확도가 Google Maps 대비 높음. 국내 지명 검색 결과 품질 차이가 명확함 |
| **TanStack React Query** | 지도를 이동할 때마다 동일한 좌표 범위 쿼리가 반복됨. `keepPreviousData` + `staleTime` 조합으로 불필요한 리페치 제거 |
| **Zustand** | 지도 뷰포트(center, zoom), 마지막 검색 영역, 활성 코스 ID, 스크롤 위치를 라우트 간에 유지해야 함. sessionStorage persist로 탭 유지·새탭 초기화를 자연스럽게 처리 |
| **shadcn/ui (Radix UI)** | 모바일 터치 인터랙션과 접근성을 처음부터 보장하면서 빠르게 UI를 구성하기 위해 선택. Sheet, Dialog, Slider 등 복잡한 컴포넌트를 직접 구현하지 않음 |
| **Feature-Sliced Design** | 기능이 늘어날수록(course → my-course → strava) 각 feature 간 의존 방향을 강제로 단방향으로 유지하기 위해 도입. 파일 위치만 보고 레이어 역할을 파악할 수 있음 |
| **Design Token 자동화** | 색상/타이포그래피 값을 스크립트로 CSS 변수·Tailwind 설정·shadcn 테마에 동시 적용. 디자이너와 협업 시 토큰 변경이 전체 UI에 즉시 반영됨 |

**주목할 구현 포인트**

- **JWT 401 중복 갱신 방지** — 동시에 여러 요청이 401을 받으면 토큰 갱신 요청이 중복 발생함. `refreshTokenPromise` 싱글턴으로 이미 진행 중인 갱신이 있으면 같은 Promise를 공유하도록 처리 (`src/shared/lib/http.ts`)
- **Strava Polyline → SVG 변환** — Strava API 응답의 인코딩된 polyline을 서버 없이 클라이언트에서 SVG path로 변환해 활동 카드에 경로 미리보기 렌더링 (`src/features/strava/ui/`)
- **지도 뷰 상태 보존** — 코스 상세로 진입했다가 돌아왔을 때 이전 지도 위치와 활성 코스를 복원. Zustand sessionStorage persist 활용

---

## 아키텍처

Feature-Sliced Design(FSD) 변형 구조를 적용했습니다. 각 feature는 `api / model / hooks / ui` 레이어를 독립적으로 갖고, `shared`에만 의존합니다.

```
src/
├── app/
│   ├── providers/        # AuthContext (JWT + refresh), HeaderContext
│   └── routing/          # router.tsx, ProtectedRoute
├── features/
│   ├── course/           # 탐색·필터·상세·리뷰 — 코어 도메인
│   ├── course-upload/    # GPX 업로드 폼, 등록 플로우
│   ├── map/              # NaverMap 컴포넌트, location Zustand store
│   ├── my-course/        # 내 코스 CRUD
│   ├── strava/           # OAuth 연동, 활동 목록, polyline 변환
│   └── user/             # 인증, 프로필, 북마크, 피드백
├── pages/                # 라우트별 컴포지션 (비즈니스 로직 없음)
└── shared/
    ├── lib/              # HTTP 클라이언트 (JWT 자동 주입, 401 처리)
    ├── ui/               # primitives(shadcn), composites, navigations
    ├── design/           # 자동 생성 디자인 토큰
    └── model/            # 공유 타입·상수
```

**상태 레이어**

```
서버 상태   → React Query  (코스 목록, 상세, 리뷰, 북마크 — staleTime 캐싱)
클라이언트  → Zustand      (위치, 지도 뷰포트, 스크롤 위치, Strava 미리보기)
전역 UI    → Context API   (Auth, Header 설정)
```

**주요 라우트**

```
/                      # 코스 탐색 (지도/목록)
/course/:uuid          # 코스 상세
/course/:uuid/map      # 경로 전체보기
/course/upload         # 코스 등록 (로그인 필요)
/course/my             # 내 코스 (로그인 필요)
/course/my/:uuid/edit  # 내 코스 수정 (로그인 필요)
/strava/activities     # Strava 활동 선택 (로그인 필요)
/login                 # 소셜 로그인
/me                    # 마이페이지 (로그인 필요)
/me/edit               # 프로필 수정 (로그인 필요)
/me/delete             # 회원탈퇴 (로그인 필요)
```

---

## 시작하기

### 사전 요구사항

- Node.js 20+
- Yarn (Berry)

### 환경 변수

```bash
cp .env.example .env.local
```

| 변수 | 설명 |
|---|---|
| `VITE_SERVER_DOMAIN` | 백엔드 REST API Base URL |
| `VITE_NAVER_MAP_CLIENT_ID` | Naver Maps Client ID |
| `VITE_KAKAO_CLIENT_ID` | Kakao OAuth Client ID |
| `VITE_NAVER_CLIENT_ID` | Naver OAuth Client ID |
| `VITE_STRAVA_CLIENT_ID` | Strava OAuth Client ID |
| `VITE_STRAVA_REDIRECT_URI` | Strava OAuth Redirect URI |

### 설치 및 실행

```bash
yarn install
yarn dev          # 개발 서버
yarn build        # 프로덕션 빌드
yarn lint:fix     # 린트 자동 수정
yarn tokens:all   # 디자인 토큰 재생성
```

</details>

---

<!-- English -->
<details>
<summary><strong>English</strong></summary>

## Problem

Running course information in Korea is scattered — Naver blog posts, Kakao Maps comments, running community forums. There was no way to answer a simple question: *"What loop courses are within 8km of me, under 200m elevation gain?"* Runners with GPX files had nowhere to share them, and reviews were free-text with no structure to aggregate.

Runddy is a mobile-first course discovery platform built to fix this. It brings map-based exploration, structured filtering, GPX import, Strava integration, and keyword reviews into a single app.

**Live:** https://www.runddy.co.kr

---

## Preview

> Screenshots / GIF coming — map view, course detail, course registration, my page

---

## Features

**Discovery**
- Map / list toggle — Naver Maps marker view and card list, one tap to switch
- Multi-axis filtering — grade (beginner/intermediate/advanced), environment (8 types), shape (loop/linear/out-and-back/art), distance (0–40km+), elevation gain (0–400m+)
- Course types — verified official courses, user-submitted Runddy courses, marathon courses
- Location search — GPS auto-discovery + keyword geocoding for area and course name

**Course Detail**
- Route preview map, elevation profile chart (Recharts)
- Distance/elevation stats, start/end address, GPX download, share

**Course Registration**
- GPX upload — parse a local file, set environment, shape, visibility, and submit
- Strava import — OAuth connect → select an activity → name and route auto-filled
- Public/private toggle, edit and delete

**Reviews (Course Talk)**
- 14 keywords across 3 categories (condition / environment / facilities)
- Keyword counts give an at-a-glance profile for each course

**Auth & Profile**
- Kakao / Naver social login
- Saved courses, my courses, profile edit, account deletion

---

## Tech Stack & Why

| Technology | Reason |
|---|---|
| **Naver Maps** | Noticeably more accurate geocoding and Korean address resolution than Google Maps — critical for a location-first app in Korea |
| **TanStack React Query** | Map panning triggers repeated queries over overlapping coordinate ranges. `keepPreviousData` + `staleTime` eliminates redundant fetches and keeps the UI stable during transitions |
| **Zustand** | Map viewport (center, zoom), last searched area, active course ID, and scroll position all need to survive route changes. Zustand's `persist` middleware with sessionStorage handles this cleanly — state survives in-tab navigation, resets on new tab |
| **shadcn/ui (Radix UI)** | Accessibility and touch interactions come built-in. Sheet, Dialog, Slider — no need to reimplement complex primitives; focus went to product logic instead |
| **Feature-Sliced Design** | As features grew (course → my-course → strava), FSD enforced unidirectional dependencies. Each feature owns its `api / model / hooks / ui` layers independently and only reaches into `shared` |
| **Design Token pipeline** | A script generates CSS variables, Tailwind config, and shadcn theme from a single source. Token changes propagate across the entire UI automatically; CI commits the generated files on every push |

**Notable implementation details**

- **JWT refresh deduplication** — Concurrent 401 responses can trigger multiple refresh requests. A `refreshTokenPromise` singleton ensures in-flight refreshes are shared across all waiting calls (`src/shared/lib/http.ts`)
- **Strava polyline → SVG** — Strava's encoded polyline is decoded and converted to an SVG path on the client, rendering a route preview on each activity card with no server round-trip (`src/features/strava/ui/`)
- **Map state persistence** — Returning from a course detail page restores the previous map position and active course marker, using Zustand with sessionStorage

---

## Architecture

Modified Feature-Sliced Design. Each feature is self-contained with its own `api / model / hooks / ui` layers and only depends on `shared`. Pages are thin composition layers with no business logic.

```
src/
├── app/
│   ├── providers/        # AuthContext (JWT + refresh), HeaderContext
│   └── routing/          # router.tsx, ProtectedRoute
├── features/
│   ├── course/           # Discovery, filters, detail, reviews — core domain
│   ├── course-upload/    # GPX upload form and registration flow
│   ├── map/              # NaverMap component, location Zustand store
│   ├── my-course/        # My courses CRUD
│   ├── strava/           # OAuth, activity list, polyline conversion
│   └── user/             # Auth, profile, bookmarks, feedback
├── pages/                # Route-level composition only
└── shared/
    ├── lib/              # HTTP client (JWT injection, 401 handling)
    ├── ui/               # primitives (shadcn), composites, navigation
    ├── design/           # Auto-generated design tokens
    └── model/            # Shared types and constants
```

**State layers**

```
Server state   → React Query  (courses, detail, reviews, bookmarks — staleTime caching)
Client state   → Zustand      (location, map viewport, scroll, Strava preview)
Global UI      → Context API  (Auth, Header config)
```

**Routes**

```
/                      # Course discovery (map / list)
/course/:uuid          # Course detail
/course/:uuid/map      # Full route map
/course/upload         # Register a course (auth required)
/course/my             # My courses (auth required)
/course/my/:uuid/edit  # Edit my course (auth required)
/strava/activities     # Strava activity picker (auth required)
/login                 # Social login
/me                    # My page (auth required)
/me/edit               # Profile edit (auth required)
/me/delete             # Account deletion (auth required)
```

---

## Getting Started

### Prerequisites

- Node.js 20+
- Yarn (Berry)

### Environment Variables

```bash
cp .env.example .env.local
```

| Variable | Description |
|---|---|
| `VITE_SERVER_DOMAIN` | Backend REST API base URL |
| `VITE_NAVER_MAP_CLIENT_ID` | Naver Maps Client ID |
| `VITE_KAKAO_CLIENT_ID` | Kakao OAuth Client ID |
| `VITE_NAVER_CLIENT_ID` | Naver OAuth Client ID |
| `VITE_STRAVA_CLIENT_ID` | Strava OAuth Client ID |
| `VITE_STRAVA_REDIRECT_URI` | Strava OAuth Redirect URI |

### Install & Run

```bash
yarn install
yarn dev          # Development server
yarn build        # Production build
yarn lint:fix     # Auto-fix lint issues
yarn tokens:all   # Regenerate design tokens
```

### Project Commands

```bash
yarn dev:tokens     # Generate tokens then start dev server
yarn test           # Unit tests (Vitest)
yarn test:coverage  # Coverage report
yarn format         # Prettier
```

</details>

---

## Stack

React 19 · TypeScript 5.8 · Vite 7 · Tailwind CSS 4 · shadcn/ui · TanStack React Query 5 · Zustand 5 · React Router 7 · Naver Maps · Strava OAuth · Recharts · gpxparser
