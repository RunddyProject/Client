# CLAUDE.md - AI Assistant Guide for Runddy Client

> **Last Updated**: 2026-01-24
> **Project**: Runddy Client - Running Course Discovery Platform
> **Version**: 0.0.0 (Private)

This document provides comprehensive guidance for AI assistants working on the Runddy Client codebase. It explains the architecture, conventions, workflows, and best practices to follow when making changes.

---

## Table of Contents

1. [Project Overview](#project-overview)
2. [Technology Stack](#technology-stack)
3. [Architecture & Structure](#architecture--structure)
4. [Development Workflows](#development-workflows)
5. [Coding Conventions](#coding-conventions)
6. [State Management Patterns](#state-management-patterns)
7. [API & Data Fetching](#api--data-fetching)
8. [Component Patterns](#component-patterns)
9. [Styling Guidelines](#styling-guidelines)
10. [TypeScript Conventions](#typescript-conventions)
11. [Testing Approach](#testing-approach)
12. [Git & CI/CD](#git--cicd)
13. [Common Tasks](#common-tasks)
14. [Important Constraints](#important-constraints)

---

## Project Overview

**Runddy Client** is a mobile-first React application for discovering, reviewing, and exploring running courses in Korea. The app integrates with Naver Maps and provides advanced filtering, bookmarking, and social authentication features.

### Key Features
- 🗺️ Interactive map and list views for course discovery
- 🔍 Advanced filtering (grade, environment, shape, distance, elevation)
- 📍 Geolocation-based search with keyword geocoding fallback
- ⭐ Course reviews with structured keyword system
- 🔖 Bookmarking and user profile management
- 📊 Course statistics and elevation profiles
- 📥 GPX file export for routes
- 🔐 OAuth authentication (Kakao, Naver)

### Project Characteristics
- **Mobile-First**: Designed primarily for mobile devices (max-width: `xl`)
- **Korean Market**: Uses Korean fonts (Pretendard), Naver Maps, and Korean OAuth providers
- **Design System**: Custom design tokens with auto-generation from scripts
- **Modern Stack**: React 19, TypeScript 5.8, Vite 7, Tailwind CSS 4

---

## Technology Stack

### Core Framework
| Technology | Version | Purpose |
|------------|---------|---------|
| React | 19.1.1 | UI framework |
| TypeScript | 5.8.3 | Type safety |
| Vite | 7.1.2 | Build tool & dev server |

### UI & Styling
| Technology | Version | Purpose |
|------------|---------|---------|
| Tailwind CSS | 4.1.12 | Utility-first CSS framework |
| shadcn/ui | Latest | Accessible component library (Radix UI) |
| Lucide React | 0.543.0 | Icon library |
| Custom SVG Icons | - | Brand-specific icons |

### State & Data Management
| Technology | Version | Purpose |
|------------|---------|---------|
| TanStack React Query | 5.85.6 | Server state management |
| Zustand | 5.0.8 | Client state (location, map) |
| React Context | Built-in | Auth & Header state |

### Routing & Forms
| Technology | Version | Purpose |
|------------|---------|---------|
| React Router | 7.9.1 | Client-side routing |
| React Hook Form | 7.62.0 | Form handling |

### Maps & Data
| Technology | Purpose |
|------------|---------|
| Naver Maps API | Map rendering & geocoding |
| GPX Parser | GPX file parsing |
| Recharts | Data visualization |

### Development Tools
| Tool | Purpose |
|------|---------|
| ESLint 9 | Linting with import ordering |
| Prettier | Code formatting |
| Style Dictionary | Design token generation |
| tsx | TypeScript execution for scripts |

---

## Architecture & Structure

### Feature-Sliced Design (FSD)

The project follows a modified **Feature-Sliced Design** architecture:

```
src/
├── app/                      # Application initialization layer
│   ├── routing/              # Route definitions, protection
│   └── providers/            # Global context providers
├── features/                 # Feature modules (business logic)
│   ├── course/               # Course management
│   ├── map/                  # Map integration
│   └── user/                 # User & authentication
├── pages/                    # Page components (composition)
├── shared/                   # Shared resources
│   ├── ui/                   # Reusable UI components
│   ├── lib/                  # Utilities & helpers
│   ├── hooks/                # Shared hooks
│   ├── model/                # Shared types & constants
│   ├── icons/                # Icon system
│   ├── design/               # Design tokens
│   └── assets/               # Static assets
└── main.tsx                  # Application entry point
```

### Feature Module Structure

Each feature follows this internal structure:

```
features/[feature-name]/
├── api/          # API calls and endpoints
├── model/        # Types, interfaces, constants
├── hooks/        # React Query hooks, custom hooks
├── lib/          # Feature-specific utilities
├── ui/           # Feature-specific components
└── context/      # Feature-specific context (rare)
```

### Path Aliases

Configured in `tsconfig.json` and `vite.config.ts`:

```typescript
@/app/*      → src/app/*
@/shared/*   → src/shared/*
@/features/* → src/features/*
@/pages/*    → src/pages/*
```

**Always use path aliases** instead of relative imports for better maintainability.

---

## Development Workflows

### Scripts

```bash
# Development
yarn dev              # Start dev server with HMR
yarn dev:tokens       # Generate tokens + start dev server

# Build
yarn build            # Production build (includes token generation)
yarn build:tokens     # Explicit token generation + build
yarn preview          # Preview production build

# Code Quality
yarn lint             # Run ESLint
yarn lint:fix         # Auto-fix ESLint issues
yarn format           # Format with Prettier

# Design Tokens
yarn tokens           # Build base tokens (CSS variables)
yarn tokens:typography    # Generate typography utilities
yarn tokens:shadcn        # Generate shadcn theme
yarn tokens:all           # Generate all tokens
```

### Development Workflow

1. **Start Development**
   ```bash
   yarn dev
   ```

2. **Make Changes**
   - Follow the coding conventions below
   - Use path aliases for imports
   - Run linter frequently: `yarn lint`

3. **Before Committing**
   ```bash
   yarn lint:fix
   yarn format
   yarn build  # Ensure build succeeds
   ```

4. **Design Token Changes**
   - If you modify design tokens in `scripts/tokens/`:
   ```bash
   yarn tokens:all
   ```
   - Tokens are auto-committed by CI on push

---

## Coding Conventions

### Import Organization

ESLint enforces strict import ordering:

```typescript
// 1. Built-in modules
import { useEffect, useState } from 'react';

// 2. External dependencies
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router';

// 3. Internal modules (path aliases)
import { CoursesApi } from '@/features/course/api/course.api';
import { useLocationStore } from '@/features/map/model/location.store';

// 4. Parent/sibling imports (rare, prefer path aliases)
import { Header } from '../components/Header';

// 5. Type imports (last)
import type { Course, CourseSearchParams } from '@/features/course/model/types';
```

**Rules:**
- Alphabetically sorted within each group
- Newline between groups
- Type imports separated at the end
- Always use path aliases (`@/`) over relative imports

### File Naming

```
components/      → PascalCase: Button.tsx, CourseCard.tsx
hooks/           → camelCase: useCourses.ts, useAuth.ts
utilities/       → kebab-case: http-client.ts, date-utils.ts
types/           → camelCase: types.ts, constants.ts
pages/           → kebab-case directories: course/, login/
```

### Component Structure

**Functional Components with Named Exports:**

```typescript
import { useState } from 'react';

import { Button } from '@/shared/ui/primitives/button';

import type { CourseCardProps } from './types';

export function CourseCard({ course, onClick }: CourseCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div className='rounded-lg border p-4'>
      <h3 className='title-b18'>{course.name}</h3>
      <Button onClick={() => onClick(course.id)}>View</Button>
    </div>
  );
}
```

**Key Points:**
- Named exports (not default exports)
- Props destructuring with TypeScript types
- Hooks at the top
- JSX with single quotes (Prettier enforced)
- Tailwind classes for styling

### Hook Patterns

**Custom Hooks Prefix with `use`:**

```typescript
// React Query hook
export function useCourses({ userLocation, radius }: UseCourseParams) {
  const query = useQuery({
    queryKey: ['courses', userLocation?.lat, userLocation?.lng, radius],
    queryFn: () => CoursesApi.getCourses(userLocation!.lat, userLocation!.lng),
    staleTime: 60_000,
    enabled: !!userLocation
  });

  return {
    courses: query.data ?? [],
    isLoading: query.isLoading,
    isError: query.isError
  };
}

// Zustand store hook
export const useLocationStore = create<LocationStore>()(
  persist(
    (set) => ({
      userLocation: null,
      setUserLocation: (location) => set({ userLocation: location })
    }),
    { name: 'user-location', storage: createJSONStorage(() => sessionStorage) }
  )
);
```

### API Layer Pattern

**Singleton Service Pattern:**

```typescript
// features/course/api/course.api.ts
import { api } from '@/shared/lib/http';

import type { Course, CoursesResponse } from '../model/types';

export const CoursesApi = {
  getCourses: (lat: number, lng: number, params?: SearchParams) =>
    api.get<CoursesResponse>('/courses', { params: { lat, lng, ...params } }),

  getCourseDetail: (uuid: string) =>
    api.get<Course>(`/courses/${uuid}`)
};
```

---

## State Management Patterns

### 1. Server State (React Query)

**Use for:** API data, cached server responses

```typescript
// Define query hook
export function useCourseDetail(uuid: string) {
  return useQuery({
    queryKey: ['course', uuid],
    queryFn: () => CoursesApi.getCourseDetail(uuid),
    staleTime: 5 * 60_000,  // 5 minutes
    gcTime: 10 * 60_000     // 10 minutes
  });
}

// Use in component
const { data: course, isLoading } = useCourseDetail(uuid);
```

**Query Configuration Standards:**
- `staleTime: 60_000` (1 minute) for frequently changing data
- `gcTime: 5 * 60_000` (5 minutes) for garbage collection
- `placeholderData: keepPreviousData` for smooth transitions
- `enabled: !!dependency` for conditional fetching
- `retry: 1` to limit retry attempts

### 2. Client State (Zustand)

**Use for:** UI state that needs persistence or global access

```typescript
// Location/map state stored in sessionStorage
const { userLocation, setUserLocation } = useLocationStore();
const { currentMapCenter, setCurrentMapView } = useLocationStore();
```

**When to use Zustand:**
- Map viewport state (center, zoom)
- User location tracking
- UI preferences (view mode, scroll position)
- State that needs sessionStorage/localStorage persistence

### 3. Context API

**Use for:** Authentication, global UI config

```typescript
// Auth context
const { user, isAuthenticated, login, logout } = useAuth();

// Header context
const { setHeaderConfig } = useHeader();
```

**When to use Context:**
- Authentication state
- Theme/dark mode
- Header configuration
- State that changes infrequently but needs global access

---

## API & Data Fetching

### HTTP Client

Located at `@/shared/lib/http.ts`, provides a wrapper around `fetch`:

```typescript
import { api } from '@/shared/lib/http';

// GET request
const courses = await api.get<Course[]>('/courses', {
  params: { lat, lng }
});

// POST request
const result = await api.post<ReviewResponse>('/reviews', {
  rating: 5,
  comment: 'Great course!'
});

// Download file
await api.download(`/courses/${uuid}/gpx`);
```

**Features:**
- Automatic JWT token injection
- Bearer authentication
- Typed responses
- Error handling with `ApiError` class
- Support for different response types (json, blob, text)

### React Query Patterns

**Standard Query Hook:**

```typescript
export function useCourseDetail(uuid: string) {
  return useQuery({
    queryKey: ['course', uuid],
    queryFn: () => CoursesApi.getCourseDetail(uuid),
    staleTime: 5 * 60_000,
    enabled: !!uuid
  });
}
```

**Mutation Hook:**

```typescript
export function useToggleBookmark() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ uuid, isBookmarked }: ToggleBookmarkParams) =>
      isBookmarked ? unbookmark(uuid) : bookmark(uuid),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user', 'bookmarks'] });
    }
  });
}
```

**Prefetch Pattern:**

```typescript
export function usePrefetchCourses() {
  const qc = useQueryClient();

  return (userLocation: UserLocation, search?: SearchParams) =>
    qc.prefetchQuery({
      queryKey: ['courses', userLocation.lat, userLocation.lng, ...],
      queryFn: () => CoursesApi.getCourses(userLocation.lat, userLocation.lng),
      staleTime: 60_000
    });
}
```

---

## Component Patterns

### UI Component Organization

```
shared/ui/
├── primitives/       # Base shadcn/ui components
│   ├── button.tsx
│   ├── dialog.tsx
│   └── input.tsx
├── composites/       # Composed components
│   ├── loading-spinner.tsx
│   └── input-clearable.tsx
├── navigations/      # Navigation components
│   ├── Header.tsx
│   └── Menu.tsx
└── actions/          # Action components
    ├── ShareButton.tsx
    └── Feedback.tsx
```

### shadcn/ui Components

The project uses **shadcn/ui** components based on Radix UI primitives. These are located in `@/shared/ui/primitives/`.

**Available Components:**
- Button, Input, Textarea, Label
- Dialog, AlertDialog, Popover, DropdownMenu
- Tabs, Slider, Toggle, ToggleGroup
- Card, Avatar, Badge, Carousel
- Sheet (mobile drawer), Sonner (toast notifications)

**Usage Example:**

```typescript
import { Button } from '@/shared/ui/primitives/button';
import { Dialog, DialogContent, DialogTrigger } from '@/shared/ui/primitives/dialog';

<Dialog>
  <DialogTrigger asChild>
    <Button variant='default'>Open Dialog</Button>
  </DialogTrigger>
  <DialogContent>
    <p>Dialog content</p>
  </DialogContent>
</Dialog>
```

### Icon System

Two icon sources:

1. **Lucide Icons** (external library):
```typescript
import { MapPin, Heart, Share2 } from 'lucide-react';

<MapPin className='size-5 text-pri' />
```

2. **Custom SVG Icons** (brand-specific):
```typescript
import { Icon } from '@/shared/icons/icon';

<Icon name='logo' className='size-8' />
```

Custom icons are located in `/public/*.svg` and imported via the Icon component.

---

## Styling Guidelines

### Tailwind CSS 4

The project uses **Tailwind CSS 4** with a custom configuration and design tokens.

### Design Token System

Design tokens are **auto-generated** from scripts:

```bash
scripts/tokens/
├── build-tokens.ts          # Generates CSS variables
├── generate-typography.ts   # Generates typography utilities
└── generate-shadcn-theme.ts # Generates shadcn theme
```

**Generated Files (Don't Edit Manually):**
```
src/shared/design/tokens/
├── variables.css            # CSS custom properties
├── tw-typography.ts         # Tailwind typography config
└── shadcn-theme.css         # shadcn component styles
```

### Color Palette

Use semantic color classes:

```typescript
// Grayscale (light to dark)
<div className='bg-g-10 text-g-100'>   // Light bg, dark text
<div className='border-g-30'>          // Light border

// Text colors
<p className='text-pri'>   // Primary text
<p className='text-sec'>   // Secondary text
<p className='text-ter'>   // Tertiary text
<p className='text-placeholder'> // Placeholder text

// Brand colors
<div className='bg-runddy-blue'>
<div className='text-runddy-green'>

// State colors
<span className='text-stateError'>
```

### Typography System

Use custom typography utilities (auto-generated):

```typescript
<h1 className='title-b21'>    // Title Bold 21px
<h2 className='title-b18'>    // Title Bold 18px
<p className='contents-r15'>  // Contents Regular 15px
<p className='contents-m15'>  // Contents Medium 15px
```

**Typography Pattern:** `{category}-{weight}{size}`
- Categories: `title`, `contents`, `caption`
- Weights: `b` (bold), `m` (medium), `r` (regular)
- Sizes: `21`, `18`, `15`, `13`, `12`, `11`

### Layout Constraints

```typescript
// Max width for mobile-first design
<div className='mx-auto max-w-xl'>

// Full viewport height
<div className='h-dvh'>  // Use dvh instead of vh for mobile

// Safe area insets (for notches)
<header className='safe-top'>
```

### Custom Utilities

```typescript
// Hide scrollbar
<div className='no-scrollbar overflow-auto'>

// Custom shadow
<div className='shadow-runddy'>
```

### Styling Best Practices

1. **Use Tailwind classes** instead of custom CSS
2. **Use semantic color variables** (text-pri, bg-g-10) instead of raw colors
3. **Use typography utilities** (title-b18) instead of arbitrary font sizes
4. **Mobile-first approach**: Design for mobile, enhance for larger screens
5. **Avoid inline styles** unless absolutely necessary
6. **Use clsx/cn for conditional classes**:

```typescript
import { cn } from '@/shared/lib/utils';

<div className={cn(
  'base-classes',
  isActive && 'active-classes',
  variant === 'primary' && 'primary-classes'
)}>
```

---

## TypeScript Conventions

### Strict Type Safety

TypeScript is configured with strict mode. Follow these patterns:

**Type Definitions:**

```typescript
// features/course/model/types.ts
export interface Course {
  id: string;
  name: string;
  distance: number;
  elevation?: number;  // Optional fields
}

export type CourseSearchParams = {
  radius?: number;
  grade?: number[];
  envType?: ('trail' | 'road' | 'mixed')[];
};
```

**Component Props:**

```typescript
interface CourseCardProps {
  course: Course;
  onClick: (id: string) => void;
  className?: string;
}

export function CourseCard({ course, onClick, className }: CourseCardProps) {
  // ...
}
```

**Generic Types:**

```typescript
// API response type
interface ApiResponse<T> {
  data: T;
  message: string;
  status: number;
}

const response = await api.get<ApiResponse<Course[]>>('/courses');
```

**Type Inference:**

Prefer type inference when possible:

```typescript
// Good (type inferred)
const [count, setCount] = useState(0);

// Only specify when needed
const [user, setUser] = useState<User | null>(null);
```

**Avoid `any`:**

ESLint warns on `any` usage. Use `unknown` or specific types:

```typescript
// Bad
function handleData(data: any) { }

// Good
function handleData(data: unknown) {
  if (isValidData(data)) {
    // Type narrowing
  }
}
```

---

## Testing Approach

### Current State

**No testing framework is currently configured.**

The project relies on:
- TypeScript for type safety
- ESLint for code quality
- Prettier for consistency
- CI/CD build validation

### If Adding Tests

Consider this structure:

```
src/
├── features/
│   └── course/
│       ├── __tests__/
│       │   ├── useCourses.test.ts
│       │   └── CoursesApi.test.ts
```

**Recommended Testing Stack:**
- **Vitest**: Fast unit test runner
- **Testing Library**: React component testing
- **MSW**: API mocking

---

## Git & CI/CD

### Git Workflow

**Branch Strategy:**

```bash
# Feature branches
claude/feature-description-session-id

# Always develop on the designated branch
git checkout claude/claude-md-mkruj6g345nsvq3j-yIFw1
```

**Commit Message Format:**

Follow conventional commits:

```
feat: add course filtering by elevation
fix: resolve map rendering issue on mobile
refactor: simplify authentication flow
chore(tokens): auto-update tokens from CI
docs: update API documentation
```

### CI/CD Pipeline

**GitHub Actions:** `.github/workflows/tokens-ci.yml`

**Triggers:**
- Push to `main` branch
- Pull requests

**Steps:**
1. Checkout repository
2. Setup Node.js 20 with Yarn cache
3. Install dependencies (`yarn install --immutable`)
4. Generate design tokens (`yarn tokens:all`)
5. Auto-commit token changes (if any)
6. Build project (`yarn build`)

**Auto-Generated Files:**

The CI automatically commits changes to:
- `src/shared/design/tokens/variables.css`
- `src/shared/design/tokens/tw-typography.ts`
- `src/shared/design/tokens/shadcn-theme.css`

**Never manually edit** these files; modify the source scripts instead.

---

## Common Tasks

### Adding a New Feature

1. **Create Feature Module**
   ```bash
   features/
   └── new-feature/
       ├── api/
       │   └── feature.api.ts
       ├── model/
       │   ├── types.ts
       │   └── constants.ts
       ├── hooks/
       │   └── useFeature.ts
       └── ui/
           └── FeatureComponent.tsx
   ```

2. **Define Types**
   ```typescript
   // features/new-feature/model/types.ts
   export interface Feature {
     id: string;
     name: string;
   }
   ```

3. **Create API Layer**
   ```typescript
   // features/new-feature/api/feature.api.ts
   import { api } from '@/shared/lib/http';
   import type { Feature } from '../model/types';

   export const FeatureApi = {
     getFeatures: () => api.get<Feature[]>('/features')
   };
   ```

4. **Create React Query Hook**
   ```typescript
   // features/new-feature/hooks/useFeature.ts
   import { useQuery } from '@tanstack/react-query';
   import { FeatureApi } from '../api/feature.api';

   export function useFeatures() {
     return useQuery({
       queryKey: ['features'],
       queryFn: FeatureApi.getFeatures
     });
   }
   ```

5. **Create Page**
   ```typescript
   // pages/feature/index.tsx
   import { useFeatures } from '@/features/new-feature/hooks/useFeature';

   export function FeaturePage() {
     const { data: features } = useFeatures();
     return <div>{/* Render features */}</div>;
   }
   ```

6. **Add Route**
   ```typescript
   // app/routing/router.tsx
   {
     path: '/feature',
     element: <FeaturePage />,
     handle: { header: { title: 'Features' } }
   }
   ```

### Adding a New UI Component

1. **Primitive Components** (shadcn/ui):
   - Install via shadcn CLI or manually from shadcn/ui docs
   - Place in `src/shared/ui/primitives/`

2. **Composite Components** (custom):
   ```typescript
   // src/shared/ui/composites/custom-input.tsx
   import { Input } from '@/shared/ui/primitives/input';
   import { Button } from '@/shared/ui/primitives/button';

   export function CustomInput() {
     return (
       <div className='relative'>
         <Input />
         <Button size='sm'>Submit</Button>
       </div>
     );
   }
   ```

### Modifying Design Tokens

1. **Edit Source Scripts**
   ```bash
   scripts/tokens/build-tokens.ts
   ```

2. **Regenerate Tokens**
   ```bash
   yarn tokens:all
   ```

3. **Verify Changes**
   ```bash
   git diff src/shared/design/tokens/
   ```

4. **Commit Both Source and Generated Files**
   ```bash
   git add scripts/tokens/ src/shared/design/tokens/
   git commit -m "chore(tokens): update color palette"
   ```

### Adding Authentication-Required Page

```typescript
// pages/protected/index.tsx
export function ProtectedPage() {
  return <div>Protected Content</div>;
}

// app/routing/router.tsx
{
  path: '/protected',
  element: <ProtectedRoute requireAuth={true}>
    <ProtectedPage />
  </ProtectedRoute>,
  handle: { header: { title: 'Protected', showBackButton: true } }
}
```

### Configuring Header for a Page

```typescript
// In route definition
{
  path: '/my-page',
  element: <MyPage />,
  handle: {
    header: {
      title: 'My Page Title',
      showBackButton: true,
      showMenu: false,
      leftButton: <CustomButton />,
      rightButton: <CustomButton />,
      showHeader: true  // Set to false to hide header
    }
  }
}

// Or dynamically in component
import { useHeader } from '@/app/providers/HeaderContext';

export function MyPage() {
  const { setHeaderConfig } = useHeader();

  useEffect(() => {
    setHeaderConfig({
      title: 'Dynamic Title',
      showBackButton: true
    });
  }, [setHeaderConfig]);
}
```

---

## Important Constraints

### Performance Considerations

1. **React Query Caching**
   - Always set appropriate `staleTime` and `gcTime`
   - Use `placeholderData: keepPreviousData` for smooth transitions
   - Prefetch data on route transitions

2. **Map Performance**
   - Limit marker count with clustering (if needed)
   - Debounce map events (pan, zoom)
   - Use `useMemo` for expensive calculations

3. **Bundle Size**
   - Vite automatically code-splits by route
   - Console/debugger statements removed in production
   - Icons tree-shaken via Lucide

### Mobile Optimization

1. **Touch Interactions**
   - Minimum tap target: 44x44px
   - Debounce rapid taps
   - Prevent zoom on double-tap where needed

2. **Viewport**
   - Use `100dvh` instead of `100vh` for mobile browsers
   - Consider safe area insets for notched devices

3. **Network**
   - Implement retry logic for failed requests
   - Show loading states prominently
   - Cache aggressively with React Query

### Security

1. **Authentication**
   - JWT tokens stored in `localStorage`
   - Automatic token expiration checking
   - Protected routes enforce authentication

2. **API Security**
   - Credentials included in fetch requests
   - Bearer token authentication
   - HTTPS enforced (HTTP → HTTPS upgrade)

3. **XSS Prevention**
   - React escapes content by default
   - Avoid `dangerouslySetInnerHTML` unless sanitized

### Accessibility

1. **ARIA Attributes**
   - Radix UI components have built-in ARIA support
   - SVG icons have `role='img'` and `focusable='false'`

2. **Keyboard Navigation**
   - All interactive elements keyboard accessible
   - Focus management in dialogs/modals

3. **Semantic HTML**
   - Use proper heading hierarchy
   - Use `<button>` for actions, `<a>` for navigation

---

## Code Review Checklist

Before finalizing changes, verify:

- [ ] TypeScript types are properly defined (no `any`)
- [ ] Imports are organized correctly (ESLint passing)
- [ ] Path aliases used instead of relative imports
- [ ] Components use named exports
- [ ] Tailwind classes used (no inline styles)
- [ ] Proper error handling in API calls
- [ ] React Query hooks configured with staleTime/gcTime
- [ ] Loading and error states handled in UI
- [ ] Mobile responsiveness verified
- [ ] Build succeeds (`yarn build`)
- [ ] Linting passes (`yarn lint`)
- [ ] Code formatted (`yarn format`)

---

## Quick Reference

### Project Commands
```bash
yarn dev              # Start development
yarn build            # Production build
yarn lint:fix         # Fix linting issues
yarn format           # Format code
yarn tokens:all       # Regenerate design tokens
```

### Path Aliases
```typescript
@/app/*       → src/app/*
@/shared/*    → src/shared/*
@/features/*  → src/features/*
@/pages/*     → src/pages/*
```

### Key Files
```
src/main.tsx                          # Application entry
src/app/routing/router.tsx            # Route definitions
src/app/providers/AuthContext.tsx     # Authentication
src/shared/lib/http.ts                # HTTP client
src/features/map/model/location.store.ts  # Location state
tailwind.config.ts                    # Tailwind configuration
vite.config.ts                        # Vite configuration
```

### Useful Hooks
```typescript
useAuth()              // Authentication state
useHeader()            // Header configuration
useLocationStore()     // Map/location state
useCourses()           // Fetch courses
useCourseDetail(uuid)  // Fetch course detail
useToggleBookmark()    // Bookmark mutation
```

---

## Resources

- **Tailwind CSS**: https://tailwindcss.com/docs
- **shadcn/ui**: https://ui.shadcn.com/
- **Radix UI**: https://www.radix-ui.com/
- **TanStack Query**: https://tanstack.com/query/latest
- **Zustand**: https://zustand.docs.pmnd.rs/
- **React Router**: https://reactrouter.com/
- **Vite**: https://vite.dev/
- **Naver Maps API**: https://navermaps.github.io/maps.js/

---

## Conclusion

This guide provides a comprehensive overview of the Runddy Client codebase. When making changes:

1. **Follow the FSD architecture** - Keep features isolated
2. **Use TypeScript strictly** - Leverage type safety
3. **Maintain consistency** - Follow established patterns
4. **Optimize for mobile** - Always consider mobile UX
5. **Cache intelligently** - Use React Query effectively
6. **Test thoroughly** - Verify on different devices/browsers
7. **Commit cleanly** - Use conventional commit messages

When in doubt, refer to existing code for patterns and conventions. The codebase is designed to be maintainable, scalable, and developer-friendly.

---

**Happy coding! 🚀**
