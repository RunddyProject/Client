import { create } from 'zustand';
import { subscribeWithSelector } from 'zustand/middleware';

type Tuple2 = [number, number];

export interface FilterState {
  grade: string[];
  envType: string[];
  shapeType: string[];
  distanceRange: Tuple2; // [minKm, maxKm]
  elevationRange: Tuple2; // [min, max]
}

export const DEFAULTS: FilterState = {
  grade: [],
  envType: [],
  shapeType: [],
  distanceRange: [0, 40],
  elevationRange: [0, 1000]
};

const toggleInArray = (arr: string[], v: string) =>
  arr.includes(v) ? arr.filter((x) => x !== v) : [...arr, v];

const previewCount = (f: FilterState) => {
  // TODO: 서버 GET /course/count 로 교체
  const base = 10;
  const penalty =
    f.grade.length +
    f.envType.length +
    f.shapeType.length +
    Math.round((f.distanceRange[0] + f.distanceRange[1]) / 40) +
    Math.round((f.elevationRange[0] + f.elevationRange[1]) / 1000);
  return Math.max(0, base - penalty);
};

interface FilterStore {
  // 상태
  applied: FilterState;
  draft: FilterState;
  count: number;

  // draft 조작
  toggleGrade: (g: string) => void;
  toggleEnvType: (e: string) => void;
  toggleShapeType: (s: string) => void;
  setDistanceRange: (r: Tuple2) => void;
  setElevationRange: (r: Tuple2) => void;
  resetDraft: () => void;
  loadDraftFromApplied: () => void;

  // 적용/리셋
  apply: () => void;
  resetAll: () => void;

  // applied 개별 제거(칩 X)
  removeGrade: (g: string) => void;
  removeEnvType: (e: string) => void;
  removeShapeType: (s: string) => void;
  resetDistanceRange: () => void;
  resetElevationRange: () => void;
}

export const useFilterStore = create<FilterStore>()(
  subscribeWithSelector((set) => ({
    applied: DEFAULTS,
    draft: DEFAULTS,
    count: previewCount(DEFAULTS),

    // ---- draft 조작 ----
    toggleGrade: (g) =>
      set((s) => {
        const draft = { ...s.draft, grade: toggleInArray(s.draft.grade, g) };
        return { draft, count: previewCount(draft) };
      }),
    toggleEnvType: (e) =>
      set((s) => {
        const draft = {
          ...s.draft,
          envType: toggleInArray(s.draft.envType, e)
        };
        return { draft, count: previewCount(draft) };
      }),
    toggleShapeType: (v) =>
      set((s) => {
        const draft = {
          ...s.draft,
          shapeType: toggleInArray(s.draft.shapeType, v)
        };
        return { draft, count: previewCount(draft) };
      }),
    setDistanceRange: (r) =>
      set((s) => {
        const draft = { ...s.draft, distanceRange: r };
        return { draft, count: previewCount(draft) };
      }),
    setElevationRange: (r) =>
      set((s) => {
        const draft = { ...s.draft, elevationRange: r };
        return { draft, count: previewCount(draft) };
      }),
    resetDraft: () =>
      set(() => ({ draft: DEFAULTS, count: previewCount(DEFAULTS) })),
    loadDraftFromApplied: () =>
      set((s) => ({ draft: s.applied, count: previewCount(s.applied) })),

    // ---- 적용/리셋 ----
    apply: () =>
      set((s) => {
        const applied = s.draft;
        // TODO: 여기에서 실제 API 호출 가능 (applied 사용)
        return { applied, count: previewCount(applied) };
      }),
    resetAll: () =>
      set(() => ({
        applied: DEFAULTS,
        draft: DEFAULTS,
        count: previewCount(DEFAULTS)
      })),

    // ---- applied 개별 제거(칩 X) ----
    removeGrade: (g) =>
      set((s) => {
        const applied = {
          ...s.applied,
          grade: s.applied.grade.filter((x) => x !== g)
        };
        return { applied, count: previewCount(applied) };
      }),
    removeEnvType: (e) =>
      set((s) => {
        const applied = {
          ...s.applied,
          envType: s.applied.envType.filter((x) => x !== e)
        };
        return { applied, count: previewCount(applied) };
      }),
    removeShapeType: (v) =>
      set((s) => {
        const applied = {
          ...s.applied,
          shapeType: s.applied.shapeType.filter((x) => x !== v)
        };
        return { applied, count: previewCount(applied) };
      }),
    resetDistanceRange: () =>
      set((s) => {
        const applied = { ...s.applied, distanceRange: DEFAULTS.distanceRange };
        return { applied, count: previewCount(applied) };
      }),
    resetElevationRange: () =>
      set((s) => {
        const applied = {
          ...s.applied,
          elevationRange: DEFAULTS.elevationRange
        };
        return { applied, count: previewCount(applied) };
      })
  }))
);
