import { useCallback, useEffect, useRef } from 'react';

/**
 * 디바운스 함수 생성 훅
 *
 * @description
 * - 함수 호출을 지연시켜 과도한 실행 방지
 * - 의존성 배열 기반 자동 메모이제이션
 * - 언마운트 시 자동 정리
 *
 * @param callback - 디바운스할 함수
 * @param delay - 지연 시간 (ms)
 * @returns 디바운스된 함수 및 제어 함수
 *
 * @example
 * ```ts
 * const { debouncedFn, cancel, flush } = useDebounce(() => {
 *   console.log('실행');
 * }, 500);
 *
 * debouncedFn(); // 500ms 후 실행
 * cancel(); // 취소
 * flush(); // 즉시 실행
 * ```
 */
export function useDebounce<T extends (...args: any[]) => any>(
  callback: T,
  delay: number
): {
  debouncedFn: T;
  cancel: () => void;
  flush: () => void;
} {
  const callbackRef = useRef(callback);
  const timerRef = useRef<number | null>(null);
  const argsRef = useRef<any[] | null>(null);

  // 최신 콜백 유지
  useEffect(() => {
    callbackRef.current = callback;
  }, [callback]);

  // 언마운트 시 타이머 정리
  useEffect(() => {
    return () => {
      if (timerRef.current) {
        window.clearTimeout(timerRef.current);
      }
    };
  }, []);

  const cancel = useCallback(() => {
    if (timerRef.current) {
      window.clearTimeout(timerRef.current);
      timerRef.current = null;
    }
    argsRef.current = null;
  }, []);

  const flush = useCallback(() => {
    if (timerRef.current && argsRef.current) {
      window.clearTimeout(timerRef.current);
      timerRef.current = null;
      callbackRef.current(...argsRef.current);
      argsRef.current = null;
    }
  }, []);

  const debouncedFn = useCallback(
    ((...args: any[]) => {
      // 기존 타이머 취소
      if (timerRef.current) {
        window.clearTimeout(timerRef.current);
      }

      // 인자 저장
      argsRef.current = args;

      // 새 타이머 설정
      timerRef.current = window.setTimeout(() => {
        callbackRef.current(...args);
        timerRef.current = null;
        argsRef.current = null;
      }, delay);
    }) as T,
    [delay]
  );

  return {
    debouncedFn,
    cancel,
    flush
  };
}
