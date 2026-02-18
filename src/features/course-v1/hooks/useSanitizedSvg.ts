import { useMemo } from 'react';

import type { SvgSanitizationOptions } from '@/features/course-v1/model/refactor-types';

/**
 * SVG sanitization memoization hook
 *
 * @description
 * - Safely sanitizes SVG strings
 * - Caches result with useMemo to prevent recalculation on re-render
 * - Removes script tags and event handlers
 *
 * @param svg - Original SVG string
 * @param options - Sanitization options
 * @returns Sanitized SVG string
 *
 * @example
 * ```ts
 * const sanitizedSvg = useSanitizedSvg(course.svg);
 *
 * <div dangerouslySetInnerHTML={{ __html: sanitizedSvg }} />
 * ```
 */
export function useSanitizedSvg(
  svg: string,
  options?: SvgSanitizationOptions
): string {
  const {
    allowedTags = [
      'svg',
      'path',
      'circle',
      'rect',
      'line',
      'polyline',
      'polygon',
      'g'
    ],
    removeScripts = true,
    removeEventHandlers = true
  } = options ?? {};

  return useMemo(() => {
    if (!svg) return '';

    // 1. Remove script tags
    let cleaned = svg;
    if (removeScripts) {
      const scriptPattern =
        /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi;
      cleaned = cleaned.replace(scriptPattern, '');
    }

    // 2. Remove event handlers (onclick, onload, etc.)
    if (removeEventHandlers) {
      const eventPattern = /\s+on\w+\s*=/gi;
      cleaned = cleaned.replace(eventPattern, '');
    }

    // 3. Validate allowed tags only
    const tagPattern = new RegExp(`<(${allowedTags.join('|')})([^>]*)>`, 'gi');
    const matches = cleaned.match(tagPattern);

    // Return empty string if no allowed tags found
    if (!matches) return '';

    return cleaned;
  }, [svg, allowedTags, removeScripts, removeEventHandlers]);
}
