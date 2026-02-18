import { useMemo } from 'react';

import type { Course } from '@/features/course-v1/model/types';

/**
 * Bulk SVG sanitization for lists
 *
 * @description
 * - Sanitizes all SVGs in course list at once
 * - Map-based caching prevents duplicate calculations
 * - Recalculates only when course array changes
 *
 * @param courses - Array of courses
 * @returns Map of sanitized SVGs keyed by course UUID
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

    const allowedTags = [
      'svg',
      'path',
      'circle',
      'rect',
      'line',
      'polyline',
      'polygon',
      'g'
    ];
    const scriptPattern = /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi;
    const eventPattern = /\s+on\w+\s*=/gi;
    const tagPattern = new RegExp(`<(${allowedTags.join('|')})([^>]*)>`, 'gi');

    for (const course of courses) {
      if (!course.svg) {
        map.set(course.uuid, '');
        continue;
      }

      // Sanitization logic
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
