# Runddy Client

Runddy Client is a mobile-first React application for discovering, reviewing,
bookmarking, and uploading running courses in Korea. It uses Naver Maps for map
and geocoding features, OAuth login for Kakao/Naver, and Strava integration for
activity imports.

## Stack

- React 19, TypeScript 5.8, Vite 7
- Tailwind CSS 4 with generated design tokens
- React Router 7
- TanStack React Query 5 for server state
- Zustand for persisted client UI/map state
- Radix/shadcn-style primitives and custom Runddy icons
- Vitest and Testing Library

## Getting Started

```bash
yarn install
yarn dev
```

Set `DEV_SERVER_PORT` in a local `.env` file when the Naver Maps client settings
require a specific local app URL. Environment files are ignored by git.

The app expects the usual Vite environment variables, including:

```bash
VITE_SERVER_DOMAIN=
VITE_CLIENT_URL=
VITE_NAVER_MAP_CLIENT_ID=
VITE_GA_MEASUREMENT_ID=
DEV_SERVER_PORT=
```

## Scripts

```bash
yarn dev              # Start Vite dev server
yarn build            # Type-check and production build
yarn preview          # Preview production build
yarn lint             # Run ESLint
yarn lint:fix         # Auto-fix lint issues where possible
yarn format           # Run Prettier
yarn test             # Run Vitest
yarn test:coverage    # Run Vitest with coverage
yarn tokens:all       # Regenerate design token outputs
```

## Project Shape

```text
src/
  app/        application shell, providers, routing
  features/   domain features such as course, map, user, strava
  pages/      route-level composition
  shared/     reusable UI, hooks, libs, icons, design tokens
```

Use the `@/` path alias for internal imports. Feature code should stay inside
its feature slice unless it is intentionally shared.

## Quality Gates

Before opening a PR, run:

```bash
yarn lint
yarn test --run
yarn build
```

Design token output files under `src/shared/design/tokens/` are generated. Edit
the token scripts or source token data, then run `yarn tokens:all`.
