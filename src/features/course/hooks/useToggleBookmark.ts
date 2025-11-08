import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

import { CoursesApi } from '@/features/course/api/course.api';

import type {
  BookmarkPatchRequest,
  BookmarksResponse,
  Course,
  CourseDetail
} from '@/features/course/model/types';

export function useToggleBookmark() {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: (payload: BookmarkPatchRequest) =>
      CoursesApi.patchBookmark(payload),

    onMutate: async (payload) => {
      await queryClient.cancelQueries({ queryKey: ['bookmarks'] });

      const prevBookmarks = queryClient.getQueryData<BookmarksResponse>([
        'bookmarks'
      ]);

      const courseDetail = queryClient.getQueryData<CourseDetail>([
        'course',
        payload.courseUuid
      ]);

      let next: BookmarksResponse | undefined = prevBookmarks;

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

        queryClient.setQueryData<BookmarksResponse>(['bookmarks'], next);
      }

      if (courseDetail) {
        queryClient.setQueryData<CourseDetail>(['course', payload.courseUuid], {
          ...courseDetail,
          isBookmarked: payload.isBookmarked
        });
      }

      return { prevBookmarks, prevCourse: courseDetail };
    },

    onError: (error, payload, ctx) => {
      console.error('bookmark toggle failed:', error);
      toast.error('북마크 업데이트에 실패했어요');

      if (ctx?.prevBookmarks) {
        queryClient.setQueryData(['bookmarks'], ctx.prevBookmarks);
      }
      if (ctx?.prevCourse) {
        queryClient.setQueryData(
          ['course', payload.courseUuid],
          ctx.prevCourse
        );
      }
      queryClient.invalidateQueries({ queryKey: ['bookmarks'] });
    },

    onSuccess: () => {
      toast.success('북마크가 업데이트되었어요');
    }
  });

  return {
    toggle: mutation.mutate,
    toggleAsync: mutation.mutateAsync,
    isSaving: mutation.isPending
  };
}
