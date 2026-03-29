<div align="center">

<img src="public/logo.svg" alt="Runddy" width="72" height="72" />

# Runddy

**러닝 코스 탐색 플랫폼 · Running Course Discovery Platform**

내 주변의 다양한 러닝 코스를 쉽고 빠르게 탐색하세요.
Discover running courses around you — fast, intuitive, and built for Korean runners.

[![Production](https://img.shields.io/badge/Live-runddy.co.kr-4f86f7?style=flat-square)](https://www.runddy.co.kr)
![React](https://img.shields.io/badge/React-19-61dafb?style=flat-square&logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-5.8-3178c6?style=flat-square&logo=typescript)
![Vite](https://img.shields.io/badge/Vite-7-646cff?style=flat-square&logo=vite)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-4-06b6d4?style=flat-square&logo=tailwindcss)

</div>

---

## 한국어

- [소개](#소개)
- [주요 기능](#주요-기능)
- [화면 구성](#화면-구성)
- [기술 스택](#기술-스택)
- [아키텍처](#아키텍처)
- [시작하기](#시작하기)
- [스크립트](#스크립트)
- [디자인 토큰](#디자인-토큰)

## English

- [Overview](#overview)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Architecture](#architecture)
- [Getting Started](#getting-started)
- [Scripts](#scripts)

---

# 한국어

## 소개

**Runddy**는 한국 러너를 위한 모바일 퍼스트 코스 탐색 앱입니다. 공식 코스부터 유저가 직접 등록한 코스까지, 지도와 목록으로 빠르게 찾고 리뷰를 나눌 수 있습니다.

- Naver Maps 기반 인터랙티브 지도
- GPX 직접 업로드 + Strava 연동으로 코스 등록
- 키워드 기반 리뷰 시스템 (코스톡)
- Kakao · Naver 소셜 로그인

---

## 주요 기능

### 코스 탐색

| 기능 | 설명 |
|---|---|
| 지도 / 목록 뷰 | Naver Maps 기반 마커 지도와 카드 리스트 전환 |
| 코스 유형 | 공식 코스 · 런디 코스 · 마라톤 코스 |
| 현위치 탐색 | GPS 위치 기반 자동 탐색, 지역명·코스명 키워드 검색 |
| 상세 필터 | 난도(초급/중급/고급), 환경(공원/산책로/트랙/도심/해변/산/숲/강), 코스 모양(순환/직선/왕복/아트), 거리(0–40km+), 고도(0–400m+) |
| 코스 상세 | 경로 지도, 고도 프로파일 차트, 거리·고도·주소 정보, GPX 다운로드, 코스 공유 |

### 코스 등록

| 기능 | 설명 |
|---|---|
| GPX 업로드 | 기기 로컬 파일에서 GPX를 불러와 코스 정보 입력 후 등록 |
| Strava 연동 | Strava OAuth로 활동 목록을 불러와 코스로 등록 (이름 자동 완성) |
| 공개/비공개 | 코스 등록 및 수정 시 공개 여부 토글 |
| 코스 수정·삭제 | 내 코스 상세에서 이름·공개 여부 수정, 삭제 확인 다이얼로그 |

### 리뷰 (코스톡)

키워드 기반 구조화 리뷰 시스템. 코스 컨디션·환경·편의시설 세 카테고리로 빠르게 평가합니다.

```
코스 컨디션  → 오르막 훈련 좋음 · 노면 양호 · 초보 친화 · 인기 코스 ...
환경        → 경치 좋음 · 석양 뷰 · 조용함 · 그늘 · 야간 조명 ...
편의시설    → 화장실 있음 · 음수대 있음 · 주차 편함 · 접근성 좋음 ...
```

### 마이페이지

| 기능 | 설명 |
|---|---|
| 저장한 코스 | 북마크 코스 목록 |
| 내가 남긴 코스 | 내 코스톡 리뷰 목록 |
| 프로필 수정 | 닉네임·프로필 사진 변경 |
| 로그아웃 · 회원탈퇴 | 탈퇴 전 이유 수집 다이얼로그 |

---

## 화면 구성

```
/                      → 코스 탐색 (지도/목록)
/course/:uuid          → 코스 상세
/course/:uuid/map      → 경로 상세 지도
/course/upload         → 코스 등록하기 (로그인 필요)
/course/my             → 내 코스 (로그인 필요)
/course/my/:uuid/edit  → 내 코스 수정 (로그인 필요)
/strava/activities     → Strava 활동 목록 (로그인 필요)
/login                 → 카카오 · 네이버 로그인
/me                    → 마이페이지 (로그인 필요)
/me/edit               → 프로필 수정 (로그인 필요)
/me/delete             → 회원탈퇴 (로그인 필요)
```

---

## 기술 스택

### 코어

| | 버전 |
|---|---|
| React | 19.1 |
| TypeScript | 5.8 |
| Vite | 7 |

### UI / 스타일

| | 버전 | 용도 |
|---|---|---|
| Tailwind CSS | 4 | 유틸리티 CSS |
| shadcn/ui (Radix UI) | latest | 접근성 컴포넌트 |
| Lucide React | 0.543 | 아이콘 |
| Recharts | — | 고도 프로파일 차트 |

### 상태 / 데이터

| | 버전 | 용도 |
|---|---|---|
| TanStack React Query | 5 | 서버 상태 캐싱 |
| Zustand | 5 | 클라이언트 상태 (위치, 지도, Strava) |
| React Router | 7 | 클라이언트 라우팅 |
| React Hook Form | 7 | 폼 관리 |

### 외부 연동

| | 용도 |
|---|---|
| Naver Maps API | 지도 렌더링 · 지오코딩 |
| Kakao / Naver OAuth | 소셜 로그인 |
| Strava OAuth | GPX 활동 데이터 가져오기 |
| gpxparser | GPX 파일 파싱 |

---

## 아키텍처

Feature-Sliced Design(FSD) 변형 구조를 사용합니다.

```
src/
├── app/
│   ├── providers/          # AuthContext, HeaderContext
│   └── routing/            # router.tsx, ProtectedRoute
├── features/
│   ├── course/             # 코스 조회·검색·필터·상세·리뷰
│   ├── course-upload/      # GPX 업로드 & 코스 등록 폼
│   ├── map/                # Naver Maps 통합, 위치 Zustand store
│   ├── my-course/          # 내 코스 CRUD
│   ├── strava/             # Strava OAuth & 활동 목록
│   └── user/               # 인증, 프로필, 북마크, 피드백
├── pages/                  # 라우트별 페이지 컴포지션
└── shared/
    ├── ui/
    │   ├── primitives/     # shadcn/ui 컴포넌트
    │   ├── composites/     # LoadingSpinner, InputClearable 등
    │   ├── navigations/    # Header, Menu
    │   └── actions/        # ShareButton, Feedback
    ├── lib/                # HTTP 클라이언트, 유틸리티
    ├── hooks/              # 공유 훅
    ├── model/              # 공유 타입·상수
    ├── icons/              # SVG 아이콘 시스템
    └── design/             # 디자인 토큰 (자동 생성)
```

### 상태 관리 레이어

```
서버 상태     →  TanStack React Query  (코스 목록, 상세, 리뷰, 북마크)
클라이언트 상태 →  Zustand             (위치, 지도 뷰포트, Strava 미리보기)
전역 UI 상태  →  Context API          (Auth, Header 설정)
```

### Path Aliases

```ts
@/app/*       → src/app/*
@/features/*  → src/features/*
@/pages/*     → src/pages/*
@/shared/*    → src/shared/*
```

---

## 시작하기

### 사전 요구사항

- Node.js 20+
- Yarn (Berry)

### 환경 변수 설정

```bash
cp .env.example .env.local
```

| 변수 | 설명 |
|---|---|
| `VITE_API_BASE_URL` | 백엔드 REST API Base URL |
| `VITE_NAVER_MAP_CLIENT_ID` | Naver Maps Client ID |
| `VITE_KAKAO_CLIENT_ID` | Kakao OAuth Client ID |
| `VITE_NAVER_CLIENT_ID` | Naver OAuth Client ID |
| `VITE_STRAVA_CLIENT_ID` | Strava OAuth Client ID |
| `VITE_STRAVA_REDIRECT_URI` | Strava OAuth Redirect URI |

### 설치 및 실행

```bash
yarn install

# 개발 서버 (디자인 토큰 생성 포함)
yarn dev:tokens

# 또는 빠르게
yarn dev
```

---

## 스크립트

```bash
yarn dev            # 개발 서버
yarn dev:tokens     # 토큰 생성 후 개발 서버
yarn build          # 프로덕션 빌드 (토큰 생성 포함)
yarn lint           # ESLint 검사
yarn lint:fix       # 자동 수정
yarn format         # Prettier 포맷
yarn tokens:all     # 디자인 토큰 전체 재생성
yarn test           # 유닛 테스트
yarn test:coverage  # 커버리지 리포트
```

---

## 디자인 토큰

컬러·타이포그래피·shadcn 테마는 `scripts/tokens/`에서 자동 생성됩니다.

```bash
yarn tokens:all
# → src/shared/design/tokens/variables.css   (CSS 변수)
# → src/shared/design/tokens/tw-typography.ts (타이포그래피 유틸리티)
# → src/shared/design/tokens/shadcn-theme.css (shadcn 테마)
```

> `src/shared/design/tokens/` 하위 파일은 직접 수정하지 마세요. 소스 스크립트를 수정 후 `yarn tokens:all`을 실행하세요.

CI가 `main` 푸시 시 토큰을 자동 재생성하고 커밋합니다.

---

---

# English

## Overview

**Runddy** is a mobile-first running course discovery app for Korean runners. Find official courses, community-submitted routes, and marathon courses — on an interactive map or a scrollable list — then leave keyword reviews and export GPX files.

- Naver Maps integration for real-time course exploration
- GPX upload + Strava OAuth for course registration
- Structured keyword review system ("Course Talk")
- Kakao & Naver social authentication

---

## Features

### Course Discovery

| Feature | Description |
|---|---|
| Map / List view | Toggle between Naver Maps marker view and card list |
| Course types | Official · Runddy (user-submitted) · Marathon |
| Location search | GPS-based auto-discovery + keyword geocoding fallback |
| Advanced filters | Grade (beginner/intermediate/advanced), environment (park/trail/track/urban/beach/mountain/forest/river), shape (loop/linear/out-and-back/art), distance (0–40km+), elevation gain (0–400m+) |
| Course detail | Route preview map, elevation profile chart, distance & elevation stats, start/end address, GPX download, share button |

### Course Registration

| Feature | Description |
|---|---|
| GPX upload | Parse a local GPX file, fill in course metadata, and submit |
| Strava import | OAuth connect → select an activity → auto-populate name and route |
| Visibility toggle | Set course as public or private on create and edit |
| Edit / Delete | Update name or visibility, delete with confirmation dialog |

### Reviews (Course Talk)

Structured keyword review system across three categories:

```
Course Condition  → Uphill training · Good surface · Beginner friendly · Popular ...
Environment       → Scenic · Sunset view · Quiet · Shaded · Well lit at night ...
Facilities        → Has restroom · Has water · Easy parking · Accessible ...
```

### My Page

| Feature | Description |
|---|---|
| Saved courses | Bookmarked course list |
| My reviews | Courses I've reviewed |
| Profile edit | Update nickname and profile photo |
| Logout / Delete account | Reason survey before account deletion |

---

## Tech Stack

### Core

| | Version |
|---|---|
| React | 19.1 |
| TypeScript | 5.8 |
| Vite | 7 |

### UI / Styling

| | Version | Purpose |
|---|---|---|
| Tailwind CSS | 4 | Utility-first CSS |
| shadcn/ui (Radix UI) | latest | Accessible component primitives |
| Lucide React | 0.543 | Icons |
| Recharts | — | Elevation profile chart |

### State / Data

| | Version | Purpose |
|---|---|---|
| TanStack React Query | 5 | Server-state caching |
| Zustand | 5 | Client state (location, map viewport, Strava preview) |
| React Router | 7 | Client-side routing |
| React Hook Form | 7 | Form management |

### External Integrations

| | Purpose |
|---|---|
| Naver Maps API | Map rendering & geocoding |
| Kakao / Naver OAuth | Social login |
| Strava OAuth | Import GPX activity data |
| gpxparser | GPX file parsing |

---

## Architecture

Modified Feature-Sliced Design (FSD).

```
src/
├── app/
│   ├── providers/          # AuthContext, HeaderContext
│   └── routing/            # router.tsx, ProtectedRoute
├── features/
│   ├── course/             # Discovery, search, filters, detail, reviews
│   ├── course-upload/      # GPX upload flow & registration form
│   ├── map/                # Naver Maps, location Zustand store
│   ├── my-course/          # My courses CRUD
│   ├── strava/             # Strava OAuth & activity list
│   └── user/               # Auth, profile, bookmarks, feedback
├── pages/                  # Route-level page composition
└── shared/
    ├── ui/
    │   ├── primitives/     # shadcn/ui components
    │   ├── composites/     # LoadingSpinner, InputClearable, etc.
    │   ├── navigations/    # Header, Menu
    │   └── actions/        # ShareButton, Feedback
    ├── lib/                # HTTP client, utilities
    ├── hooks/              # Shared hooks
    ├── model/              # Shared types & constants
    ├── icons/              # SVG icon system
    └── design/             # Auto-generated design tokens
```

### State Management

```
Server state    →  TanStack React Query  (courses, detail, reviews, bookmarks)
Client state    →  Zustand              (location, map viewport, Strava preview)
Global UI       →  Context API          (Auth, Header config)
```

### Route Map

```
/                      → Course discovery (map/list)
/course/:uuid          → Course detail
/course/:uuid/map      → Full route map
/course/upload         → Register a course (auth required)
/course/my             → My courses (auth required)
/course/my/:uuid/edit  → Edit my course (auth required)
/strava/activities     → Strava activity picker (auth required)
/login                 → Kakao · Naver login
/me                    → My page (auth required)
/me/edit               → Profile edit (auth required)
/me/delete             → Account deletion (auth required)
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
| `VITE_API_BASE_URL` | Backend REST API base URL |
| `VITE_NAVER_MAP_CLIENT_ID` | Naver Maps Client ID |
| `VITE_KAKAO_CLIENT_ID` | Kakao OAuth Client ID |
| `VITE_NAVER_CLIENT_ID` | Naver OAuth Client ID |
| `VITE_STRAVA_CLIENT_ID` | Strava OAuth Client ID |
| `VITE_STRAVA_REDIRECT_URI` | Strava OAuth Redirect URI |

### Install & Run

```bash
yarn install

# Start dev server with design token generation
yarn dev:tokens

# Or start quickly without token generation
yarn dev
```

---

## Scripts

```bash
yarn dev            # Development server
yarn dev:tokens     # Generate tokens then start dev server
yarn build          # Production build (includes token generation)
yarn lint           # ESLint check
yarn lint:fix       # Auto-fix lint issues
yarn format         # Prettier format
yarn tokens:all     # Regenerate all design tokens
yarn test           # Unit tests
yarn test:coverage  # Coverage report
```

---

## CI/CD

GitHub Actions (`.github/workflows/tokens-ci.yml`) runs on push to `main` and on pull requests:

1. Install dependencies (`yarn install --immutable`)
2. Regenerate design tokens (`yarn tokens:all`)
3. Auto-commit any token changes
4. Production build (`yarn build`)

---

## License

Private — All rights reserved. © Runddy
