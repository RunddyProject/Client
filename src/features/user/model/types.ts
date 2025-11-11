import type { Course } from '@/features/course/model/types';

export interface FeedbackPostRequest {
  feedbackType: 'FEEDBACK' | 'COURSE';
  courseUuid?: string;
  content: string;
}

export interface UserReviewsResponse {
  courseList: Course[];
}

export interface UserBookmarksResponse {
  bookmarkList: Course[];
}

export interface BookmarkPatchRequest {
  courseUuid: string;
  isBookmarked: boolean;
}
