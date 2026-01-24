import { useMemo } from 'react';

import type { SvgSanitizationOptions } from '@/features/course/model/refactor-types';

/**
 * SVG 새니타이제이션 메모이제이션 훅
 *
 * @description
 * - SVG 문자열을 안전하게 새니타이즈
 * - 결과를 useMemo로 캐싱하여 리렌더링 시 재계산 방지
 * - script 태그, 이벤트 핸들러 제거
 *
 * @param svg - 원본 SVG 문자열
 * @param options - 새니타이제이션 옵션
 * @returns 새니타이즈된 SVG 문자열
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
    allowedTags = ['svg', 'path', 'circle', 'rect', 'line', 'polyline', 'polygon', 'g'],
    removeScripts = true,
    removeEventHandlers = true
  } = options ?? {};

  return useMemo(() => {
    if (!svg) return '';

    // 1. script 태그 제거
    let cleaned = svg;
    if (removeScripts) {
      const scriptPattern = /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi;
      cleaned = cleaned.replace(scriptPattern, '');
    }

    // 2. 이벤트 핸들러 제거 (onclick, onload 등)
    if (removeEventHandlers) {
      const eventPattern = /\s+on\w+\s*=/gi;
      cleaned = cleaned.replace(eventPattern, '');
    }

    // 3. 허용된 태그만 검증
    const tagPattern = new RegExp(`<(${allowedTags.join('|')})([^>]*)>`, 'gi');
    const matches = cleaned.match(tagPattern);

    // 허용된 태그가 없으면 빈 문자열 반환
    if (!matches) return '';

    return cleaned;
  }, [svg, allowedTags, removeScripts, removeEventHandlers]);
}
