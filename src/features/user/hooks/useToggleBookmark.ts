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

      // bookmarks update
      let next: UserBookmarksResponse | undefined = prevBookmarks;

      if (prevBookmarks) {
        const existsIdx = prevBookmarks.bookmarkList.findIndex(
          (b: Course) => b.uuid === payload.courseUuid
        );

        if (payload.isBookmarked) {
          if (existsIdx === -1 && courseDetail) {
            next = {
              bookmarkList: [
                ...prevBookmarks.bookmarkList,
                {
                  uuid: courseDetail.uuid,
                  lat: courseDetail.lat,
                  lng: courseDetail.lng,
                  name: courseDetail.name,
                  type: courseDetail.type,
                  grade: courseDetail.grade,
                  envType: courseDetail.envType,
                  envTypeName: courseDetail.envTypeName,
                  shapeType: courseDetail.shapeType,
                  shapeTypeName: courseDetail.shapeTypeName,
                  totalDistance: courseDetail.totalDistance,
                  svg: courseDetail.svg,
                  isBookmarked: true
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
