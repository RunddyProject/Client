import { useEffect, useState, type ReactNode } from 'react';

import { cn } from '@/shared/lib/utils';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  type CarouselApi
} from '@/shared/ui/primitives/carousel';

type IndicatorCarouselProps = {
  slides: ReactNode[];
  className?: string;
  autoPlay?: boolean;
  autoPlayInterval?: number;
};

export function IndicatorCarousel({
  slides,
  className,
  autoPlay = false,
  autoPlayInterval = 3000
}: IndicatorCarouselProps) {
  const [carousel, setCarousel] = useState<CarouselApi | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const total = slides.length;

  useEffect(() => {
    if (!carousel) return;
    const updateIndex = () => setCurrentIndex(carousel.selectedScrollSnap());
    updateIndex();
    carousel.on('select', updateIndex);
    return () => {
      carousel.off('select', updateIndex);
    };
  }, [carousel]);

  useEffect(() => {
    if (!carousel || !autoPlay || total <= 1) return;
    const id = setInterval(() => carousel.scrollNext(), autoPlayInterval);
    return () => clearInterval(id);
  }, [carousel, autoPlay, autoPlayInterval, total]);

  return (
    <div className={cn('w-full', className)}>
      <Carousel setApi={setCarousel} className='w-full'>
        <CarouselContent>
          {slides.map((node, i) => (
            <CarouselItem key={i}>
              <div className='relative flex h-full w-full items-center justify-center'>
                {node}
              </div>
            </CarouselItem>
          ))}
        </CarouselContent>
      </Carousel>

      {total > 1 && (
        <div className='mt-12 flex items-center justify-center gap-2'>
          {Array.from({ length: total }).map((_, i) => (
            <button
              key={i}
              aria-label={`Go to slide ${i + 1}`}
              onClick={() => carousel?.scrollTo(i)}
              className={cn(
                'rounded-full transition-all',
                'h-1.5 w-1.5',
                i === currentIndex ? 'bg-gray-500' : 'bg-gray-200'
              )}
            />
          ))}
        </div>
      )}
    </div>
  );
}
