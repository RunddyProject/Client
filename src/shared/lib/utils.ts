import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function deepEqual(a: unknown, b: unknown): boolean {
  const seen = new WeakMap<object, object>();

  const eq = (x: unknown, y: unknown): boolean => {
    if (Object.is(x, y)) return true; // NaN, -0까지 엄격 비교
    if (
      typeof x !== 'object' ||
      x === null ||
      typeof y !== 'object' ||
      y === null
    )
      return false;
    if ((x as object).constructor !== (y as object).constructor) return false;

    const stacked = seen.get(x as object);
    if (stacked && stacked === y) return true; // 순환 참조 처리
    seen.set(x as object, y as object);

    if (x instanceof Date && y instanceof Date) {
      return x.getTime() === y.getTime();
    }

    if (Array.isArray(x) && Array.isArray(y)) {
      if (x.length !== y.length) return false;
      for (let i = 0; i < x.length; i++) if (!eq(x[i], y[i])) return false;
      return true;
    }

    const xKeys = Object.keys(x);
    const yKeys = Object.keys(y);
    if (xKeys.length !== yKeys.length) return false;

    for (const k of xKeys) {
      if (!Object.prototype.hasOwnProperty.call(y, k)) return false;
      if (
        !eq(
          (x as Record<string, unknown>)[k],
          (y as Record<string, unknown>)[k]
        )
      )
        return false;
    }
    return true;
  };

  return eq(a, b);
}
