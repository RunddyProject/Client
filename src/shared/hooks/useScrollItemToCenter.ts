import { useCallback } from 'react';

export function useScrollItemToCenter(
  containerRef: React.RefObject<HTMLElement>,
  itemAttr: string = 'uuid'
) {
  return useCallback(
    (id: string) => {
      const container = containerRef.current;
      if (!container) return;

      const sel = `[data-${itemAttr}="${CSS?.escape ? CSS.escape(id) : id}"]`;
      const el = container.querySelector<HTMLElement>(sel);
      if (!el) return;

      const cRect = container.getBoundingClientRect();
      const eRect = el.getBoundingClientRect();
      const containerCenterX = cRect.left + cRect.width / 2;
      const itemCenterX = eRect.left + eRect.width / 2;

      const delta = itemCenterX - containerCenterX;

      container.scrollTo({
        left: container.scrollLeft + delta,
        behavior: 'smooth'
      });
    },
    [containerRef, itemAttr]
  );
}
