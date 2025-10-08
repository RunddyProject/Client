import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function deepEqual(a: any, b: any): boolean {
  const seen = new WeakMap<object, object>();

  const eq = (x: any, y: any): boolean => {
    if (Object.is(x, y)) return true; // NaN, -0까지 엄격 비교
    if (
      typeof x !== 'object' ||
      x === null ||
      typeof y !== 'object' ||
      y === null
    )
      return false;
    if (x.constructor !== y.constructor) return false;

    const stacked = seen.get(x);
    if (stacked && stacked === y) return true; // 순환 참조 처리
    seen.set(x, y);

    if (x instanceof Date) return x.getTime() === (y as Date).getTime();

    if (Array.isArray(x)) {
      if (x.length !== (y as any[]).length) return false;
      for (let i = 0; i < x.length; i++)
        if (!eq(x[i], (y as any[])[i])) return false;
      return true;
    }

    const xKeys = Object.keys(x);
    const yKeys = Object.keys(y);
    if (xKeys.length !== yKeys.length) return false;

    for (const k of xKeys) {
      if (!Object.prototype.hasOwnProperty.call(y, k)) return false;
      if (!eq(x[k], y[k])) return false;
    }
    return true;
  };

  return eq(a, b);
}
