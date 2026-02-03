import { cn } from '@/shared/lib/utils';

interface SelectButtonProps {
  selected: boolean;
  onClick: () => void;
  children: React.ReactNode;
  className?: string;
}

export function SelectButton({
  selected,
  onClick,
  children,
  className
}: SelectButtonProps) {
  return (
    <button
      type='button'
      onClick={onClick}
      className={cn(
        'text-contents-m16 flex h-13 flex-1 items-center justify-center rounded-xl transition-all',
        selected
          ? 'bg-w-100 border-g-90 text-pri border'
          : 'bg-g-10 text-ter border border-transparent',
        className
      )}
    >
      {children}
    </button>
  );
}
