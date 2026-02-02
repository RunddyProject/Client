/**
 * Virtual Scroll Hook using TanStack Virtual
 *
 * @description
 * - Virtualizes large lists for improved rendering performance
 * - Only renders visible items in the DOM
 * - Supports both vertical and horizontal scrolling
 * - Provides scroll-to-index functionality
 */

import { useVirtualizer } from '@tanstack/react-virtual';
import { useCallback, useMemo } from 'react';

import type {
  VirtualScrollItem,
  VirtualScrollOptions,
  VirtualScrollRange
} from '@/features/course/model/refactor-types';
import type { Virtualizer } from '@tanstack/react-virtual';
import type { RefObject } from 'react';


export interface UseVirtualScrollOptions extends VirtualScrollOptions {
  /**
   * Function to estimate item size (can be dynamic)
   */
  estimateSize?: (index: number) => number;
  /**
   * Gap between items in pixels
   */
  gap?: number;
}

export interface UseVirtualScrollReturn extends VirtualScrollRange {
  /**
   * Scroll to a specific item index
   */
  scrollTo: (index: number) => void;
  /**
   * Scroll to center a specific item
   */
  scrollToCenter: (index: number) => void;
  /**
   * The virtualizer instance for advanced usage
   */
  virtualizer: Virtualizer<HTMLElement, Element>;
}

/**
 * Virtual scroll implementation using TanStack Virtual
 *
 * @example
 * ```tsx
 * const { visibleItems, totalSize, scrollTo } = useVirtualScroll(
 *   containerRef,
 *   {
 *     itemCount: courses.length,
 *     itemSize: 120,
 *     overscan: 3
 *   }
 * );
 *
 * <div ref={containerRef} style={{ height: '100%', overflow: 'auto' }}>
 *   <div style={{ height: totalSize, position: 'relative' }}>
 *     {visibleItems.map(item => (
 *       <div
 *         key={item.index}
 *         style={{
 *           position: 'absolute',
 *           top: item.start,
 *           height: item.size
 *         }}
 *       >
 *         {courses[item.index].name}
 *       </div>
 *     ))}
 *   </div>
 * </div>
 * ```
 */
export function useVirtualScroll(
  containerRef: RefObject<HTMLElement | null>,
  options: UseVirtualScrollOptions
): UseVirtualScrollReturn {
  const {
    itemCount,
    itemSize,
    overscan = 3,
    orientation = 'vertical',
    estimateSize,
    gap = 0
  } = options;

  // Create virtualizer instance
  const virtualizer = useVirtualizer({
    count: itemCount,
    getScrollElement: () => containerRef.current,
    estimateSize: estimateSize ?? (() => itemSize + gap),
    overscan,
    horizontal: orientation === 'horizontal',
    gap
  });

  // Get virtual items
  const virtualItems = virtualizer.getVirtualItems();

  // Map to our VirtualScrollItem interface
  const visibleItems: VirtualScrollItem[] = useMemo(
    () =>
      virtualItems.map((item) => ({
        index: item.index,
        start: item.start,
        end: item.end,
        size: item.size
      })),
    [virtualItems]
  );

  // Calculate start/end indices
  const startIndex = virtualItems.length > 0 ? virtualItems[0].index : 0;
  const endIndex =
    virtualItems.length > 0 ? virtualItems[virtualItems.length - 1].index : 0;

  // Total size of all items
  const totalSize = virtualizer.getTotalSize();

  // Scroll to specific index
  const scrollTo = useCallback(
    (index: number) => {
      virtualizer.scrollToIndex(index, { align: 'start' });
    },
    [virtualizer]
  );

  // Scroll to center a specific index
  const scrollToCenter = useCallback(
    (index: number) => {
      virtualizer.scrollToIndex(index, { align: 'center' });
    },
    [virtualizer]
  );

  return {
    startIndex,
    endIndex,
    visibleItems,
    totalSize,
    scrollTo,
    scrollToCenter,
    virtualizer
  };
}

export default useVirtualScroll;
