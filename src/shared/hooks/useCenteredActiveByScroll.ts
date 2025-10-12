import { useEffect, useRef } from 'react';

type Options = {
  container: React.RefObject<HTMLElement>;
  itemAttr?: string;
  onChange: (id: string) => void;
  minVisibleRatio?: number;
};

export function useCenteredActiveByScroll({
  container,
  itemAttr = 'uuid',
  onChange,
  minVisibleRatio = 0.3
}: Options) {
  const onChangeRef = useRef(onChange);
  useEffect(() => {
    onChangeRef.current = onChange;
  }, [onChange]);

  useEffect(() => {
    const root = container.current;
    if (!root) return;

    let rafId = 0;

    const pickCentered = () => {
      const rect = root.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;

      let bestId: string | null = null;
      let bestDist = Number.POSITIVE_INFINITY;

      const items = root.querySelectorAll<HTMLElement>(`[data-${itemAttr}]`);
      for (const el of Array.from(items)) {
        const r = el.getBoundingClientRect();
        const visibleWidth = Math.max(
          0,
          Math.min(r.right, rect.right) - Math.max(r.left, rect.left)
        );
        const ratio = visibleWidth / r.width;
        if (ratio < minVisibleRatio) continue;

        const itemCenterX = r.left + r.width / 2;
        const dist = Math.abs(itemCenterX - centerX);
        if (dist < bestDist) {
          bestDist = dist;
          bestId = el.dataset[itemAttr] ?? null;
        }
      }

      if (bestId) onChangeRef.current(bestId);
    };

    const onScroll = () => {
      cancelAnimationFrame(rafId);
      rafId = requestAnimationFrame(pickCentered);
    };

    const onResize = () => {
      cancelAnimationFrame(rafId);
      rafId = requestAnimationFrame(pickCentered);
    };

    pickCentered();
    root.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onResize);
    const ro = new ResizeObserver(() => onResize());
    ro.observe(root);

    return () => {
      cancelAnimationFrame(rafId);
      root.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onResize);
      ro.disconnect();
    };
  }, [container, itemAttr, minVisibleRatio]);
}
