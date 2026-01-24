import { useCallback, useEffect, useRef } from 'react';

/**
 * 스로틀 함수 생성 훅
 *
 * @description
 * - 일정 시간 간격으로만 함수 실행
 * - 스크롤, 리사이즈 이벤트 최적화에 유용
 * - leading/trailing 옵션 지원
 *
 * @param callback - 스로틀할 함수
 * @param interval - 실행 간격 (ms)
 * @param options - 추가 옵션
 * @returns 스로틀된 함수 및 제어 함수
 *
 * @example
 * ```ts
 * const { throttledFn, cancel } = useThrottle(() => {
 *   console.log('실행');
 * }, 1000, { leading: true, trailing: false });
 *
 * throttledFn(); // 즉시 실행
 * throttledFn(); // 무시됨 (1초 이내)
 * ```
 */
export function useThrottle<T extends (...args: any[]) => any>(
  callback: T,
  interval: number,
  options?: {
    leading?: boolean;
    trailing?: boolean;
  }
): {
  throttledFn: T;
  cancel: () => void;
} {
  const { leading = true, trailing = true } = options ?? {};

  const callbackRef = useRef(callback);
  const lastRunRef = useRef<number>(0);
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

  const throttledFn = useCallback(
    ((...args: any[]) => {
      const now = Date.now();
      const timeSinceLastRun = now - lastRunRef.current;

      // 타이머가 이미 설정되어 있으면 인자만 업데이트
      if (timerRef.current) {
        if (trailing) {
          argsRef.current = args;
        }
        return;
      }

      // leading edge: 첫 호출 시 즉시 실행
      if (leading && timeSinceLastRun >= interval) {
        lastRunRef.current = now;
        callbackRef.current(...args);
        return;
      }

      // trailing edge: 대기 시간 후 실행
      if (trailing) {
        argsRef.current = args;
        const remainingTime = interval - timeSinceLastRun;

        timerRef.current = window.setTimeout(() => {
          lastRunRef.current = Date.now();
          if (argsRef.current) {
            callbackRef.current(...argsRef.current);
            argsRef.current = null;
          }
          timerRef.current = null;
        }, remainingTime > 0 ? remainingTime : interval);
      }
    }) as T,
    [interval, leading, trailing]
  );

  return {
    throttledFn,
    cancel
  };
}
