# Runddy Client

한국의 러닝 코스를 발견하고, 탐색하고, 리뷰할 수 있는 모바일 퍼스트 웹 애플리케이션입니다.

## Tech Stack

| Category | Technologies |
|----------|-------------|
| **Framework** | React 19, TypeScript 5.8, Vite 7 |
| **Styling** | Tailwind CSS 4, shadcn/ui (Radix UI) |
| **State** | TanStack Query 5, Zustand 5 |
| **Routing** | React Router 7 |
| **Maps** | Naver Maps API |
| **Forms** | React Hook Form |

## Features

- Interactive map/list views for course discovery
- Advanced filtering (grade, environment, shape, distance, elevation)
- Geolocation-based search with geocoding fallback
- Course reviews with structured keyword system
- Bookmarking and user profile management
- GPX file export
- OAuth authentication (Kakao, Naver)

## Getting Started

### Prerequisites

- Node.js 20+
- Yarn (Classic)
- Naver Maps API Key

### Installation

```bash
# Clone repository
git clone https://github.com/RunddyProject/Client.git
cd Client

# Install dependencies
yarn install
```

### Environment Variables

Create `.env.local` in the project root:

```env
VITE_API_BASE_URL=<api-server-url>
VITE_NAVER_MAP_CLIENT_ID=<naver-maps-client-id>
```

### Development

```bash
# Start dev server
yarn dev

# Start with token generation
yarn dev:tokens
```

Open [http://localhost:5173](http://localhost:5173)

## Scripts

| Command | Description |
|---------|-------------|
| `yarn dev` | Start development server |
| `yarn build` | Production build |
| `yarn preview` | Preview production build |
| `yarn lint` | Run ESLint |
| `yarn lint:fix` | Auto-fix linting issues |
| `yarn format` | Format with Prettier |
| `yarn tokens:all` | Generate design tokens |

## Project Structure

```
src/
├── app/                    # App initialization
│   ├── providers/          # Context providers (Auth, Header)
│   └── routing/            # Route definitions
├── features/               # Feature modules
│   ├── course/             # Course management
│   │   ├── api/            # API calls
│   │   ├── hooks/          # React Query hooks
│   │   ├── model/          # Types, constants
│   │   ├── lib/            # Utilities
│   │   └── ui/             # Components
│   ├── map/                # Naver Maps integration
│   └── user/               # User & authentication
├── pages/                  # Page components
├── shared/                 # Shared resources
│   ├── ui/                 # UI components (primitives, composites)
│   ├── hooks/              # Shared hooks
│   ├── lib/                # Utilities (http client, utils)
│   ├── icons/              # SVG icons
│   └── design/             # Design tokens
└── main.tsx
```

### Path Aliases

```typescript
@/         → src/
@/app      → src/app
@/features → src/features
@/pages    → src/pages
@/shared   → src/shared
```

## Architecture

**Feature-Sliced Design (FSD)** 아키텍처를 따릅니다.

- **Layers**: app → pages → features → shared
- **Features**: 각 기능 모듈은 자체 api, hooks, model, ui 구조를 가짐
- **Shared**: 재사용 가능한 UI 컴포넌트, 유틸리티, 훅

### State Management

| Type | Library | Usage |
|------|---------|-------|
| Server State | TanStack Query | API data caching |
| Client State | Zustand | Location, map viewport |
| UI State | React Context | Auth, header config |

## Design System

디자인 토큰은 `scripts/tokens/`에서 자동 생성됩니다.

```bash
# 토큰 재생성
yarn tokens:all
```

### Typography

```tsx
<h1 className="title-b21">Title Bold 21px</h1>
<p className="contents-r15">Contents Regular 15px</p>
<span className="caption-m12">Caption Medium 12px</span>
```

### Colors

```tsx
<div className="bg-g-10 text-g-100">    {/* Grayscale */}
<p className="text-pri">                 {/* Primary text */}
<div className="bg-runddy-blue">         {/* Brand color */}
```

## Code Quality

```bash
# Lint check
yarn lint

# Auto-fix + format
yarn lint:fix && yarn format

# Build verification
yarn build
```

### Import Order (ESLint)

```typescript
// 1. React
import { useState } from 'react';

// 2. External
import { useQuery } from '@tanstack/react-query';

// 3. Internal (path aliases)
import { useCourses } from '@/features/course/hooks/useCourses';

// 4. Types
import type { Course } from '@/features/course/model/types';
```

## Contributing

1. Feature branch에서 작업: `feature/description`
2. Conventional Commits 사용: `feat:`, `fix:`, `refactor:`, `docs:`
3. PR 생성 전 lint/build 확인

## License

Private - All rights reserved
