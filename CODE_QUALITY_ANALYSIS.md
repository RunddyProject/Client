# Code Quality & Consistency Analysis

> **Date**: 2026-01-31
> **Branch**: `claude/analyze-react-performance-DIHCM`
> **Total Files Analyzed**: 113 TypeScript files

This document identifies unnecessary code, files, and style inconsistencies across the codebase.

---

## Table of Contents

1. [🔴 Critical Issues](#-critical-issues)
2. [🟠 High Priority Issues](#-high-priority-issues)
3. [🟡 Medium Priority Issues](#-medium-priority-issues)
4. [🟢 Low Priority / Recommendations](#-low-priority--recommendations)
5. [📊 Statistics Summary](#-statistics-summary)
6. [✅ Cleanup Checklist](#-cleanup-checklist)

---

## 🔴 Critical Issues

### 1. **Unused Refactor Hook Files (1,737 lines of dead code)**

**Problem**: Three large signature-only files that are never used

| File | Lines | Used? | Purpose |
|------|-------|-------|---------|
| `src/features/course/hooks/refactor-hooks.ts` | 676 | ❌ No | Hook signatures for Phase 3 |
| `src/features/map/hooks/refactor-hooks.ts` | 590 | ❌ No | Map hook signatures |
| `src/shared/hooks/refactor-hooks.ts` | 471 | ❌ No | Shared hook signatures |

**Evidence**:
```bash
# No imports found (except self-references)
grep -r "from.*refactor-hooks" src --include="*.ts" --include="*.tsx"
# Result: 0 imports
```

**Impact**:
- ❌ **1,737 lines of dead code** (15% of total codebase)
- ❌ Increases bundle size check time
- ❌ Confuses developers (looks like implementation exists)
- ❌ Has `@ts-nocheck` which hides potential issues

**Recommendation**:
```bash
# Option 1: Delete (if Phase 3 is postponed)
rm src/features/course/hooks/refactor-hooks.ts
rm src/features/map/hooks/refactor-hooks.ts
rm src/shared/hooks/refactor-hooks.ts

# Option 2: Move to docs (if keeping for reference)
mkdir -p docs/refactoring
mv src/**/refactor-hooks.ts docs/refactoring/
```

**Decision Point**: Are these files needed for Phase 3? If yes, when will Phase 3 happen?

---

### 2. **Korean Comments Mixed with English (40+ instances)**

**Problem**: Inconsistent comment language throughout codebase

**Examples**:

**In refactor-hooks.ts:**
```typescript
// ❌ Korean
// 2. 지도 관련 훅
// 3. 스크롤 동기화 관련 훅
// 4. SVG 새니타이제이션 관련 훅

// ✅ Should be English
// 2. Map-related hooks
// 3. Scroll synchronization hooks
// 4. SVG sanitization hooks
```

**In recently created hooks:**
```typescript
// useOptimizedMarkers.ts
// ❌ Korean
// 1. Polyline 경로 생성 (메모이제이션)
// 2. 경계 정보 계산 (메모이제이션)
// 3. 모든 마커 결합

// ✅ Should be English
// 1. Generate polyline path (memoized)
// 2. Calculate bounds information (memoized)
// 3. Combine all markers
```

**Files Affected**:
- `src/features/course/hooks/refactor-hooks.ts` (30+ Korean comments)
- `src/features/map/hooks/refactor-hooks.ts` (20+ Korean comments)
- `src/shared/hooks/refactor-hooks.ts` (15+ Korean comments)
- `src/features/course/hooks/useBulkSanitizedSvg.ts` (3 Korean comments)
- `src/features/course/hooks/useOptimizedMarkers.ts` (3 Korean comments)
- `src/features/course/hooks/useOptimizedPolylineCoordinates.ts` (2 Korean comments)
- `src/features/course/hooks/useSanitizedSvg.ts` (2 Korean comments)

**Impact**:
- ❌ Violates CLAUDE.md convention (English comments)
- ❌ Reduces international collaboration potential
- ❌ Inconsistent with recent changes (Map.tsx, InfoCard.tsx use English)

**Recommendation**: Convert ALL code comments to English (preserve Korean UI strings)

---

## 🟠 High Priority Issues

### 3. **Emoji in Code Comments (Inconsistent Style)**

**Problem**: Some files use ✅/❌ emojis, others don't

**Found In** (6 instances):
```typescript
// Map.tsx
// ✅ Performance optimization - Critical Fix: Added dependency array

// InfoCard.tsx
// ✅ Performance optimization: Memoized SVG sanitization

// useGpxPolyline.ts
// ✅ Performance optimization - Critical Fix: Memoized polyline coordinates
```

**Inconsistency**:
- Most codebase uses plain `//` comments
- Only 6 comments use emojis (all added in recent refactoring)
- CLAUDE.md doesn't mention emoji usage in comments

**Impact**:
- 🟡 Minor style inconsistency
- 🟡 Could confuse developers unfamiliar with emoji conventions

**Recommendation**:
```typescript
// Option 1: Remove emojis (match existing codebase style)
// Performance optimization - Critical Fix: Added dependency array

// Option 2: Add emojis consistently (would require updating 100+ files)
// ✅ Performance optimization - Critical Fix: Added dependency array
```

**Suggested**: Remove emojis to match existing codebase convention

---

### 4. **Default Exports vs Named Exports (30 violations)**

**Problem**: CLAUDE.md recommends named exports, but 30 files use default exports

**Convention (from CLAUDE.md)**:
```typescript
// ✅ Recommended: Named exports
export function CourseInfoCard({ course }: Props) { }

// ❌ Avoid: Default exports
export default CourseInfoCard;
```

**Files Using Default Export** (30 total):
```
Components:
- src/features/course/ui/InfoCard.tsx
- src/features/course/ui/Map.tsx
- src/features/course/ui/Filter.tsx
- src/features/course/ui/List.tsx
- src/features/course/ui/CourseDetail.tsx
- src/features/course/ui/CourseReview.tsx
- src/features/course/ui/Search.tsx
... (23 more)

Pages:
- src/pages/course/index.tsx
- src/pages/course/info-layout.tsx
- src/pages/course/info-map.tsx
... (7 more)
```

**Impact**:
- 🟡 Violates project convention (CLAUDE.md)
- 🟡 Makes refactoring harder (default imports can be renamed arbitrarily)
- 🟡 Reduces IDE autocomplete effectiveness

**Recommendation**: Gradually migrate to named exports

```typescript
// Before
export default CourseInfoCard;

// After
export { CourseInfoCard };

// Or at export site
export function CourseInfoCard() { }
```

---

### 5. **Console Statements in Production Code (33 instances)**

**Problem**: Console statements should be removed for production

**Breakdown**:
- `console.error`: 25 instances (mostly in error handlers - OK)
- `console.warn`: 4 instances (auth warnings - OK)
- `console.log`: 1 instance ⚠️ **Should be removed**

**The One Problem**:
```typescript
// src/features/user/api/auth.ts:238
console.log('[Auth] Manually set token');
```

**Impact**:
- ❌ Debug log in production code
- ✅ Error/warn logs are acceptable for debugging

**Recommendation**:
```typescript
// Remove this line
console.log('[Auth] Manually set token');

// Or use environment check
if (import.meta.env.DEV) {
  console.log('[Auth] Manually set token');
}
```

---

## 🟡 Medium Priority Issues

### 6. **No Test Files (0 tests)**

**Problem**: Zero test coverage

```bash
find src -name "*.test.ts" -o -name "*.spec.ts"
# Result: 0 files
```

**Impact**:
- 🟡 No automated testing for refactored performance optimizations
- 🟡 Higher risk when making changes
- 🟡 Can't verify performance improvements programmatically

**Recommendation**: Add tests for critical hooks

```typescript
// Example: src/features/course/hooks/__tests__/useSanitizedSvg.test.ts
describe('useSanitizedSvg', () => {
  it('should remove script tags', () => {
    const svg = '<svg><script>alert("xss")</script></svg>';
    const { result } = renderHook(() => useSanitizedSvg(svg));
    expect(result.current).not.toContain('<script>');
  });
});
```

---

### 7. **TODO Comment (1 instance)**

**Found**:
```tsx
// src/pages/me/edit.tsx
{/* TODO: sticky footer */}
```

**Impact**:
- 🟡 Minor - indicates incomplete feature
- 🟡 Should be tracked in issue tracker instead

**Recommendation**: Create GitHub issue and link, or implement sticky footer

---

### 8. **Large Component Files (478 lines)**

**Problem**: Filter.tsx is too large and violates single responsibility

**Largest Files**:
| File | Lines | Issues |
|------|-------|--------|
| `Filter.tsx` | 481 | Mixed UI state + URL params + API calls |
| `Map.tsx` | 459 | Still complex despite Phase 2 optimizations |

**From REFACTOR_GUIDE.md**:
> Filter Component (Filter.tsx)
> - **478 lines** in a single component
> - Mixed concerns: UI state, filter state, URL manipulation, API calls

**Impact**:
- 🟡 Hard to maintain
- 🟡 Difficult to test
- 🟡 Already identified in performance analysis

**Recommendation**: Split in Phase 3 (already planned)

---

## 🟢 Low Priority / Recommendations

### 9. **Inconsistent Comment Styles**

**JSDoc vs Regular Comments**:
- 157 JSDoc-style comments (`/** */`)
- 400+ regular comments (`//`)
- No clear pattern when to use which

**Example Inconsistency**:
```typescript
// Some files use JSDoc
/**
 * SVG sanitization hook
 * @param svg - Original SVG string
 * @returns Sanitized SVG
 */
export function useSanitizedSvg(svg: string) { }

// Same file uses regular comments
// 1. Remove script tags
// 2. Remove event handlers
```

**Recommendation**: Establish convention
- JSDoc for **public API** (exported functions/components)
- Regular `//` for **internal logic**

---

### 10. **File Naming Inconsistency**

**Pattern Violations**:
```
Expected (CLAUDE.md):
- components/  → PascalCase: Button.tsx
- hooks/       → camelCase: useCourses.ts
- utilities/   → kebab-case: http-client.ts

Violations:
✅ Most files follow convention
⚠️ Some old files may not (needs detailed audit)
```

---

## 📊 Statistics Summary

### Codebase Overview
```
Total TypeScript files:    113
Total lines (estimated):   ~11,500
Dead code (refactor-*):    1,737 lines (15%)
Test coverage:             0%
```

### Issue Breakdown
```
🔴 Critical:     2 issues (dead code, Korean comments)
🟠 High:         3 issues (emojis, exports, console.log)
🟡 Medium:       3 issues (no tests, TODO, large files)
🟢 Low:          2 issues (comment styles, naming)

Total:           10 issues identified
```

### Comment Language Distribution
```
English comments:    ~350 (87%)
Korean comments:     ~50 (13%)
Mixed files:         7 files
```

---

## ✅ Cleanup Checklist

### Immediate Actions (Can do now)

- [ ] **Delete unused refactor-hooks.ts files** (saves 1,737 lines)
  ```bash
  git rm src/features/course/hooks/refactor-hooks.ts
  git rm src/features/map/hooks/refactor-hooks.ts
  git rm src/shared/hooks/refactor-hooks.ts
  ```

- [ ] **Remove `console.log` in auth.ts:238**
  ```typescript
  // Remove or wrap with environment check
  ```

- [ ] **Convert Korean comments to English** (7 files)
  ```
  - useBulkSanitizedSvg.ts
  - useOptimizedMarkers.ts
  - useOptimizedPolylineCoordinates.ts
  - useSanitizedSvg.ts
  ```

- [ ] **Remove emoji comments** (6 instances) or make consistent
  ```
  - Map.tsx (3 comments)
  - InfoCard.tsx (1 comment)
  - useGpxPolyline.ts (2 comments)
  ```

### Short-term (Next sprint)

- [ ] **Resolve TODO comment** (me/edit.tsx)
- [ ] **Migrate to named exports** (gradually, 30 files)
- [ ] **Add tests for performance hooks** (4 core hooks)

### Long-term (Phase 3+)

- [ ] **Refactor Filter.tsx** (478 lines → <200 lines)
- [ ] **Complete Map.tsx refactoring** (Container/View pattern)
- [ ] **Establish JSDoc convention**
- [ ] **Add comprehensive test coverage**

---

## 🎯 Recommended Priority Order

1. **Immediate Win**: Delete refactor-hooks.ts files (15% code reduction)
2. **Quick Fix**: Remove console.log, convert Korean comments
3. **Style Consistency**: Remove/standardize emoji comments
4. **Gradual Migration**: Named exports (do with each file touched)
5. **Phase 3**: Large file refactoring (already planned)

---

## 📝 Notes

### What NOT to Change

✅ **Keep as-is**:
- Korean UI strings (현재 위치에서 검색, 목록 보기, etc.) - these are user-facing
- `console.error` and `console.warn` for debugging - acceptable
- Current file structure - follows Feature-Sliced Design

### Style Preferences

Based on existing codebase analysis:
- **Comments**: Plain `//` without emojis (95% of codebase)
- **Exports**: Named exports preferred (CLAUDE.md)
- **Language**: English for code, Korean for UI
- **JSDoc**: Use for public API only

---

**Generated**: 2026-01-31
**Analysis Tool**: grep, find, manual inspection
**Reviewed**: Pending
