import { useTheme } from 'next-themes';
import { Toaster as Sonner } from 'sonner';

import { Icon } from '@/shared/icons/icon';

import type { ToasterProps } from 'sonner';

export function Toaster(props: ToasterProps) {
  const { theme = 'system' } = useTheme();

  return (
    <Sonner
      theme={theme as ToasterProps['theme']}
      icons={{
        success: (
          <Icon
            name='circle_check_on'
            size={22}
            color='currentColor'
            className='text-runddy-green'
          />
        ),
        error: (
          <Icon
            name='warning'
            size={22}
            color='currentColor'
            className='text-state-error'
          />
        )
      }}
      toastOptions={{
        unstyled: true,
        classNames: {
          toast:
            'rounded-full bg-g-80 text-w-100 shadow-runddy px-5 py-4 flex items-center gap-2.5',
          title: 'text-contents-m15'
        }
      }}
      {...props}
    />
  );
}
