import { useMemo } from 'react';

import type { Course } from '@/features/course/model/types';

/**
 * 여러 SVG를 일괄 새니타이제이션 (리스트용)
 *
 * @description
 * - 코스 리스트의 모든 SVG를 한 번에 새니타이즈
 * - Map 기반 캐싱으로 중복 계산 방지
 * - 코스 배열이 변경될 때만 재계산
 *
 * @param courses - 코스 배열
 * @returns 코스 UUID를 키로 하는 새니타이즈된 SVG Map
 *
 * @example
 * ```ts
 * const sanitizedSvgMap = useBulkSanitizedSvg(courses);
 *
 * {courses.map(course => (
 *   <div
 *     key={course.uuid}
 *     dangerouslySetInnerHTML={{ __html: sanitizedSvgMap.get(course.uuid) || '' }}
 *   />
 * ))}
 * ```
 */
export function useBulkSanitizedSvg(courses: Course[]): Map<string, string> {
  return useMemo(() => {
    const map = new Map<string, string>();

    const allowedTags = ['svg', 'path', 'circle', 'rect', 'line', 'polyline', 'polygon', 'g'];
    const scriptPattern = /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi;
    const eventPattern = /\s+on\w+\s*=/gi;
    const tagPattern = new RegExp(`<(${allowedTags.join('|')})([^>]*)>`, 'gi');

    for (const course of courses) {
      if (!course.svg) {
        map.set(course.uuid, '');
        continue;
      }

      // 새니타이제이션 로직
      let cleaned = course.svg
        .replace(scriptPattern, '')
        .replace(eventPattern, '');

      const matches = cleaned.match(tagPattern);
      if (!matches) {
        map.set(course.uuid, '');
        continue;
      }

      map.set(course.uuid, cleaned);
    }

    return map;
  }, [courses]);
}
