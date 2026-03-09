# Runddy Client

> 내 주변의 다양한 러닝 코스를 쉽고 빠르게 탐색해요

한국 러너를 위한 코스 탐색 플랫폼. 공식 러닝 코스와 사용자 등록 코스를 지도/목록으로 탐색하고, 리뷰를 남기고, GPX 파일로 내보낼 수 있습니다.

[![Production](https://img.shields.io/badge/production-runddy.co.kr-blue)](https://www.runddy.co.kr)
![React](https://img.shields.io/badge/React-19-61dafb?logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-5.8-3178c6?logo=typescript)
![Vite](https://img.shields.io/badge/Vite-7-646cff?logo=vite)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-4-06b6d4?logo=tailwindcss)

---

## Features

### 코스 탐색

- **지도 보기 / 목록 보기** — Naver Maps 기반 인터랙티브 지도와 카드 리스트 전환
- **고급 필터링** — 난도, 코스 모양, 거리(0~40km+), 고도(0~400m+), 환경(트레일/로드/트랙/뉴트)
- **실시간 검색** — 지역명·코스명 키워드 검색, 현재 위치 기반 자동 탐색
- **공식 코스 / 런디 코스** — 검증된 공식 코스 + 유저 등록 런디 코스, 마라톤 코스 구분
- **코스 상세** — 경로 미리보기 지도, 거리·고도 정보, 고도 프로파일 차트, GPX 다운로드

### 코스 등록

- **GPX 직접 업로드** — 기기 로컬 파일에서 GPX를 업로드해 코스 등록
- **Strava 연동** — Strava OAuth로 활동 데이터를 불러와 코스로 등록 (이름 자동 입력)
- **공개/비공개 설정** — 코스 업로드 및 수정 시 공개 여부 토글

### 내 코스 관리

- **내 코스** — 등록한 코스 목록을 지도 또는 리스트 뷰로 확인
- **수정 / 삭제** — 내 코스 상세에서 이름·공개 여부 수정, 삭제 확인 다이얼로그

### 리뷰 (코스톡)

- **키워드 리뷰** — 환경·난도·느낌 등 구조화된 키워드로 빠르게 코스 평가
- **리뷰 수정 / 삭제** — 내가 남긴 리뷰 관리

### 마이페이지 & 인증

- **Kakao / Naver OAuth** — 소셜 로그인으로 즉시 시작
- **온보딩** — 앱 첫 진입 시 슬라이드형 기능 소개
- **프로필 수정** — 닉네임·프로필 사진 변경
- **탈퇴 / 로그아웃**
- **저장한 코스** — 북마크 코스 목록

---

## Tech Stack

| Category | Library | Version |
|---|---|---|
| Framework | React | 19.1 |
| Language | TypeScript | 5.8 |
| Build | Vite | 7 |
| Styling | Tailwind CSS | 4 |
| Components | shadcn/ui (Radix UI) | latest |
| Icons | Lucide React | 0.543 |
| Server State | TanStack React Query | 5 |
| Client State | Zustand | 5 |
| Routing | React Router | 7 |
| Forms | React Hook Form | 7 |
| Maps | Naver Maps API | — |
| Charts | Recharts | — |
| GPX | gpxparser | — |

---

## Architecture

Feature-Sliced Design(FSD) 변형 구조를 따릅니다.

```
src/
├── app/                  # 라우터, 전역 프로바이더 (Auth, Header)
├── features/
│   ├── course/           # 코스 조회·검색·필터·상세·리뷰
│   ├── course-upload/    # GPX 업로드 & 코스 등록
│   ├── map/              # Naver Maps 통합, 위치 상태
│   ├── my-course/        # 내 코스 CRUD
│   ├── strava/           # Strava OAuth & 활동 불러오기
│   └── user/             # 인증, 프로필, 북마크
├── pages/                # 페이지 컴포지션
└── shared/
    ├── ui/               # primitives(shadcn), composites, navigations
    ├── lib/              # HTTP client, 유틸리티
    ├── hooks/            # 공유 훅
    ├── model/            # 공유 타입·상수
    ├── icons/            # SVG 아이콘 시스템
    └── design/           # 디자인 토큰 (자동 생성)
```

### Path Aliases

```ts
@/app/*       → src/app/*
@/features/*  → src/features/*
@/pages/*     → src/pages/*
@/shared/*    → src/shared/*
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

### Install & Run

```bash
yarn install

# 개발 서버 (디자인 토큰 포함)
yarn dev:tokens

# 또는 토큰 없이 빠르게
yarn dev
```

### Build

```bash
yarn build
```

### Other Scripts

```bash
yarn lint          # ESLint 검사
yarn lint:fix      # 자동 수정
yarn format        # Prettier 포맷
yarn tokens:all    # 디자인 토큰 전체 재생성
yarn test          # Vitest 유닛 테스트
```

---

## Design Tokens

컬러·타이포그래피·shadcn 테마는 `scripts/tokens/`에서 자동 생성됩니다.

```bash
yarn tokens:all
# → src/shared/design/tokens/variables.css
# → src/shared/design/tokens/tw-typography.ts
# → src/shared/design/tokens/shadcn-theme.css
```

`src/shared/design/tokens/` 하위 파일은 **직접 수정하지 마세요**. 소스 스크립트를 수정 후 재생성하세요.

---

## CI/CD

GitHub Actions(`.github/workflows/tokens-ci.yml`)가 `main` 브랜치 푸시 및 PR 시 실행됩니다.

1. 의존성 설치 (`yarn install --immutable`)
2. 디자인 토큰 생성 (`yarn tokens:all`)
3. 변경사항 자동 커밋
4. 프로덕션 빌드 (`yarn build`)

---

## Contributing

브랜치 전략은 `claude/<feature>-<session-id>` 패턴을 따르며, 커밋 메시지는 [Conventional Commits](https://www.conventionalcommits.org/)를 사용합니다.

```
feat: 코스 필터 고도 슬라이더 추가
fix: 모바일 지도 렌더링 이슈 해결
chore(tokens): 컬러 팔레트 업데이트
```

---

## License

Private — All rights reserved. © Runddy
