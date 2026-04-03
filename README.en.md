# Runddy — Running Course Discovery Platform

**[한국어 README →](./README.md)**

---

## The Problem

Finding a good running route in Korea is surprisingly hard.

Strava is built for a global audience — its geocoding and POI data don't reflect the terrain that Korean runners actually care about: riverside paths, urban parks, mountain trails. Running club members share routes by screenshotting Kakao Maps and posting images in group chats. There's no way to filter courses by surface type, difficulty, or shape, and no persistent record of what routes actually feel like to run.

Runddy is a **Naver Maps-based platform for discovering, uploading, and reviewing running courses in Korea**. Runners can explore nearby courses on a map, upload routes via GPX or import directly from Strava, and leave keyword-based reviews for the community.

---

## Demo & Screenshots

> **[🔗 Live Demo](https://runddy.com)** <!-- Replace with deployment URL -->

| Course Map View | Course Detail | Upload Flow |
|:---:|:---:|:---:|
| ![Map view](./public/screenshots/map.png) | ![Detail view](./public/screenshots/detail.png) | ![Upload view](./public/screenshots/upload.png) |

<!-- Remove table if screenshots aren't available yet -->

---

## Features

- **Map & list view** — Explore courses as pins on a Naver Map, or filter a list by difficulty, terrain type, course shape, and distance
- **Elevation profile** — GPX-derived altitude chart rendered with Recharts
- **GPX upload & Strava import** — Upload a file directly or connect Strava via OAuth to import activities as courses
- **Community reviews** — Keyword tag-based reviews ("scenic", "beginner-friendly", "shaded", etc.)
- **Bookmarks** — Save and manage favorite courses
- **Social login** — Kakao and Naver OAuth 2.0 (standard auth providers in Korea)

---

## Tech Stack & Rationale

| Tech | Why |
|------|-----|
| **React 19 + Vite 7** | React 19 concurrent features, Vite's fast HMR for development velocity |
| **Naver Maps** | Significantly more accurate Korean address geocoding than Google Maps. Korean POIs (riverside paths, neighborhood parks) are well-maintained. Most Korean map apps run on Naver or Kakao infra |
| **TanStack React Query v5** | The app is read-heavy (course lists, reviews, profiles). React Query's caching, deduplication, and `staleTime` tuning eliminated most redundant network requests without the boilerplate of Redux |
| **Zustand + sessionStorage** | Map viewport state (center, zoom, scroll position) needs to survive client-side navigation but should reset when the tab closes. sessionStorage persist is the right scope — not localStorage |
| **Feature-Sliced Design** | 6 distinct domains with separate APIs, models, and UI. Accepted the upfront architecture cost in exchange for enforced one-way dependencies and clear ownership boundaries |
| **Tailwind CSS v4 + Style Dictionary** | Design tokens defined once, auto-generated into CSS custom properties, Tailwind utilities, and a shadcn theme. Structural consistency between design and code |
| **No React Hook Form / Zod** | The app has 3 forms with straightforward validation requirements. Adding a 15KB form library would be over-engineering; plain `useState` is sufficient |

---

## Engineering Decisions Worth Noting

### Preventing duplicate token refresh on concurrent 401s

When multiple API requests fire simultaneously and all receive 401, each handler would independently attempt a token refresh — exhausting a single-use refresh token before any of them succeed.

```typescript
// http.ts — a module-level Promise deduplicates concurrent refresh attempts
let refreshTokenPromise: Promise<string | null> | null = null;

if (!refreshTokenPromise) {
  refreshTokenPromise = authService.getAccessToken().finally(() => {
    refreshTokenPromise = null;
  });
}
const newToken = await refreshTokenPromise; // subsequent 401s await the same Promise
```

The first 401 handler creates the refresh Promise. All subsequent handlers await the same one. After resolution, the original requests are retried automatically.

### OAuth callback race condition

`AuthProvider` calls `refreshAuth()` on mount. On the `/login/success` OAuth callback route, this would race against the route component's token exchange — both trying to consume the same single-use refresh token.

```typescript
useEffect(() => {
  if (window.location.pathname === '/login/success') {
    setIsLoading(false);
    return; // skip auto-init — LoginSuccess handles token exchange exclusively
  }
  refreshAuth();
}, []);
```

Checking the pathname before auto-init ensures sequential execution without introducing a timing dependency.

### Optimistic bookmark toggle across 5 query caches

A bookmark state change affects multiple cached locations: the bookmarks list, course detail, and several course list queries (each filter combination is separately cached). The mutation snapshots all five before updating them, then rolls back on error.

```typescript
onMutate: async (payload) => {
  await queryClient.cancelQueries({ queryKey: ['bookmarks'] });
  
  const prevBookmarks = queryClient.getQueryData(['bookmarks']);
  const prevCoursesSnapshots = queryClient.getQueriesData({ queryKey: ['courses'] });
  // ... apply optimistic updates to all locations
  return { prevBookmarks, prevCoursesSnapshots };
},
onError: (_, __, ctx) => {
  queryClient.setQueryData(['bookmarks'], ctx?.prevBookmarks);
  ctx?.prevCoursesSnapshots.forEach(([key, data]) => queryClient.setQueryData(key, data));
},
```

### Virtual scrolling with scroll position recovery

Course lists can grow large; TanStack Virtual renders only visible items. When returning from a course detail page, the previous scroll position is restored from sessionStorage so the user lands back exactly where they were.

---

## Architecture

**Feature-Sliced Design** — enforced one-way dependency (`app → features → shared`)

```
src/
├── app/            # Router, global providers (Auth, QueryClient)
├── features/
│   ├── course/     # Discovery, detail, reviews (api / model / hooks / lib / ui)
│   ├── course-upload/  # GPX upload and course registration
│   ├── map/        # Naver Maps wrapper, location Zustand store
│   ├── my-course/  # Manage user's own courses
│   ├── strava/     # Strava OAuth integration
│   └── user/       # Auth, profile, bookmarks
├── pages/          # Route-level composition (no business logic)
└── shared/         # HTTP client, design tokens, UI primitives
```

Within each feature: `api → model → hooks → lib → ui` — dependencies flow in one direction only.

---

## Getting Started

### Prerequisites

- Node.js 20+, Yarn 1.x
- A running backend server (local or staging)

### Setup

```bash
git clone https://github.com/RunddyProject/Client.git
cd Client

cp .env.example .env.local
# Fill in VITE_SERVER_DOMAIN and VITE_CLIENT_URL

yarn install
yarn dev
```

### Environment Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `VITE_SERVER_DOMAIN` | API server domain (no trailing slash) | `https://api.runddy.com` |
| `VITE_CLIENT_URL` | Client domain used as OAuth redirect URI | `https://runddy.com` |

> Naver Maps API key is managed server-side; no client configuration required.

### Scripts

```bash
yarn dev           # Dev server with HMR
yarn build         # Type check + production build
yarn lint:fix      # Auto-fix ESLint issues
yarn tokens:all    # Regenerate design tokens (required after editing scripts/tokens/)
```

---

## Deployment

Deployed on Vercel. The `vercel.json` configures SPA routing fallback so deep links work correctly.

```bash
vercel --prod
```

Set `VITE_SERVER_DOMAIN` and `VITE_CLIENT_URL` in the Vercel project environment variables.
