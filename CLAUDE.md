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

### React Query conventions

Always return a flat object — never return the raw `query` object:
```typescript
return {
  courseDetail: query.data ?? null,
  isLoading: query.isLoading,
  isFetching: query.isFetching,
  isError: query.isError,
  refetch: query.refetch,
};
```

Always set `staleTime: 60_000` and `gcTime: 5 * 60_000`; use `enabled: !!dep` for conditional queries; `placeholderData: keepPreviousData` for smooth transitions.

For mutations, always type all three generics and use `onMutate` for optimistic updates with rollback:
```typescript
const mutation = useMutation<ResponseType, ApiError, VariablesType, ContextType>({
  mutationFn: ...,
  onMutate: async (payload) => {
    await queryClient.cancelQueries({ queryKey: [...] });
    const prev = queryClient.getQueryData([...]);
    queryClient.setQueryData([...], optimisticValue);
    return { prev };
  },
  onError: (_, __, ctx) => {
    queryClient.setQueryData([...], ctx?.prev);
    toast.error('...');
  },
  onSuccess: () => toast.success('...'),
});
```

### Zustand conventions

Use `persist` with `sessionStorage` for navigation state (cleared on tab close). Use selectors for performance:
```typescript
const center = useLocationStore((state) => state.lastSearchedCenter);
```

For refs to store actions in `useEffect`, use `useRef(useLocationStore.getState().setX)` to get stable references.

## API Layer Pattern

Singleton object pattern (named export, not class):
```typescript
export const CoursesApi = {
  getCourses: (lat: number, lng: number) => api.get<CoursesResponse>('/courses', { params: { lat, lng } }),
};
```

## Component Patterns

### Container/View pattern (for complex UI)

Used when a page/section has significant business logic. The Container orchestrates hooks and spreads grouped data as flat props into a memoized View:

```typescript
// Container: all logic via hooks, no JSX logic
export function CourseMapContainer() {
  const { data, status, mapConfig, refs, handlers } = useCourseMapContainer();
  return <CourseMapView {...data} {...status} {...mapConfig} scrollerRef={refs.scrollerRef} handlers={handlers} />;
}

// View: memo + flat props, no hooks
export const CourseMapView = memo(function CourseMapView(props: CourseMapViewProps) { ... });

// Facade hook: groups return values by domain
export function useCourseMapContainer(): CourseMapContainerData {
  return { data: {...}, status: {...}, mapConfig: {...}, refs: {...}, handlers };
}
```

Group return types using interfaces (e.g. `CourseMapDataGroup`, `CourseMapStatusGroup`) and compose `ViewProps` via `extends`:
```typescript
export interface CourseMapViewProps extends CourseMapDataGroup, CourseMapStatusGroup, CourseMapConfigGroup {
  scrollerRef: RefObject<HTMLDivElement | null>;
  handlers: CourseMapHandlers;
}
```

### Form handling

**No React Hook Form or Zod.** Forms use plain `useState` with a single state object. The parent container owns state and passes it down with an `onFormDataChange` callback:
```typescript
const [formData, setFormData] = useState<CourseUploadFormData>({ name: '', isMarathon: null, ... });
// child calls: onFormDataChange({ ...formData, name: e.target.value })
```

API payloads are produced via transformer functions in `lib/` (e.g. `toPatchBodyFromDisplayForm`). UI data is hydrated from API responses via `toDisplayForm`-style transformers.

## Styling

**Design tokens** are auto-generated — never edit these manually:
- `src/shared/design/tokens/variables.css` — CSS custom properties
- `src/shared/design/tokens/tw-typography.ts` — typography utilities
- `src/shared/design/tokens/shadcn-theme.css` — shadcn theme

**Semantic color classes:** `text-pri`, `text-sec`, `text-ter`, `text-placeholder`, `bg-g-10`…`bg-g-100`, `text-stateError`, `bg-runddy-blue`, `text-runddy-green`

**Typography utilities** (generated): `title-b21`, `title-b18`, `contents-r15`, `contents-m15`, `caption-r13`, etc. Pattern: `{category}-{weight}{size}`

**Layout:** Mobile-first, `max-w-xl` constraint, use `h-dvh` (not `h-vh`), `safe-top` class for notch-aware headers.

## UI Components

- **Primitives** (`@/shared/ui/primitives/`): shadcn/ui components (Button, Dialog, Sheet, Tabs, Slider, etc.)
- **Composites** (`@/shared/ui/composites/`): project-specific compositions
- Custom SVG icons via `<Icon name='...' />` from `@/shared/icons/icon`; Lucide icons imported directly from `lucide-react`

## Auth

`authService` is a singleton class (`AuthService.getInstance()`). It stores the JWT in localStorage, decodes it locally to derive the `User` object, and handles OAuth redirects (`/oauth2/authorization/kakao|naver`). Token refresh is done via `POST /auth/access-token` (uses an HttpOnly cookie).

`useAuth()` wraps this in a React context (`AuthProvider` in `src/app/providers/`). On the `/login/success` route, `AuthProvider` skips auto-initialization to avoid a race condition with the OAuth callback.

## Map (Naver Maps)

Naver Maps loads as `window.naver.maps` (global script). Always guard with `if (!window.naver?.maps) return`. The `NaverMap` component in `features/map/ui/` is a composable wrapper — behavior is added via hooks (`useGpxPolyline`, `useMarkers`, `useFitLatLngBoundsScale`, etc.) rather than props explosion.

Map viewport state (center, zoom, active course) is persisted in the Zustand `useLocationStore`.

## Conventions

- **Named exports only** — no default exports for components
- **Import order** enforced by ESLint: built-ins → external → `@/` aliases → type imports (each group alphabetically sorted, blank line between groups)
- **File naming:** `PascalCase.tsx` (components), `camelCase.ts` (hooks/types), `kebab-case.ts` (utilities)
- **No `any`** — use `unknown` with type narrowing
- Use `cn()` from `@/shared/lib/utils` for conditional class merging
- Domain enums are string union types (e.g. `type EnvType = 'PARK' | 'TRAIL' | ...`) with accompanying `Record<EnvType, string>` label maps and safe accessor functions

## Environment Variables

| Variable | Purpose |
|----------|---------|
| `VITE_SERVER_DOMAIN` | API base URL |
