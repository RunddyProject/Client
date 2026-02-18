import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

import { UserApi } from '@/features/user/api/user.api';

import type { Course, CourseDetail } from '@/features/course/model/types';
import type {
  BookmarkPatchRequest,
  UserBookmarksResponse,
  UserReviewsResponse
} from '@/features/user/model/types';
import type { ApiError } from '@/shared/lib/http';

type ToggleBookmarkContext = {
  prevBookmarks?: UserBookmarksResponse;
  prevCourse?: CourseDetail;
  prevCoursesSnapshots?: [readonly unknown[], Course[] | undefined][];
};

export function useToggleBookmark() {
  const queryClient = useQueryClient();

  const mutation = useMutation<
    void,
    ApiError,
    BookmarkPatchRequest,
    ToggleBookmarkContext
  >({
    mutationFn: (payload: BookmarkPatchRequest) =>
      UserApi.patchBookmark(payload),

    onMutate: async (payload) => {
      await queryClient.cancelQueries({ queryKey: ['bookmarks'] });

      const prevBookmarks = queryClient.getQueryData<UserBookmarksResponse>([
        'bookmarks'
      ]);

      const prevReviews = queryClient.getQueryData<UserReviewsResponse>([
        'reviews'
      ]);

      const courseDetail = queryClient.getQueryData<CourseDetail>([
        'course',
        payload.courseUuid
      ]);

      // courses snapshot for rollback
      const prevCoursesSnapshots = queryClient.getQueriesData<Course[]>({
        queryKey: ['courses']
      });

      // Find course data from courses queries if courseDetail is not available
      let courseData: Course | CourseDetail | undefined = courseDetail;
      if (!courseData) {
        const coursesQueries = queryClient.getQueriesData<Course[]>({
          queryKey: ['courses']
        });
        for (const [, list] of coursesQueries) {
          if (!list) continue;
          const found = list.find((c) => c.uuid === payload.courseUuid);
          if (found) {
            courseData = found;
            break;
          }
        }
      }

      // bookmarks update
      let next: UserBookmarksResponse | undefined = prevBookmarks;

      if (prevBookmarks) {
        const existsIdx = prevBookmarks.bookmarkList.findIndex(
          (b: Course) => b.uuid === payload.courseUuid
        );

        if (payload.isBookmarked) {
          if (existsIdx === -1 && courseData) {
            next = {
              bookmarkList: [
                ...prevBookmarks.bookmarkList,
                {
                  uuid: courseData.uuid,
                  lat: courseData.lat,
                  lng: courseData.lng,
                  name: courseData.name,
                  type: courseData.type,
                  grade: courseData.grade,
                  envType: courseData.envType,
                  envTypeName: courseData.envTypeName,
                  shapeType: courseData.shapeType,
                  shapeTypeName: courseData.shapeTypeName,
                  totalDistance: courseData.totalDistance,
                  svg: courseData.svg,
                  isBookmarked: true,
                  createdAt: courseData.createdAt
                }
              ]
            };
          }
        } else {
          next = {
            bookmarkList: prevBookmarks.bookmarkList.filter(
              (b: Course) => b.uuid !== payload.courseUuid
            )
          };
        }

        queryClient.setQueryData<UserBookmarksResponse>(['bookmarks'], next);
      }

      // user reviews update
      if (prevReviews) {
        const nextReviews: UserReviewsResponse = {
          courseList: prevReviews.courseList.map((c) =>
            c.uuid === payload.courseUuid
              ? { ...c, isBookmarked: payload.isBookmarked }
              : c
          )
        };
        queryClient.setQueryData(['reviews'], nextReviews);
      }

      // course detail update
      if (courseDetail) {
        queryClient.setQueryData<CourseDetail>(['course', payload.courseUuid], {
          ...courseDetail,
          isBookmarked: payload.isBookmarked
        });
      }

      // courses update
      const courseQueries = queryClient.getQueriesData<Course[]>({
        queryKey: ['courses']
      });

      courseQueries.forEach(([key, list]) => {
        if (!list) return;
        queryClient.setQueryData<Course[]>(
          key,
          list.map((c) =>
            c.uuid === payload.courseUuid
              ? { ...c, isBookmarked: payload.isBookmarked }
              : c
          )
        );
      });

      return { prevBookmarks, prevCourse: courseDetail, prevCoursesSnapshots };
    },

    onError: (error, payload, ctx) => {
      console.error('bookmark toggle failed:', error);
      if (error.status === 401) {
        toast.error('로그인이 필요해요');
      } else {
        toast.error(
          payload.isBookmarked
            ? '북마크가 저장되지 않았어요'
            : '북마크가 삭제되지 않았어요'
        );
      }

      if (ctx?.prevBookmarks) {
        queryClient.setQueryData(['bookmarks'], ctx.prevBookmarks);
      }
      if (ctx?.prevCourse) {
        queryClient.setQueryData(
          ['course', payload.courseUuid],
          ctx.prevCourse
        );
      }

      // courses rollback
      if (ctx?.prevCoursesSnapshots) {
        ctx.prevCoursesSnapshots.forEach(([key, data]) => {
          queryClient.setQueryData(key, data);
        });
      }

      queryClient.invalidateQueries({ queryKey: ['bookmarks'] });
    },

    onSuccess: (_, payload) => {
      toast.success(
        payload.isBookmarked ? '북마크가 저장되었어요' : '북마크가 삭제되었어요'
      );
    }
  });

  return {
    toggle: mutation.mutate,
    toggleAsync: mutation.mutateAsync,
    isSaving: mutation.isPending
  };
}
