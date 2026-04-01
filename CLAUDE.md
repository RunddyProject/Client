# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
yarn dev              # Start dev server
yarn build            # tsc + vite build (runs token generation first)
yarn lint             # ESLint
yarn lint:fix         # Auto-fix ESLint issues
yarn format           # Prettier
yarn tokens:all       # Regenerate all design tokens (CSS vars, typography, shadcn theme)
```

If design token scripts in `scripts/tokens/` are modified, run `yarn tokens:all` and commit both source and generated files together.

## Architecture

Feature-Sliced Design (FSD) with four layers:

```
src/
├── app/          # Providers, routing, global setup
├── features/     # Business logic modules
├── pages/        # Route-level composition components
└── shared/       # Reusable UI, utilities, hooks, types
```

**Features:** `course`, `course-upload`, `map`, `my-course`, `strava`, `user`

Each feature follows: `api/` → `model/` → `hooks/` → `lib/` → `ui/` (and rarely `context/`)

**Path aliases** (always use these, never relative imports across layers):
```
@/app/*      → src/app/*
@/shared/*   → src/shared/*
@/features/* → src/features/*
@/pages/*    → src/pages/*
```

## Routing

`src/app/routing/router.tsx` uses React Router v7 `createBrowserRouter`. Protected routes use `<ProtectedRoute requireAuth={true}>`.

Each route can define a `handle.header` object to configure the page header declaratively:
```typescript
handle: {
  header: { title: 'Page Title', showBackButton: true, showMenu: false }
}
```
Dynamic header config is also possible via `useHeader()` context hook.

## HTTP Client

`@/shared/lib/http` wraps `fetch` with:
- Automatic Bearer token injection via `authService.getToken()`
- Automatic token refresh on 401 (with deduplication for concurrent requests)
- Base URL from `VITE_SERVER_DOMAIN` environment variable

Methods: `api.get`, `api.post`, `api.put`, `api.patch`, `api.delete`, `api.postForm`, `api.getBlob`, `api.download`

## State Management

Three layers — don't mix them:

| Layer | Tool | Use for |
|-------|------|---------|
| Server state | React Query | API data, caching |
| Global UI state | Zustand | Map viewport, user location (persisted to sessionStorage) |
| Auth / Header config | React Context | `useAuth()`, `useHeader()` |

React Query standards: always set `staleTime` and `gcTime`; use `enabled: !!dep` for conditional queries; `placeholderData: keepPreviousData` for smooth transitions.

## API Layer Pattern

Singleton object pattern (named export, not class):
```typescript
export const CoursesApi = {
  getCourses: (lat: number, lng: number) => api.get<CoursesResponse>('/courses', { params: { lat, lng } }),
};
```

## Styling

**Design tokens** are auto-generated — never edit these manually:
- `src/shared/design/tokens/variables.css` — CSS custom properties
- `src/shared/design/tokens/tw-typography.ts` — typography utilities
- `src/shared/design/tokens/shadcn-theme.css` — shadcn theme

**Semantic color classes:** `text-pri`, `text-sec`, `text-ter`, `text-placeholder`, `bg-g-10`…`bg-g-100`, `text-stateError`, `bg-runddy-blue`, `text-runddy-green`

**Typography utilities** (generated): `title-b21`, `title-b18`, `contents-r15`, `contents-m15`, `caption-r13`, etc. Pattern: `{category}-{weight}{size}`

**Layout:** Mobile-first, `max-w-xl` constraint, use `h-dvh` (not `h-vh`), `safe-top` class for notch-aware headers.

## Conventions

- **Named exports only** — no default exports for components
- **Import order** enforced by ESLint: built-ins → external → `@/` aliases → type imports (each group alphabetically sorted, blank line between groups)
- **File naming:** `PascalCase.tsx` (components), `camelCase.ts` (hooks/types), `kebab-case.ts` (utilities)
- **No `any`** — use `unknown` with type narrowing
- Use `cn()` from `@/shared/lib/utils` for conditional class merging

## UI Components

- **Primitives** (`@/shared/ui/primitives/`): shadcn/ui components (Button, Dialog, Sheet, Tabs, Slider, etc.)
- **Composites** (`@/shared/ui/composites/`): project-specific compositions
- Custom SVG icons via `<Icon name='...' />` from `@/shared/icons/icon`; Lucide icons imported directly from `lucide-react`

## Environment Variables

| Variable | Purpose |
|----------|---------|
| `VITE_SERVER_DOMAIN` | API base URL |
