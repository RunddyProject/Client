import { api } from '@/shared/lib/http';

import type {
  BookmarkPatchRequest,
  FeedbackPostRequest,
  UserBookmarksResponse,
  UserReviewsResponse
} from '@/features/user/model/types';

export const UserApi = {
  postFeedback: async (body: FeedbackPostRequest): Promise<void> => {
    return api.post(`/feedback`, body);
  },
  getUserReviews: async (): Promise<UserReviewsResponse> => {
    return api.get<UserReviewsResponse>('/users/review');
  },
  getUserBookmarks: async (): Promise<UserBookmarksResponse> => {
    return api.get<UserBookmarksResponse>('/users/bookmark');
  },
  patchBookmark: async (body: BookmarkPatchRequest): Promise<void> => {
    return api.patch('/bookmark', body);
  }
};
