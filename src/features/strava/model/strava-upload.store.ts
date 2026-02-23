import { create } from 'zustand';

import type { StravaPreviewState } from '@/features/course-upload/model/types';

interface StravaUploadStore {
  stravaPreview: StravaPreviewState | null;
  setStravaPreview: (preview: StravaPreviewState) => void;
  clearStravaPreview: () => void;
}

/**
 * In-memory store for Strava activity preview data during the upload flow.
 * Not persisted: data is cleared when the upload page unmounts.
 */
export const useStravaUploadStore = create<StravaUploadStore>()((set) => ({
  stravaPreview: null,
  setStravaPreview: (preview) => set({ stravaPreview: preview }),
  clearStravaPreview: () => set({ stravaPreview: null })
}));
