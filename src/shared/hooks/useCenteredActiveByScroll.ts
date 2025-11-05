import { useEffect, useRef } from 'react';

type Options = {
  container: React.RefObject<HTMLElement>;
  /** data attribute name that holds the item id (e.g., 'uuid' → data-uuid) */
  itemAttr?: string;
  /** called when the active (centered) item changes */
  onChange: (id: string) => void;
  /** minimum visible ratio (0~1) to be considered "visible" */
  minVisibleRatio?: number;
  /** debounce delay after scrolling settles (ms) */
  settleDelay?: number;
  /** list axis */
  axis?: 'x' | 'y';
};

export function useCenteredActiveByScroll({
  container,
  itemAttr = 'uuid',
  onChange,
  minVisibleRatio = 0.3,
  settleDelay = 200,
  axis = 'x'
}: Options) {
  const onChangeRef = useRef(onChange);
  const lastActiveRef = useRef<string | null>(null);
  const timerRef = useRef<number | null>(null);

  useEffect(() => {
    onChangeRef.current = onChange;
  }, [onChange]);

  useEffect(() => {
    const root = container.current;
    if (!root) return;

    const clearTimer = () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
        timerRef.current = null;
      }
    };

    const computeCentered = (): string | null => {
      const rect = root.getBoundingClientRect();
      const centerMain =
        axis === 'x' ? rect.left + rect.width / 2 : rect.top + rect.height / 2;

      let bestIdByRatio: string | null = null;
      let bestRatio = -1;
      let nearestId: string | null = null;
      let nearestDist = Number.POSITIVE_INFINITY;

      const nodes = root.querySelectorAll<HTMLElement>(`[data-${itemAttr}]`);
      for (const el of nodes) {
        const r = el.getBoundingClientRect();

        const visibleMain = Math.max(
          0,
          Math.min(
            axis === 'x' ? r.right : r.bottom,
            axis === 'x' ? rect.right : rect.bottom
          ) -
            Math.max(
              axis === 'x' ? r.left : r.top,
              axis === 'x' ? rect.left : rect.top
            )
        );
        const sizeMain = axis === 'x' ? r.width : r.height;
        const ratio = sizeMain > 0 ? visibleMain / sizeMain : 0;

        const itemCenterMain =
          axis === 'x' ? r.left + r.width / 2 : r.top + r.height / 2;
        const dist = Math.abs(itemCenterMain - centerMain);

        if (ratio >= minVisibleRatio && ratio > bestRatio) {
          bestRatio = ratio;
          bestIdByRatio = el.dataset[itemAttr] ?? null;
        }
        if (dist < nearestDist) {
          nearestDist = dist;
          nearestId = el.dataset[itemAttr] ?? null;
        }
      }
      return bestIdByRatio ?? nearestId ?? null;
    };

    const pickCentered = () => {
      // wait 2 rAFs to let snap/inertia settle and layout repaint
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          const id = computeCentered();
          if (id && id !== lastActiveRef.current) {
            lastActiveRef.current = id;
            onChangeRef.current(id);
          }
        });
      });
    };

    const schedulePick = () => {
      clearTimer();
      timerRef.current = window.setTimeout(pickCentered, settleDelay);
    };

    // Always use scroll (debounced)
    root.addEventListener('scroll', schedulePick, { passive: true });

    // Use scrollend when available (bonus)
    const supportsScrollEnd = 'onscrollend' in document;
    if (supportsScrollEnd) {
      root.addEventListener('scrollend', pickCentered as any);
    }

    // Trackpad/wheel & input end corrections
    root.addEventListener('wheel', schedulePick, { passive: true });
    root.addEventListener('pointerup', schedulePick);
    root.addEventListener('touchend', schedulePick, { passive: true });

    // Layout changes
    window.addEventListener('resize', schedulePick);
    const ro = new ResizeObserver(() => schedulePick());
    ro.observe(root);

    // Initial pick
    pickCentered();

    return () => {
      clearTimer();
      root.removeEventListener('scroll', schedulePick);
      if (supportsScrollEnd)
        root.removeEventListener('scrollend', pickCentered as any);
      root.removeEventListener('wheel', schedulePick);
      root.removeEventListener('pointerup', schedulePick);
      root.removeEventListener('touchend', schedulePick);
      window.removeEventListener('resize', schedulePick);
      ro.disconnect();
    };
  }, [container.current, itemAttr, minVisibleRatio, settleDelay, axis]); // eslint-disable-line

  // Re-pick when item set changes (after layout settles)
  useEffect(() => {
    const root = container.current;
    if (!root) return;
    const id = window.requestAnimationFrame(() => {
      root.dispatchEvent(new Event('scroll'));
    });
    return () => cancelAnimationFrame(id);
  }, [container.current, itemAttr]); // eslint-disable-line
}
